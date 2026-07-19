from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from common.mixins import CRUDResponseMixin
from common.permissions.base import IsAdminOrReadOnly

from .models import Resource, ResourceCategory, ResourceTag
from .serializers import (
    ResourceCategorySerializer,
    ResourceTagSerializer,
    ResourceListSerializer,
    ResourceDetailSerializer,
)
from .filters import ResourceFilter


class ResourceCategoryViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for ResourceCategory.
    Public has read-only access; Admin has full CRUD.
    """

    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class ResourceTagViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for ResourceTag.
    Public has read-only access; Admin has full CRUD.
    """

    queryset = ResourceTag.objects.all()
    serializer_class = ResourceTagSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name"]
    ordering = ["name"]


class ResourceViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for Resource.
    Public has read-only access (published items only); Admin has full CRUD (all items).
    """

    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filterset_class = ResourceFilter
    search_fields = ["title", "short_description", "full_description"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Filter resources based on user status:
        Anonymous/standard users can only see published resources.
        Admin/staff users can see all resources (published and drafts).
        """
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return Resource.objects.all()
        return Resource.objects.filter(is_published=True)

    def get_serializer_class(self):
        """
        Use lighter list serializer for listing, and full detail serializer for editing/detail retrieval.
        """
        if self.action == "list":
            return ResourceListSerializer
        return ResourceDetailSerializer

    def perform_create(self, serializer):
        """
        Automatically save the user who created this resource.
        """
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve detail of a resource and track it in user recently viewed history.
        """
        instance = self.get_object()
        from users.models import RecentlyViewed
        RecentlyViewed.track_view(request.user, "resource", instance)
        return super().retrieve(request, *args, **kwargs)

