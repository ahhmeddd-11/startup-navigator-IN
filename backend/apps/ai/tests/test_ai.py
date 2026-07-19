import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from ai.models import AIConversation, AIInteraction, AIUsageLog
from users.models import User


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    """Sets a mock GEMINI_API_KEY in the environment for tests."""
    monkeypatch.setenv("GEMINI_API_KEY", "test_mock_key")


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def auth_user(db) -> User:
    return User.objects.create_user(
        email="founder@startup.in",
        full_name="Priya Mehta",
        password="Str0ng!Pass123",
    )


@pytest.fixture
def auth_client(auth_user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=auth_user)
    return client


# Mock response payload matching Gemini API structure
GEMINI_MOCK_SUCCESS_BODY = {
    "candidates": [
        {
            "content": {
                "parts": [
                    {"text": "Mock AI Response Text content from Gemini."}
                ]
            }
        }
    ]
}


# ---------------------------------------------------------------------------
# API Success Tests (with Mocked requests.post)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@patch("requests.post")
def test_idea_validation_success(mock_post, auth_client, auth_user):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = GEMINI_MOCK_SUCCESS_BODY

    url = reverse("ai:validate_idea")
    payload = {
        "idea": "An AI platform for validating Indian government agricultural schemes.",
        "target_market": "Early-stage Agritech founders.",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["success"] is True
    assert "response" in resp.data["data"]
    assert resp.data["data"]["response"] == "Mock AI Response Text content from Gemini."

    # Validate database records are created
    assert AIConversation.objects.filter(user=auth_user).exists()
    assert AIInteraction.objects.filter(prompt_type="idea_validation").exists()
    assert AIUsageLog.objects.filter(prompt_type="idea_validation", status_code=200).exists()


@pytest.mark.django_db
@patch("requests.post")
def test_business_model_success(mock_post, auth_client, auth_user):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = GEMINI_MOCK_SUCCESS_BODY

    url = reverse("ai:business_model")
    payload = {
        "business_description": "A B2B SaaS platform for GST billing automation.",
        "stage": "Pre-seed",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["success"] is True
    assert AIInteraction.objects.filter(prompt_type="business_model").exists()


@pytest.mark.django_db
@patch("requests.post")
def test_funding_guidance_success(mock_post, auth_client, auth_user):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = GEMINI_MOCK_SUCCESS_BODY

    url = reverse("ai:funding_guide")
    payload = {
        "stage": "Seed Stage",
        "funding_needed": "₹50 Lakhs",
        "industry": "Fintech",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["success"] is True
    assert AIInteraction.objects.filter(prompt_type="funding").exists()


@pytest.mark.django_db
@patch("requests.post")
def test_government_schemes_success(mock_post, auth_client, auth_user):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = GEMINI_MOCK_SUCCESS_BODY

    url = reverse("ai:government_schemes")
    payload = {
        "startup_details": "A clean tech recycling startup utilizing IoT sensors.",
        "sector": "Waste Management",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["success"] is True
    assert AIInteraction.objects.filter(prompt_type="government_schemes").exists()


@pytest.mark.django_db
@patch("requests.post")
def test_chat_qa_new_thread_success(mock_post, auth_client, auth_user):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = GEMINI_MOCK_SUCCESS_BODY

    url = reverse("ai:chat")
    payload = {
        "message": "How do I incorporate a Private Limited company in India?",
        "context": "Early stages",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["success"] is True
    assert "conversation_id" in resp.data["data"]

    # Save created conversation
    conv_id = resp.data["data"]["conversation_id"]

    # Call again with conversation thread context
    payload_thread = {
        "message": "What is the capital requirement for that?",
        "conversation_id": conv_id,
    }
    resp_thread = auth_client.post(url, payload_thread, format="json")
    assert resp_thread.status_code == status.HTTP_200_OK
    assert resp_thread.data["data"]["conversation_id"] == conv_id


# ---------------------------------------------------------------------------
# API Failure & Error Handling Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@patch("requests.post")
def test_ai_provider_rate_limit_429(mock_post, auth_client):
    mock_post.return_value.status_code = 429
    mock_post.return_value.text = "Rate Limit Exceeded"

    url = reverse("ai:validate_idea")
    payload = {
        "idea": "An AI platform for validating Indian government agricultural schemes.",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert resp.data["success"] is False
    # Check that usage log recorded status 500 error on provider 429
    assert AIUsageLog.objects.filter(status_code=500).exists()


@pytest.mark.django_db
@patch("requests.post")
def test_ai_provider_timeout(mock_post, auth_client):
    import requests
    mock_post.side_effect = requests.Timeout("Connection timed out")

    url = reverse("ai:validate_idea")
    payload = {
        "idea": "An AI platform for validating Indian government agricultural schemes.",
    }

    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert resp.data["success"] is False


# ---------------------------------------------------------------------------
# Validation Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_invalid_validation_payload(auth_client):
    url = reverse("ai:validate_idea")
    # 'idea' field is too short (min length 10)
    resp = auth_client.post(url, {"idea": "short"}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.data["success"] is False


@pytest.mark.django_db
def test_chat_nonexistent_thread_id(auth_client):
    url = reverse("ai:chat")
    resp = auth_client.post(url, {"message": "Hello", "conversation_id": 9999}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.data["success"] is False


# ---------------------------------------------------------------------------
# Authentication Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_anonymous_requests_are_denied(api_client):
    endpoints = [
        reverse("ai:validate_idea"),
        reverse("ai:business_model"),
        reverse("ai:funding_guide"),
        reverse("ai:government_schemes"),
        reverse("ai:chat"),
        reverse("ai:conversation_list"),
    ]
    for url in endpoints:
        resp = api_client.post(url, {}, format="json") if url != reverse("ai:conversation_list") else api_client.get(url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
