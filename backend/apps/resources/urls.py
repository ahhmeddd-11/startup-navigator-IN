from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceCategoryViewSet, ResourceTagViewSet
from users.views import ResourceBookmarkListView, ResourceBookmarkView

router = DefaultRouter()
router.register("categories", ResourceCategoryViewSet, basename="category")
router.register("tags", ResourceTagViewSet, basename="tag")
# Main resources route registered last to prevent slug overlaps (though /categories/ /tags/ are distinct)
router.register("", ResourceViewSet, basename="resource")

app_name = "resources"

urlpatterns = [
    path("bookmarks/", ResourceBookmarkListView.as_view(), name="bookmark_list"),
    path("<slug:slug>/bookmark/", ResourceBookmarkView.as_view(), name="bookmark_toggle"),
    path("", include(router.urls)),
]
