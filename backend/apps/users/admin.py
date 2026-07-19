"""
Django Admin configuration for the custom User model.

Provides a clean, searchable, filterable interface for managing users.
Passwords are never displayed; only the hashed representation is editable
via the change-password widget provided by UserChangeForm.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for the custom User model.

    Extends Django's built-in UserAdmin so that the password
    change form and permission management work out of the box.
    """

    # ------------------------------------------------------------------ #
    # List view
    # ------------------------------------------------------------------ #
    list_display = ("email", "full_name", "is_active", "is_staff", "date_joined")
    list_display_links = ("email", "full_name")
    list_filter = ("is_active", "is_staff", "is_superuser", "date_joined")
    list_per_page = 25
    search_fields = ("email", "full_name")
    ordering = ("-date_joined",)
    date_hierarchy = "date_joined"

    # ------------------------------------------------------------------ #
    # Detail / edit view
    # ------------------------------------------------------------------ #
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Personal info"),
            {"fields": ("full_name",)},
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            _("Important dates"),
            {
                "fields": ("last_login", "date_joined"),
                "classes": ("collapse",),
            },
        ),
    )

    # ------------------------------------------------------------------ #
    # Add user view
    # ------------------------------------------------------------------ #
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "password1", "password2"),
            },
        ),
    )

    # Read-only fields on the change form
    readonly_fields = ("last_login", "date_joined")

    # The username field does not exist on our model; override the parent's
    # reference so Django Admin does not break.
    USERNAME_FIELD = "email"
