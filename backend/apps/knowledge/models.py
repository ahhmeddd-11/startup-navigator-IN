from django.conf import settings
from django.db import models
from common.utils.slugs import generate_unique_slug


class KnowledgeCategory(models.Model):
    """
    Model representing category classification of knowledge base articles (e.g. Incorporation, Growth).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Knowledge Category"
        verbose_name_plural = "Knowledge Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "name")
        super().save(*args, **kwargs)


class KnowledgeTag(models.Model):
    """
    Model representing tags for knowledge base articles.
    """

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=70, unique=True, db_index=True, blank=True)

    class Meta:
        verbose_name = "Knowledge Tag"
        verbose_name_plural = "Knowledge Tags"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "name")
        super().save(*args, **kwargs)


class Article(models.Model):
    """
    Model representing knowledge base articles/guides.
    """

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True, blank=True)
    summary = models.TextField()
    content = models.TextField()
    reading_time = models.PositiveIntegerField(help_text="Estimated reading time in minutes")
    featured_image = models.ImageField(upload_to="knowledge/featured/", null=True, blank=True)
    category = models.ForeignKey(
        KnowledgeCategory,
        on_delete=models.PROTECT,
        related_name="articles",
    )
    tags = models.ManyToManyField(KnowledgeTag, related_name="articles", blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    featured = models.BooleanField(default=False, db_index=True)

    # SEO metadata fields
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        help_text="SEO Meta Title (recommended length under 70 chars)",
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text="SEO Meta Description (recommended length under 160 chars)",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="written_articles",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Article"
        verbose_name_plural = "Articles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs) -> None:
        generate_unique_slug(self, "title")
        super().save(*args, **kwargs)
