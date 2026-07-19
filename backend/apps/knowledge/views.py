from rest_framework import viewsets, filters
from common.mixins import CRUDResponseMixin
from common.permissions.base import IsAdminOrReadOnly

from .models import Article, KnowledgeCategory, KnowledgeTag
from .serializers import (
    KnowledgeCategorySerializer,
    KnowledgeTagSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
)
from .filters import ArticleFilter


class KnowledgeCategoryViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for KnowledgeCategory.
    Public has read-only access; Admin has full CRUD.
    """

    queryset = KnowledgeCategory.objects.all()
    serializer_class = KnowledgeCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class KnowledgeTagViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for KnowledgeTag.
    Public has read-only access; Admin has full CRUD.
    """

    queryset = KnowledgeTag.objects.all()
    serializer_class = KnowledgeTagSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name"]
    ordering = ["name"]


class ArticleViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for Article.
    Public has read-only access (published articles only); Admin has full CRUD (all articles).
    """

    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filterset_class = ArticleFilter
    search_fields = ["title", "summary", "content"]
    ordering_fields = ["created_at", "updated_at", "title", "reading_time"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Filter articles based on user status:
        Anonymous/standard users can only see published articles.
        Admin/staff users can see all articles (published and drafts).
        """
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(is_published=True)

    def get_serializer_class(self):
        """
        Use lighter list serializer for listing, and full detail serializer for editing/detail retrieval.
        """
        if self.action == "list":
            return ArticleListSerializer
        return ArticleDetailSerializer

    def perform_create(self, serializer):
        """
        Automatically save the author of this article as the logged-in user.
        """
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            serializer.save()

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve detail of an article and track it in user recently viewed history.
        """
        instance = self.get_object()
        from users.models import RecentlyViewed
        RecentlyViewed.track_view(request.user, "article", instance)
        return super().retrieve(request, *args, **kwargs)

