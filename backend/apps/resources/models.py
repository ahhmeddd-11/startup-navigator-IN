from django.conf import settings
from django.db import models
from common.utils.slugs import generate_unique_slug


class ResourceCategory(models.Model):
    """
    Model representing category classification of resources (e.g. Funding, Compliance).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Resource Category"
        verbose_name_plural = "Resource Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "name")
        super().save(*args, **kwargs)


class ResourceTag(models.Model):
    """
    Model representing reusable tags for resources.
    """

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=70, unique=True, db_index=True, blank=True)

    class Meta:
        verbose_name = "Resource Tag"
        verbose_name_plural = "Resource Tags"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "name")
        super().save(*args, **kwargs)


class Resource(models.Model):
    """
    Model representing startup resources (templates, guides, checklists, toolkits).
    """

    RESOURCE_TYPE_CHOICES = [
        ("Template", "Template"),
        ("Guide", "Guide"),
        ("Checklist", "Checklist"),
        ("Toolkit", "Toolkit"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True, blank=True)
    short_description = models.TextField()
    full_description = models.TextField(blank=True)
    external_link = models.URLField(max_length=500, blank=True)
    thumbnail = models.ImageField(upload_to="resources/thumbnails/", null=True, blank=True)
    category = models.ForeignKey(
        ResourceCategory,
        on_delete=models.PROTECT,
        related_name="resources",
    )
    tags = models.ManyToManyField(ResourceTag, related_name="resources", blank=True)
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        default="Guide",
    )
    duration = models.CharField(max_length=50, blank=True)
    featured = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_resources",
    )

    class Meta:
        verbose_name = "Resource"
        verbose_name_plural = "Resources"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "title")
        super().save(*args, **kwargs)
