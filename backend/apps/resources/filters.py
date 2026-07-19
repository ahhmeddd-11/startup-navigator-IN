import django_filters
from .models import Resource


class ResourceFilter(django_filters.FilterSet):
    """
    Filter class for Resource list views.
    Allows filtering by category slug, category ID, tag slug, tag ID, resource type, featured, and published status.
    """

    category = django_filters.CharFilter(field_name="category__slug")
    category_id = django_filters.NumberFilter(field_name="category__id")
    tag = django_filters.CharFilter(field_name="tags__slug")
    tag_id = django_filters.NumberFilter(field_name="tags__id")
    featured = django_filters.BooleanFilter(field_name="featured")
    is_published = django_filters.BooleanFilter(field_name="is_published")
    resource_type = django_filters.CharFilter(field_name="resource_type")

    class Meta:
        model = Resource
        fields = [
            "category",
            "category_id",
            "tag",
            "tag_id",
            "featured",
            "is_published",
            "resource_type",
        ]
