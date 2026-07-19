"""
Custom User Manager for the Startup Navigator User model.

Overrides Django's default BaseUserManager to:
  - Require and normalise email (not username).
  - Enforce that email is provided.
  - Hash passwords correctly via set_password().
"""
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    Manager for the custom email-based User model.

    Usage
    -----
    User.objects.create_user(email="a@b.com", password="secret")
    User.objects.create_superuser(email="admin@b.com", password="secret")
    """

    def _create_user(self, email: str, password: str, **extra_fields) -> "User":  # type: ignore[name-defined]
        """
        Core helper — normalises email, hashes password, saves user.

        Raises
        ------
        ValueError if email is empty.
        """
        if not email:
            raise ValueError(_("The Email field must be set."))

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str = None, **extra_fields) -> "User":  # type: ignore[name-defined]
        """Create and return a regular (non-staff, non-superuser) user."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields) -> "User":  # type: ignore[name-defined]
        """Create and return a superuser with all permissions."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self._create_user(email, password, **extra_fields)
