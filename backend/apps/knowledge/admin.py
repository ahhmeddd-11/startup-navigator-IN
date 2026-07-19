from django.contrib import admin
from .models import Article, KnowledgeCategory, KnowledgeTag


@admin.register(KnowledgeCategory)
class KnowledgeCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(KnowledgeTag)
class KnowledgeTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "reading_time",
        "featured",
        "is_published",
        "created_at",
    )
    list_filter = ("category", "featured", "is_published", "created_at")
    search_fields = ("title", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("-created_at",)
    filter_horizontal = ("tags",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "slug",
                    "summary",
                    "content",
                    "reading_time",
                    "featured_image",
                )
            },
        ),
        (
            "Classification",
            {
                "fields": ("category", "tags"),
            },
        ),
        (
            "Status & Visibility",
            {
                "fields": ("is_published", "featured"),
            },
        ),
        (
            "SEO Metadata",
            {
                "fields": ("meta_title", "meta_description"),
                "classes": ("collapse",),
            },
        ),
        (
            "Ownership & Timestamps",
            {
                "fields": ("author", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        # Automatically assign author to the logged-in staff user
        if not change or not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)
