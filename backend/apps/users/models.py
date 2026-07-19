"""
Custom User model for Startup Navigator.

Design decisions:
  - Email is the primary authentication identifier (no username).
  - AbstractBaseUser gives full control over authentication fields.
  - PermissionsMixin adds groups / permissions support for Django Admin.
  - The model is intentionally minimal; profile-level fields can be
    added in a separate OneToOne Profile model in a future phase.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email as the unique identifier.

    Fields
    ------
    email       Primary auth field; must be unique across all users.
    full_name   Display name; used in the admin list and API responses.
    is_active   Controls login access; defaults to True on creation.
    is_staff    Grants Django Admin access.
    date_joined Timestamp set automatically on creation.
    last_login  Updated automatically by Django on each login.
    """

    email = models.EmailField(
        _("email address"),
        unique=True,
        db_index=True,
    )
    full_name = models.CharField(
        _("full name"),
        max_length=255,
        blank=True,
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user account is active. "
            "Unset this instead of deleting accounts."
        ),
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into the admin site."),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    # Tell Django to use our custom manager
    objects = UserManager()

    # Use email as the login field instead of the default 'username'
    USERNAME_FIELD = "email"

    # Fields prompted when running `createsuperuser` (besides USERNAME_FIELD)
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]

    def __str__(self) -> str:
        return self.email

    def get_full_name(self) -> str:
        """Return the user's full name, stripped of leading/trailing whitespace."""
        return self.full_name.strip()

    def get_short_name(self) -> str:
        """Return the first part of the full name, or the email prefix."""
        name = self.full_name.strip()
        return name.split()[0] if name else self.email.split("@")[0]


# ---------------------------------------------------------------------------
# Additional Profile Features: Bookmarks, History & Preferences
# ---------------------------------------------------------------------------
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class ResourceBookmark(models.Model):
    """
    Bookmark mapping for resources.
    Prevents duplicate bookmarks using unique_together constraint.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resource_bookmarks",
    )
    resource = models.ForeignKey(
        "resources.Resource",
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "resource")
        verbose_name = "Resource Bookmark"
        verbose_name_plural = "Resource Bookmarks"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} bookmarked {self.resource.title}"


class ArticleBookmark(models.Model):
    """
    Bookmark mapping for knowledge base articles.
    Prevents duplicate bookmarks using unique_together constraint.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="article_bookmarks",
    )
    article = models.ForeignKey(
        "knowledge.Article",
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "article")
        verbose_name = "Article Bookmark"
        verbose_name_plural = "Article Bookmarks"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} bookmarked {self.article.title}"


class RecentlyViewed(models.Model):
    """
    Tracks items recently viewed by the user.
    Supports resources and knowledge base articles.
    """

    CONTENT_TYPE_CHOICES = [
        ("resource", "Resource"),
        ("article", "Article"),
        ("scheme", "Government Scheme"),
        ("recommendations", "Recommendations Page"),
        ("search", "Search Action"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recently_viewed",
    )
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES)
    resource = models.ForeignKey(
        "resources.Resource",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="views",
    )
    article = models.ForeignKey(
        "knowledge.Article",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="views",
    )
    metadata = models.JSONField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Recently Viewed"
        verbose_name_plural = "Recently Viewed Entries"
        ordering = ["-viewed_at"]

    def __str__(self) -> str:
        item_title = "Unknown"
        if self.content_type == "resource" and self.resource:
            item_title = self.resource.title
        elif self.content_type == "article" and self.article:
            item_title = self.article.title
        elif self.metadata and ("title" in self.metadata or "name" in self.metadata or "query" in self.metadata):
            item_title = self.metadata.get("title") or self.metadata.get("name") or self.metadata.get("query")
        return f"{self.user.email} viewed {self.content_type}: {item_title}"

    @classmethod
    def track_view(cls, user, content_type: str, instance=None, metadata=None) -> None:
        """
        Records that a user viewed a resource, article, scheme, recommendations page, or search query.
        Avoids duplicate consecutive entries and prunes old logs.
        """
        if not user or not user.is_authenticated:
            return

        # Fetch absolute last viewed item
        last_view = cls.objects.filter(user=user).first()

        # Check for consecutive duplicate and update time instead of duplicating record
        if last_view and last_view.content_type == content_type:
            if content_type == "resource" and instance and last_view.resource_id == instance.id:
                last_view.save()  # Triggers auto_now update
                return
            elif content_type == "article" and instance and last_view.article_id == instance.id:
                last_view.save()  # Triggers auto_now update
                return
            elif content_type == "scheme" and metadata and last_view.metadata == metadata:
                last_view.save()
                return
            elif content_type == "recommendations":
                last_view.save()
                return
            elif content_type == "search" and metadata and last_view.metadata == metadata:
                last_view.save()
                return

        # Create new entry
        kwargs = {"user": user, "content_type": content_type}
        if content_type == "resource" and instance:
            kwargs["resource"] = instance
        elif content_type == "article" and instance:
            kwargs["article"] = instance
        
        if metadata:
            kwargs["metadata"] = metadata

        cls.objects.create(**kwargs)

        # Enforce history limit (keep last 20)
        history_ids = cls.objects.filter(user=user).values_list("id", flat=True)[:20]
        cls.objects.filter(user=user).exclude(id__in=list(history_ids)).delete()



class UserPreference(models.Model):
    """
    Personalisation preferences for onboarding, sector focus, and stages.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="preferences",
    )
    sectors = models.JSONField(
        default=list,
        blank=True,
        help_text="Preferred startup sectors (e.g. Fintech, Agritech)",
    )
    stage = models.CharField(
        max_length=50,
        blank=True,
        help_text="Preferred startup stage (e.g. Ideation, Growth)",
    )
    onboarding_completed = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Preference"
        verbose_name_plural = "User Preferences"

    def __str__(self) -> str:
        return f"Preferences for {self.user.email}"


# ---------------------------------------------------------------------------
# Signal Handlers
# ---------------------------------------------------------------------------

@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs) -> None:
    """
    Automatically creates a UserPreference record for each new User account.
    """
    if created:
        UserPreference.objects.create(user=instance)


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Message from {self.name} ({self.email})"


