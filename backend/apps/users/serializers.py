"""
Serializers for the users application.

Four serializers are defined here:

1. RegisterSerializer     — new user registration with password validation.
2. LoginSerializer        — credential validation + JWT token generation.
3. UserProfileSerializer  — read/partial-update of the user's own profile.
4. ChangePasswordSerializer — authenticated password change with current-password check.
"""
import re

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_password_strength(password: str) -> str:
    """
    Apply Django's built-in AUTH_PASSWORD_VALIDATORS *and* enforce that
    the password contains at least one uppercase letter, one digit, and
    one special character.

    Raises serializers.ValidationError on failure.
    """
    # Run Django's configured validators (MinimumLength, CommonPassword, etc.)
    try:
        validate_password(password)
    except Exception as exc:
        raise serializers.ValidationError(list(exc.messages)) from exc

    # Additional strength rules
    if not re.search(r"[A-Z]", password):
        raise serializers.ValidationError(
            _("Password must contain at least one uppercase letter.")
        )
    if not re.search(r"\d", password):
        raise serializers.ValidationError(
            _("Password must contain at least one digit.")
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", password):
        raise serializers.ValidationError(
            _("Password must contain at least one special character.")
        )
    return password


# ---------------------------------------------------------------------------
# 1. Registration
# ---------------------------------------------------------------------------

class RegisterSerializer(serializers.ModelSerializer):
    """
    Validates and creates a new user account.

    Fields
    ------
    email            Required; must be unique.
    full_name        Optional display name.
    password         Validated for strength.
    confirm_password Must match password; write-only, never stored.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ("email", "full_name", "password", "confirm_password")

    def validate_email(self, value: str) -> str:
        """Normalise to lowercase and check uniqueness."""
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                _("A user with this email already exists.")
            )
        return value

    def validate_password(self, value: str) -> str:
        return _validate_password_strength(value)

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": _("Passwords do not match.")}
            )
        return attrs

    def create(self, validated_data: dict) -> User:
        # Remove the confirmation field before passing to the manager
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)


# ---------------------------------------------------------------------------
# 2. Login
# ---------------------------------------------------------------------------

class LoginSerializer(serializers.Serializer):
    """
    Validates login credentials and returns JWT tokens.

    The tokens are attached to `validated_data` after a successful
    call to `is_valid()`, so the view can access them without
    an extra database query.
    """

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs: dict) -> dict:
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password", "")

        user = authenticate(
            request=self.context.get("request"),
            username=email,   # authenticate() maps USERNAME_FIELD → 'username' kwarg
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                _("Invalid email or password. Please try again.")
            )

        if not user.is_active:
            raise serializers.ValidationError(
                _("This account has been deactivated.")
            )

        # Generate JWT token pair
        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


# ---------------------------------------------------------------------------
# 3. User Profile
# ---------------------------------------------------------------------------

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializes the authenticated user's public profile.

    Email is read-only after registration to prevent account
    hijacking via email change (a separate endpoint with verification
    should handle that in the future).
    """

    email = serializers.EmailField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "date_joined", "last_login", "is_staff", "is_superuser")
        read_only_fields = ("id", "email", "date_joined", "last_login", "is_staff", "is_superuser")


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "date_joined", "last_login", "is_staff", "is_superuser", "is_active")
        read_only_fields = ("id", "email", "date_joined", "last_login")


# ---------------------------------------------------------------------------
# 4. Change Password
# ---------------------------------------------------------------------------

class ChangePasswordSerializer(serializers.Serializer):
    """
    Validates and applies a password change for an authenticated user.

    Requires the user's current password to prevent account takeover
    if a session is somehow compromised.
    """

    current_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_new_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_new_password(self, value: str) -> str:
        return _validate_password_strength(value)

    def validate(self, attrs: dict) -> dict:
        user: User = self.context["request"].user

        # Verify the user knows their current password
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {"current_password": _("Current password is incorrect.")}
            )

        # Ensure new passwords match
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": _("New passwords do not match.")}
            )

        # Prevent reuse of the same password
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": _("New password must differ from the current password.")}
            )

        return attrs

    def save(self, **kwargs) -> User:
        """Hash and persist the new password, then return the updated user."""
        user: User = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


# ---------------------------------------------------------------------------
# Additional Profile Feature Serializers
# ---------------------------------------------------------------------------
from .models import UserPreference, ResourceBookmark, ArticleBookmark, RecentlyViewed, ContactMessage
from resources.serializers import ResourceListSerializer
from knowledge.serializers import ArticleListSerializer


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ("sectors", "stage", "onboarding_completed", "email_notifications")


class ResourceBookmarkSerializer(serializers.ModelSerializer):
    resource = ResourceListSerializer(read_only=True)

    class Meta:
        model = ResourceBookmark
        fields = ("id", "resource", "created_at")
        read_only_fields = ("id", "created_at")


class ArticleBookmarkSerializer(serializers.ModelSerializer):
    article = ArticleListSerializer(read_only=True)

    class Meta:
        model = ArticleBookmark
        fields = ("id", "article", "created_at")
        read_only_fields = ("id", "created_at")


class RecentlyViewedSerializer(serializers.ModelSerializer):
    resource = ResourceListSerializer(read_only=True)
    article = ArticleListSerializer(read_only=True)

    class Meta:
        model = RecentlyViewed
        fields = ("id", "content_type", "resource", "article", "viewed_at")
        read_only_fields = ("id", "content_type", "viewed_at")


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "message", "is_read", "created_at")
        read_only_fields = ("id", "created_at")


