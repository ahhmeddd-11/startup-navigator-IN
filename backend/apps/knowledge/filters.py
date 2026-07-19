import django_filters
from .models import Article


class ArticleFilter(django_filters.FilterSet):
    """
    Filter class for Article list views.
    Allows filtering by category slug, category ID, tag slug, tag ID, featured, and published status.
    """

    category = django_filters.CharFilter(field_name="category__slug")
    category_id = django_filters.NumberFilter(field_name="category__id")
    tag = django_filters.CharFilter(field_name="tags__slug")
    tag_id = django_filters.NumberFilter(field_name="tags__id")
    featured = django_filters.BooleanFilter(field_name="featured")
    is_published = django_filters.BooleanFilter(field_name="is_published")

    class Meta:
        model = Article
        fields = ["category", "category_id", "tag", "tag_id", "featured", "is_published"]
