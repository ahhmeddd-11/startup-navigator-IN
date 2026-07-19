import pytest
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from knowledge.models import Article, KnowledgeCategory, KnowledgeTag
from knowledge.admin import ArticleAdmin, KnowledgeCategoryAdmin, KnowledgeTagAdmin

User = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def staff_user(db) -> User:
    return User.objects.create_superuser(
        email="admin2@startup.in",
        full_name="Admin User 2",
        password="Str0ng!AdminPass2",
    )


@pytest.fixture
def regular_user(db) -> User:
    return User.objects.create_user(
        email="user2@startup.in",
        full_name="Regular User 2",
        password="Str0ng!UserPass2",
    )


@pytest.fixture
def staff_client(staff_user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=staff_user)
    return client


@pytest.fixture
def user_client(regular_user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def sample_category(db) -> KnowledgeCategory:
    return KnowledgeCategory.objects.create(
        name="Incorporation", description="Incorporation processes"
    )


@pytest.fixture
def sample_tag(db) -> KnowledgeTag:
    return KnowledgeTag.objects.create(name="DPIIT")


@pytest.fixture
def sample_article(sample_category, sample_tag) -> Article:
    art = Article.objects.create(
        title="DPIIT Recognition Explained",
        summary="A practical walkthrough of DPIIT.",
        content="Detailed article content about Startup India recognition.",
        reading_time=9,
        category=sample_category,
        is_published=True,
    )
    art.tags.add(sample_tag)
    return art


# ---------------------------------------------------------------------------
# Models & Slug Generation Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_knowledge_model_slug_auto_generation(sample_category):
    # Verify slug generation
    art = Article.objects.create(
        title="My First Article",
        summary="Summary",
        content="Content",
        reading_time=5,
        category=sample_category,
    )
    assert art.slug == "my-first-article"

    # Verify duplicate slug handling
    art_dup = Article.objects.create(
        title="My First Article",
        summary="Summary",
        content="Content",
        reading_time=5,
        category=sample_category,
    )
    assert art_dup.slug == "my-first-article-1"


# ---------------------------------------------------------------------------
# CRUD API Tests (Category, Tag, Article)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestKnowledgeCRUD:
    def test_get_articles_list(self, api_client, sample_article):
        url = reverse("knowledge:article-list")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert "results" in resp.data["data"]
        assert len(resp.data["data"]["results"]) == 1

    def test_get_article_detail(self, api_client, sample_article):
        url = reverse("knowledge:article-detail", kwargs={"slug": sample_article.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert resp.data["data"]["title"] == sample_article.title

    def test_create_article_by_admin(self, staff_client, sample_category, sample_tag):
        url = reverse("knowledge:article-list")
        payload = {
            "title": "New Article",
            "summary": "Summary text",
            "content": "Rich content text",
            "reading_time": 10,
            "category": sample_category.id,
            "tags": [sample_tag.id],
            "is_published": True,
        }
        resp = staff_client.post(url, payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["success"] is True
        assert Article.objects.filter(title="New Article").exists()

    def test_update_article_by_admin(self, staff_client, sample_article):
        url = reverse("knowledge:article-detail", kwargs={"slug": sample_article.slug})
        payload = {"title": "Updated Title"}
        resp = staff_client.patch(url, payload, format="json")
        assert resp.status_code == status.HTTP_200_OK
        sample_article.refresh_from_db()
        assert sample_article.title == "Updated Title"

    def test_delete_article_by_admin(self, staff_client, sample_article):
        url = reverse("knowledge:article-detail", kwargs={"slug": sample_article.slug})
        resp = staff_client.delete(url)
        assert resp.status_code == status.HTTP_200_OK
        assert not Article.objects.filter(pk=sample_article.pk).exists()


# ---------------------------------------------------------------------------
# Search and Filtering Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestKnowledgeSearchAndFilter:
    def test_article_search(self, api_client, sample_article, sample_category):
        # Create another article
        Article.objects.create(
            title="GST Basics for Founders",
            summary="GST thresholds.",
            content="Details about GSTR-1 and GSTR-3B filings.",
            reading_time=7,
            category=sample_category,
            is_published=True,
        )

        url = reverse("knowledge:article-list")
        # Search matching 'filings'
        resp = api_client.get(url, {"search": "filings"})
        assert resp.status_code == status.HTTP_200_OK
        results = resp.data["data"]["results"]
        assert len(results) == 1
        assert results[0]["title"] == "GST Basics for Founders"

    def test_article_filtering(self, api_client, sample_article, sample_category):
        # Create a second category and a featured article
        cat2 = KnowledgeCategory.objects.create(name="Growth")
        Article.objects.create(
            title="Unit Economics",
            summary="CAC and LTV modeling.",
            content="Spreadsheets.",
            reading_time=12,
            category=cat2,
            featured=True,
            is_published=True,
        )

        url = reverse("knowledge:article-list")

        # Filter by category slug
        resp_cat = api_client.get(url, {"category": "growth"})
        assert len(resp_cat.data["data"]["results"]) == 1
        assert resp_cat.data["data"]["results"][0]["title"] == "Unit Economics"

        # Filter by featured
        resp_feat = api_client.get(url, {"featured": "true"})
        assert len(resp_feat.data["data"]["results"]) == 1
        assert resp_feat.data["data"]["results"][0]["title"] == "Unit Economics"


# ---------------------------------------------------------------------------
# Permissions Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestKnowledgePermissions:
    def test_anonymous_cannot_create_article(self, api_client, sample_category):
        url = reverse("knowledge:article-list")
        resp = api_client.post(url, {"title": "X", "category": sample_category.id})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_regular_user_cannot_create_article(self, user_client, sample_category):
        url = reverse("knowledge:article-list")
        resp = user_client.post(url, {"title": "X", "category": sample_category.id})
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_draft_article_invisible_to_public(self, api_client, sample_category):
        # Create a draft article
        art = Article.objects.create(
            title="Draft Post",
            summary="Not published.",
            content="Draft",
            reading_time=4,
            category=sample_category,
            is_published=False,
        )
        url = reverse("knowledge:article-detail", kwargs={"slug": art.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Admin Panel Verification Tests
# ---------------------------------------------------------------------------

def test_admin_registration():
    assert admin.site.is_registered(Article)
    assert admin.site.is_registered(KnowledgeCategory)
    assert admin.site.is_registered(KnowledgeTag)
    assert isinstance(admin.site._registry[Article], ArticleAdmin)
    assert isinstance(admin.site._registry[KnowledgeCategory], KnowledgeCategoryAdmin)
    assert isinstance(admin.site._registry[KnowledgeTag], KnowledgeTagAdmin)
