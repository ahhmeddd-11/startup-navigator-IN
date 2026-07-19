"""
Authentication test suite for the users application.

Covers all 9 verification points from the Phase 4.2 spec:
  1.  Registration (success + duplicate email)
  2.  Login (success + wrong password + nonexistent user)
  3.  JWT token generation
  4.  JWT refresh
  5.  Profile retrieval (authenticated + anonymous)
  6.  Profile update (PATCH)
  7.  Password change (success + wrong current password)
  8.  Unauthorized access on protected endpoints
  9.  Invalid token handling
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def api_client() -> APIClient:
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user_data() -> dict:
    """Valid registration payload."""
    return {
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "Str0ng!Pass",
        "confirm_password": "Str0ng!Pass",
    }


@pytest.fixture
def created_user(db) -> User:
    """A persisted, active user for use in authenticated tests."""
    return User.objects.create_user(
        email="existing@example.com",
        full_name="Existing User",
        password="Str0ng!Pass",
    )


@pytest.fixture
def auth_client(created_user) -> APIClient:
    """API client pre-authenticated with a valid JWT access token."""
    ac = APIClient()
    refresh = RefreshToken.for_user(created_user)
    ac.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return ac


@pytest.fixture
def refresh_token(created_user) -> str:
    """A valid refresh token for `created_user`."""
    return str(RefreshToken.for_user(created_user))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _url(name: str) -> str:
    return reverse(f"auth:{name}")


# ---------------------------------------------------------------------------
# 1 & 3 — Registration + JWT generation
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRegister:
    def test_register_success_returns_201(self, api_client, user_data):
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["success"] is True
        assert "tokens" in resp.data["data"]
        assert "access" in resp.data["data"]["tokens"]
        assert "refresh" in resp.data["data"]["tokens"]

    def test_register_creates_user_in_db(self, api_client, user_data):
        api_client.post(_url("register"), user_data, format="json")
        assert User.objects.filter(email="testuser@example.com").exists()

    def test_register_password_not_returned(self, api_client, user_data):
        resp = api_client.post(_url("register"), user_data, format="json")
        user_data_returned = resp.data["data"]["user"]
        assert "password" not in user_data_returned

    def test_register_duplicate_email_returns_400(self, api_client, user_data, created_user):
        user_data["email"] = created_user.email
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert resp.data["success"] is False

    def test_register_password_mismatch_returns_400(self, api_client, user_data):
        user_data["confirm_password"] = "DifferentPass1!"
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password_returns_400(self, api_client, user_data):
        user_data["password"] = "password"
        user_data["confirm_password"] = "password"
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_email_returns_400(self, api_client, user_data):
        user_data.pop("email")
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_invalid_email_returns_400(self, api_client, user_data):
        user_data["email"] = "not-an-email"
        resp = api_client.post(_url("register"), user_data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# 2 — Login
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogin:
    def test_login_success_returns_200(self, api_client, created_user):
        resp = api_client.post(
            _url("login"),
            {"email": created_user.email, "password": "Str0ng!Pass"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_login_returns_jwt_pair(self, api_client, created_user):
        resp = api_client.post(
            _url("login"),
            {"email": created_user.email, "password": "Str0ng!Pass"},
            format="json",
        )
        tokens = resp.data["data"]["tokens"]
        assert "access" in tokens
        assert "refresh" in tokens

    def test_login_wrong_password_returns_401(self, api_client, created_user):
        resp = api_client.post(
            _url("login"),
            {"email": created_user.email, "password": "WrongPass1!"},
            format="json",
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
        assert resp.data["success"] is False

    def test_login_nonexistent_user_returns_401(self, api_client):
        resp = api_client.post(
            _url("login"),
            {"email": "nobody@example.com", "password": "Str0ng!Pass"},
            format="json",
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields_returns_401(self, api_client):
        resp = api_client.post(_url("login"), {}, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 4 — JWT Refresh
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTokenRefresh:
    def test_refresh_returns_new_access_token(self, api_client, refresh_token):
        resp = api_client.post(
            _url("token_refresh"),
            {"refresh": refresh_token},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert "access" in resp.data["data"]

    def test_refresh_with_invalid_token_returns_401(self, api_client):
        resp = api_client.post(
            _url("token_refresh"),
            {"refresh": "invalid.token.value"},
            format="json",
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
        assert resp.data["success"] is False

    def test_refresh_with_missing_token_returns_400(self, api_client):
        resp = api_client.post(_url("token_refresh"), {}, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# 5 — Profile retrieval
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestProfileRetrieve:
    def test_get_profile_authenticated_returns_200(self, auth_client, created_user):
        resp = auth_client.get(_url("profile"))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert resp.data["data"]["email"] == created_user.email

    def test_get_profile_anonymous_returns_401(self, api_client):
        resp = api_client.get(_url("profile"))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_does_not_expose_password(self, auth_client):
        resp = auth_client.get(_url("profile"))
        assert "password" not in resp.data["data"]


# ---------------------------------------------------------------------------
# 6 — Profile update (PATCH)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestProfileUpdate:
    def test_patch_full_name_returns_200(self, auth_client, created_user):
        resp = auth_client.patch(
            _url("profile"),
            {"full_name": "Updated Name"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["data"]["full_name"] == "Updated Name"

    def test_patch_persists_to_db(self, auth_client, created_user):
        auth_client.patch(
            _url("profile"),
            {"full_name": "Persisted Name"},
            format="json",
        )
        created_user.refresh_from_db()
        assert created_user.full_name == "Persisted Name"

    def test_patch_email_is_ignored(self, auth_client, created_user):
        original_email = created_user.email
        resp = auth_client.patch(
            _url("profile"),
            {"email": "changed@example.com"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        created_user.refresh_from_db()
        assert created_user.email == original_email

    def test_patch_anonymous_returns_401(self, api_client):
        resp = api_client.patch(_url("profile"), {"full_name": "X"}, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 7 — Password change
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestChangePassword:
    def test_change_password_success_returns_200(self, auth_client):
        resp = auth_client.post(
            _url("change_password"),
            {
                "current_password": "Str0ng!Pass",
                "new_password": "NewStr0ng!Pass",
                "confirm_new_password": "NewStr0ng!Pass",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_change_password_hashes_new_password(self, auth_client, created_user):
        auth_client.post(
            _url("change_password"),
            {
                "current_password": "Str0ng!Pass",
                "new_password": "NewStr0ng!Pass",
                "confirm_new_password": "NewStr0ng!Pass",
            },
            format="json",
        )
        created_user.refresh_from_db()
        assert created_user.check_password("NewStr0ng!Pass")

    def test_change_password_wrong_current_returns_400(self, auth_client):
        resp = auth_client.post(
            _url("change_password"),
            {
                "current_password": "WrongPass1!",
                "new_password": "NewStr0ng!Pass",
                "confirm_new_password": "NewStr0ng!Pass",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert resp.data["success"] is False

    def test_change_password_mismatch_returns_400(self, auth_client):
        resp = auth_client.post(
            _url("change_password"),
            {
                "current_password": "Str0ng!Pass",
                "new_password": "NewStr0ng!Pass",
                "confirm_new_password": "Different1!Pass",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_same_as_current_returns_400(self, auth_client):
        resp = auth_client.post(
            _url("change_password"),
            {
                "current_password": "Str0ng!Pass",
                "new_password": "Str0ng!Pass",
                "confirm_new_password": "Str0ng!Pass",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_anonymous_returns_401(self, api_client):
        resp = api_client.post(_url("change_password"), {}, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 8 — Unauthorized access on all protected endpoints
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUnauthorizedAccess:
    PROTECTED_ENDPOINTS = [
        ("get", "profile"),
        ("patch", "profile"),
        ("post", "logout"),
        ("post", "change_password"),
    ]

    @pytest.mark.parametrize("method,name", PROTECTED_ENDPOINTS)
    def test_unauthenticated_request_returns_401(self, client, method, name):
        call = getattr(client, method)
        resp = call(_url(name), {}, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# 9 — Invalid token handling
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestInvalidToken:
    def test_tampered_access_token_returns_401(self, api_client):
        api_client.credentials(HTTP_AUTHORIZATION="Bearer tampered.invalid.token")
        resp = api_client.get(_url("profile"))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_expired_format_token_returns_401(self, api_client):
        api_client.credentials(HTTP_AUTHORIZATION="Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIn0.invalid")
        resp = api_client.get(_url("profile"))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_no_bearer_prefix_returns_401(self, api_client, created_user):
        refresh = RefreshToken.for_user(created_user)
        api_client.credentials(HTTP_AUTHORIZATION=str(refresh.access_token))
        resp = api_client.get(_url("profile"))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_verify_invalid_token_returns_401(self, api_client):
        resp = api_client.post(
            _url("token_verify"),
            {"token": "completely.invalid.token"},
            format="json",
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_with_invalid_refresh_returns_400(self, auth_client):
        resp = auth_client.post(
            _url("logout"),
            {"refresh": "bad.refresh.token"},
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
