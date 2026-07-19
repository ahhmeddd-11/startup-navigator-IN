"""
URL configuration for the users / authentication application.

All routes are mounted under /api/auth/ by config/urls.py.
"""
from django.urls import path

from .views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
    TokenRefreshView,
    TokenVerifyView,
)

app_name = "users"

urlpatterns = [
    # Public endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Authenticated endpoints
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]
