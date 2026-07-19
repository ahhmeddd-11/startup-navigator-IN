from django.contrib import admin
from .models import Resource, ResourceCategory, ResourceTag


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(ResourceTag)
class ResourceTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "resource_type",
        "category",
        "featured",
        "is_published",
        "created_at",
    )
    list_filter = ("resource_type", "category", "featured", "is_published", "created_at")
    search_fields = ("title", "short_description", "full_description")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("-created_at",)
    filter_horizontal = ("tags",)
    readonly_fields = ("created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        # Automatically assign created_by to the logged-in staff user
        if not change or not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
