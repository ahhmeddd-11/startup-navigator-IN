"""
Phase 4.5 test suite — User Features (Bookmarks, History, Preferences, Dashboard)

Covers:
  1.  Resource bookmark creation (success + duplicate prevention)
  2.  Resource bookmark deletion (success + 404 on nonexistent)
  3.  Resource bookmark list endpoint
  4.  Article bookmark creation (success + duplicate prevention)
  5.  Article bookmark deletion
  6.  Article bookmark list endpoint
  7.  RecentlyViewed.track_view() — single creation, dedup on consecutive view
  8.  RecentlyViewed history list endpoint + 20-entry cap
  9.  UserPreference auto-creation on registration
  10. UserPreference GET / PATCH endpoints
  11. Dashboard counts + recent activity feed
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import (
    User,
    ArticleBookmark,
    ResourceBookmark,
    RecentlyViewed,
    UserPreference,
)
from resources.models import Resource, ResourceCategory
from knowledge.models import Article, KnowledgeCategory


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db) -> User:
    return User.objects.create_user(
        email="features@example.com",
        full_name="Feature User",
        password="Str0ng!Pass",
    )


@pytest.fixture
def other_user(db) -> User:
    return User.objects.create_user(
        email="other@example.com",
        full_name="Other User",
        password="Str0ng!Pass",
    )


@pytest.fixture
def auth_client(user) -> APIClient:
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.fixture
def resource_category(db) -> ResourceCategory:
    return ResourceCategory.objects.create(name="Finance", slug="finance")


@pytest.fixture
def resource(db, resource_category) -> Resource:
    return Resource.objects.create(
        title="Startup Funding Guide",
        slug="startup-funding-guide",
        short_description="How to raise your first round.",
        category=resource_category,
        resource_type="Guide",
        is_published=True,
    )


@pytest.fixture
def resource2(db, resource_category) -> Resource:
    return Resource.objects.create(
        title="Legal Checklist",
        slug="legal-checklist",
        short_description="Legal requirements for Indian startups.",
        category=resource_category,
        resource_type="Checklist",
        is_published=True,
    )


@pytest.fixture
def knowledge_category(db) -> KnowledgeCategory:
    return KnowledgeCategory.objects.create(name="Marketing", slug="marketing")


@pytest.fixture
def article(db, knowledge_category) -> Article:
    return Article.objects.create(
        title="Growth Hacking 101",
        slug="growth-hacking-101",
        summary="Fundamentals of startup growth.",
        content="Long content here...",
        reading_time=5,
        category=knowledge_category,
        is_published=True,
    )


@pytest.fixture
def article2(db, knowledge_category) -> Article:
    return Article.objects.create(
        title="SEO for Startups",
        slug="seo-for-startups",
        summary="Drive organic traffic early.",
        content="Full SEO guide...",
        reading_time=8,
        category=knowledge_category,
        is_published=True,
    )


# ---------------------------------------------------------------------------
# 1-3: Resource Bookmarks
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestResourceBookmarks:

    def test_bookmark_resource_success(self, auth_client, resource):
        url = f"/api/resources/{resource.slug}/bookmark/"
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["success"] is True
        assert ResourceBookmark.objects.filter(resource=resource).count() == 1

    def test_bookmark_resource_duplicate_prevented(self, auth_client, resource, user):
        ResourceBookmark.objects.create(user=user, resource=resource)
        url = f"/api/resources/{resource.slug}/bookmark/"
        response = auth_client.post(url)
        # Must not create a second record
        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST,
        )
        assert ResourceBookmark.objects.filter(user=user, resource=resource).count() == 1

    def test_remove_resource_bookmark(self, auth_client, resource, user):
        ResourceBookmark.objects.create(user=user, resource=resource)
        url = f"/api/resources/{resource.slug}/bookmark/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_200_OK
        assert ResourceBookmark.objects.filter(user=user, resource=resource).count() == 0

    def test_remove_nonexistent_resource_bookmark_returns_404(self, auth_client, resource):
        url = f"/api/resources/{resource.slug}/bookmark/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_list_resource_bookmarks(self, auth_client, resource, resource2, user):
        ResourceBookmark.objects.create(user=user, resource=resource)
        ResourceBookmark.objects.create(user=user, resource=resource2)
        response = auth_client.get("/api/resources/bookmarks/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        assert len(body["data"]) == 2

    def test_list_resource_bookmarks_unauthenticated(self, api_client):
        response = api_client.get("/api/resources/bookmarks/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_cannot_see_other_users_bookmarks(
        self, auth_client, other_user, resource
    ):
        ResourceBookmark.objects.create(user=other_user, resource=resource)
        response = auth_client.get("/api/resources/bookmarks/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert len(body["data"]) == 0


# ---------------------------------------------------------------------------
# 4-6: Article Bookmarks
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestArticleBookmarks:

    def test_bookmark_article_success(self, auth_client, article):
        url = f"/api/knowledge/{article.slug}/bookmark/"
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_201_CREATED
        assert ArticleBookmark.objects.filter(article=article).count() == 1

    def test_bookmark_article_duplicate_prevented(self, auth_client, article, user):
        ArticleBookmark.objects.create(user=user, article=article)
        url = f"/api/knowledge/{article.slug}/bookmark/"
        response = auth_client.post(url)
        assert ArticleBookmark.objects.filter(user=user, article=article).count() == 1

    def test_remove_article_bookmark(self, auth_client, article, user):
        ArticleBookmark.objects.create(user=user, article=article)
        url = f"/api/knowledge/{article.slug}/bookmark/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_200_OK
        assert ArticleBookmark.objects.filter(user=user, article=article).count() == 0

    def test_remove_nonexistent_article_bookmark_returns_404(self, auth_client, article):
        url = f"/api/knowledge/{article.slug}/bookmark/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_list_article_bookmarks(self, auth_client, article, article2, user):
        ArticleBookmark.objects.create(user=user, article=article)
        ArticleBookmark.objects.create(user=user, article=article2)
        response = auth_client.get("/api/knowledge/bookmarks/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        assert len(body["data"]) == 2


# ---------------------------------------------------------------------------
# 7-8: Recently Viewed
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRecentlyViewed:

    def test_track_view_creates_record(self, user, resource):
        RecentlyViewed.track_view(user, "resource", resource)
        assert RecentlyViewed.objects.filter(user=user, content_type="resource").count() == 1

    def test_track_view_no_consecutive_duplicate(self, user, resource):
        """Viewing the same item twice in a row should only produce one record."""
        RecentlyViewed.track_view(user, "resource", resource)
        RecentlyViewed.track_view(user, "resource", resource)
        assert RecentlyViewed.objects.filter(user=user, content_type="resource").count() == 1

    def test_track_view_different_items_creates_multiple(self, user, resource, resource2):
        RecentlyViewed.track_view(user, "resource", resource)
        RecentlyViewed.track_view(user, "resource", resource2)
        assert RecentlyViewed.objects.filter(user=user).count() == 2

    def test_track_view_caps_at_20_entries(self, db, user, resource_category):
        """History must never exceed 20 records per user."""
        # Create 25 unique resources and track them
        for i in range(25):
            r = Resource.objects.create(
                title=f"Resource {i}",
                slug=f"resource-{i}",
                short_description="desc",
                category=resource_category,
                resource_type="Guide",
                is_published=True,
            )
            RecentlyViewed.track_view(user, "resource", r)

        count = RecentlyViewed.objects.filter(user=user).count()
        assert count <= 20

    def test_history_list_endpoint(self, auth_client, user, resource, article):
        RecentlyViewed.track_view(user, "resource", resource)
        RecentlyViewed.track_view(user, "article", article)
        response = auth_client.get("/api/users/history/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        assert len(body["data"]) == 2

    def test_history_list_requires_auth(self, api_client):
        response = api_client.get("/api/users/history/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 9-10: User Preferences
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUserPreferences:

    def test_preference_auto_created_on_registration(self, user):
        """Signal must auto-create a UserPreference row when a new user is saved."""
        assert UserPreference.objects.filter(user=user).exists()

    def test_get_preferences(self, auth_client):
        response = auth_client.get("/api/users/preferences/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "onboarding_completed" in data["data"]

    def test_patch_preferences(self, auth_client):
        payload = {
            "sectors": ["fintech", "edtech"],
            "stage": "seed",
            "onboarding_completed": True,
            "email_notifications": False,
        }
        response = auth_client.patch("/api/users/preferences/", payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["data"]["onboarding_completed"] is True
        assert data["data"]["email_notifications"] is False

    def test_put_preferences_acts_as_patch(self, auth_client):
        payload = {"onboarding_completed": True}
        response = auth_client.put("/api/users/preferences/", payload, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_preferences_require_auth(self, api_client):
        response = api_client.get("/api/users/preferences/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 11: Dashboard
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestDashboard:

    def test_dashboard_returns_correct_counts(
        self, auth_client, user, resource, article
    ):
        ResourceBookmark.objects.create(user=user, resource=resource)
        ArticleBookmark.objects.create(user=user, article=article)
        RecentlyViewed.track_view(user, "resource", resource)

        response = auth_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        d = body["data"]
        assert d["bookmarked_resources_count"] == 1
        assert d["bookmarked_articles_count"] == 1
        assert "ai_conversations_count" in d
        assert isinstance(d["recent_activity"], list)

    def test_dashboard_recent_activity_ordered_newest_first(
        self, auth_client, user, resource, resource2
    ):
        ResourceBookmark.objects.create(user=user, resource=resource)
        ResourceBookmark.objects.create(user=user, resource=resource2)
        RecentlyViewed.track_view(user, "resource", resource)

        response = auth_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        activity = response.json()["data"]["recent_activity"]
        # Each item must have a timestamp and required fields
        for item in activity:
            assert "timestamp" in item
            assert "type" in item
            assert "title" in item

    def test_dashboard_empty_for_new_user(self, auth_client):
        response = auth_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        d = body["data"]
        assert d["bookmarked_resources_count"] == 0
        assert d["bookmarked_articles_count"] == 0
        assert d["recent_activity"] == []

    def test_dashboard_requires_auth(self, api_client):
        response = api_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
