from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, KnowledgeCategoryViewSet, KnowledgeTagViewSet
from users.views import ArticleBookmarkListView, ArticleBookmarkView

router = DefaultRouter()
router.register("categories", KnowledgeCategoryViewSet, basename="category")
router.register("tags", KnowledgeTagViewSet, basename="tag")
# Main articles route registered last
router.register("", ArticleViewSet, basename="article")

app_name = "knowledge"

urlpatterns = [
    path("bookmarks/", ArticleBookmarkListView.as_view(), name="bookmark_list"),
    path("<slug:slug>/bookmark/", ArticleBookmarkView.as_view(), name="bookmark_toggle"),
    path("", include(router.urls)),
]
