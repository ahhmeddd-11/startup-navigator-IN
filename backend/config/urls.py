from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from users.views import (
    UserPreferenceView,
    RecentlyViewedListView,
    DashboardView,
    ContactView,
    AdminDashboardView,
    AdminUserViewSet,
    ContactMessageViewSet,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentication & user management
    path("api/auth/", include("users.urls", namespace="auth")),
    # Core business modules
    path("api/resources/", include("resources.urls", namespace="resources")),
    path("api/knowledge/", include("knowledge.urls", namespace="knowledge")),
    # AI Module & Recommendation Engine
    path("api/ai/", include("ai.urls", namespace="ai")),
    # User personalisation features
    path("api/users/preferences/", UserPreferenceView.as_view(), name="user_preferences"),
    path("api/users/history/", RecentlyViewedListView.as_view(), name="user_history"),
    # Dashboard API
    path("api/dashboard/", DashboardView.as_view(), name="dashboard"),
    # Public contact API
    path("api/contact/", ContactView.as_view(), name="contact"),
    # Internal admin metrics API
    path("api/admin/dashboard/", AdminDashboardView.as_view(), name="admin_dashboard"),
    # Internal admin management APIs
    path("api/admin/users/", AdminUserViewSet.as_view({"get": "list"}), name="admin_users_list"),
    path("api/admin/users/<int:pk>/", AdminUserViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="admin_user_detail"),
    path("api/admin/contacts/", ContactMessageViewSet.as_view({"get": "list"}), name="admin_contacts_list"),
    path("api/admin/contacts/<int:pk>/", ContactMessageViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="admin_contact_detail"),
    # OpenAPI Schema & Docs UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
