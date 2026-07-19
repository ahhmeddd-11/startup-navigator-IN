import pytest
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from resources.models import Resource, ResourceCategory, ResourceTag
from resources.admin import ResourceAdmin, ResourceCategoryAdmin, ResourceTagAdmin

User = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def staff_user(db) -> User:
    return User.objects.create_superuser(
        email="admin@startup.in",
        full_name="Admin User",
        password="Str0ng!AdminPass1",
    )


@pytest.fixture
def regular_user(db) -> User:
    return User.objects.create_user(
        email="user@startup.in",
        full_name="Regular User",
        password="Str0ng!UserPass1",
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
def sample_category(db) -> ResourceCategory:
    return ResourceCategory.objects.create(name="Compliance", description="Compliance resources")


@pytest.fixture
def sample_tag(db) -> ResourceTag:
    return ResourceTag.objects.create(name="Legal")


@pytest.fixture
def sample_resource(sample_category, sample_tag) -> Resource:
    res = Resource.objects.create(
        title="DPIIT Registration Guide",
        short_description="A guide to registering under Startup India.",
        full_description="Long description here.",
        category=sample_category,
        resource_type="Guide",
        duration="15 min",
        is_published=True,
    )
    res.tags.add(sample_tag)
    return res


# ---------------------------------------------------------------------------
# Models & Slug Generation Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_resource_model_slug_auto_generation(sample_category):
    # Verify that creating a resource without a slug auto-generates it
    res = Resource.objects.create(
        title="My First Guide",
        short_description="Description",
        category=sample_category,
    )
    assert res.slug == "my-first-guide"

    # Verify duplicate slug handling (auto-appends integer suffix)
    res_dup = Resource.objects.create(
        title="My First Guide",
        short_description="Description",
        category=sample_category,
    )
    assert res_dup.slug == "my-first-guide-1"


# ---------------------------------------------------------------------------
# CRUD API Tests (Category, Tag, Resource)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestResourceCRUD:
    def test_get_resources_list(self, api_client, sample_resource):
        url = reverse("resources:resource-list")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        # Check that it returns paginated structure
        assert "results" in resp.data["data"]
        assert len(resp.data["data"]["results"]) == 1

    def test_get_resource_detail(self, api_client, sample_resource):
        url = reverse("resources:resource-detail", kwargs={"slug": sample_resource.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert resp.data["data"]["title"] == sample_resource.title

    def test_create_resource_by_admin(self, staff_client, sample_category, sample_tag):
        url = reverse("resources:resource-list")
        payload = {
            "title": "New Template",
            "short_description": "Short desc",
            "full_description": "Full content",
            "category": sample_category.id,
            "tags": [sample_tag.id],
            "resource_type": "Template",
            "duration": "20 min",
            "is_published": True,
        }
        resp = staff_client.post(url, payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["success"] is True
        assert Resource.objects.filter(title="New Template").exists()

    def test_update_resource_by_admin(self, staff_client, sample_resource):
        url = reverse("resources:resource-detail", kwargs={"slug": sample_resource.slug})
        payload = {"title": "Updated Title"}
        resp = staff_client.patch(url, payload, format="json")
        assert resp.status_code == status.HTTP_200_OK
        sample_resource.refresh_from_db()
        assert sample_resource.title == "Updated Title"

    def test_delete_resource_by_admin(self, staff_client, sample_resource):
        url = reverse("resources:resource-detail", kwargs={"slug": sample_resource.slug})
        resp = staff_client.delete(url)
        assert resp.status_code == status.HTTP_200_OK
        assert not Resource.objects.filter(pk=sample_resource.pk).exists()


# ---------------------------------------------------------------------------
# Search and Filtering Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestResourceSearchAndFilter:
    def test_resource_search(self, api_client, sample_resource, sample_category):
        # Create another resource that shouldn't match search
        Resource.objects.create(
            title="Accounting Spreadsheet",
            short_description="Financial modeling template.",
            category=sample_category,
            is_published=True,
        )

        url = reverse("resources:resource-list")
        # Search matching 'DPIIT'
        resp = api_client.get(url, {"search": "DPIIT"})
        assert resp.status_code == status.HTTP_200_OK
        results = resp.data["data"]["results"]
        assert len(results) == 1
        assert results[0]["title"] == "DPIIT Registration Guide"

    def test_resource_filtering(self, api_client, sample_resource, sample_category, sample_tag):
        # Create a second category and an unpublished featured resource
        cat2 = ResourceCategory.objects.create(name="Growth")
        Resource.objects.create(
            title="User Acquisition Playbook",
            short_description="GTM guide.",
            category=cat2,
            featured=True,
            is_published=True,
        )

        url = reverse("resources:resource-list")

        # Filter by category slug
        resp_cat = api_client.get(url, {"category": "compliance"})
        assert len(resp_cat.data["data"]["results"]) == 1
        assert resp_cat.data["data"]["results"][0]["title"] == "DPIIT Registration Guide"

        # Filter by featured
        resp_feat = api_client.get(url, {"featured": "true"})
        assert len(resp_feat.data["data"]["results"]) == 1
        assert resp_feat.data["data"]["results"][0]["title"] == "User Acquisition Playbook"


# ---------------------------------------------------------------------------
# Permissions Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestResourcePermissions:
    def test_anonymous_cannot_create_resource(self, api_client, sample_category):
        url = reverse("resources:resource-list")
        resp = api_client.post(url, {"title": "X", "category": sample_category.id})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_regular_user_cannot_create_resource(self, user_client, sample_category):
        url = reverse("resources:resource-list")
        resp = user_client.post(url, {"title": "X", "category": sample_category.id})
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_draft_resource_invisible_to_public(self, api_client, sample_category):
        # Create a draft resource
        res = Resource.objects.create(
            title="Draft Document",
            short_description="Not published.",
            category=sample_category,
            is_published=False,
        )
        url = reverse("resources:resource-detail", kwargs={"slug": res.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Admin Panel Verification Tests
# ---------------------------------------------------------------------------

def test_admin_registration():
    assert admin.site.is_registered(Resource)
    assert admin.site.is_registered(ResourceCategory)
    assert admin.site.is_registered(ResourceTag)
    assert isinstance(admin.site._registry[Resource], ResourceAdmin)
    assert isinstance(admin.site._registry[ResourceCategory], ResourceCategoryAdmin)
    assert isinstance(admin.site._registry[ResourceTag], ResourceTagAdmin)
