"""
Authentication API views for the users application.

All views return responses using the shared api_response() helper to
guarantee a consistent JSON envelope across the application.

Endpoint summary
----------------
POST   /api/auth/register/         Public   — create new account
POST   /api/auth/login/            Public   — obtain JWT pair
POST   /api/auth/logout/           Auth     — blacklist refresh token
POST   /api/auth/refresh/          Public   — rotate refresh token
POST   /api/auth/verify/           Public   — verify access token
GET    /api/auth/profile/          Auth     — retrieve own profile
PATCH  /api/auth/profile/          Auth     — update own profile
POST   /api/auth/change-password/  Auth     — change password
"""
import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenRefreshView as BaseTokenRefreshView,
    TokenVerifyView as BaseTokenVerifyView,
)

from common.utils.response import api_response

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class RegisterView(APIView):
    """
    POST /api/auth/register/

    Create a new user account.  Returns the user's profile data plus
    a JWT token pair so the client is immediately authenticated.

    Permission: public (AllowAny)
    """

    permission_classes = (AllowAny,)

    def post(self, request: Request) -> ...:
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Registration failed. Please correct the errors.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        # Issue JWT tokens immediately on registration
        refresh = RefreshToken.for_user(user)
        profile = UserProfileSerializer(user).data

        logger.info("New user registered: %s", user.email)
        return api_response(
            success=True,
            message="Account created successfully.",
            data={
                "user": profile,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status_code=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginView(APIView):
    """
    POST /api/auth/login/

    Authenticate with email + password, receive JWT token pair.

    Permission: public (AllowAny)
    """

    permission_classes = (AllowAny,)

    def post(self, request: Request) -> ...:
        serializer = LoginSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Login failed. Please check your credentials.",
                data=serializer.errors,
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        data = serializer.validated_data
        user = data["user"]
        profile = UserProfileSerializer(user).data

        logger.info("User logged in: %s", user.email)
        return api_response(
            success=True,
            message="Login successful.",
            data={
                "user": profile,
                "tokens": {
                    "access": data["access"],
                    "refresh": data["refresh"],
                },
            },
        )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Blacklist the provided refresh token, rendering it unusable.
    The client is responsible for discarding the access token locally.

    Body:
        { "refresh": "<refresh_token>" }

    Permission: IsAuthenticated
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request: Request) -> ...:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return api_response(
                success=False,
                message="Refresh token is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return api_response(
                success=False,
                message="Token is invalid or already expired.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        logger.info("User logged out: %s", request.user.email)
        return api_response(
            success=True,
            message="Logged out successfully.",
            status_code=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Token Refresh  (wraps simplejwt's view, adds uniform response)
# ---------------------------------------------------------------------------

class TokenRefreshView(BaseTokenRefreshView):
    """
    POST /api/auth/refresh/

    Exchange a valid refresh token for a new access token.
    Because ROTATE_REFRESH_TOKENS=True a new refresh token is also returned.

    Permission: public (AllowAny)
    """

    def post(self, request: Request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError) as exc:
            return api_response(
                success=False,
                message="Token refresh failed.",
                data={"detail": str(exc)},
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return api_response(
            success=True,
            message="Token refreshed successfully.",
            data=response.data,
        )


# ---------------------------------------------------------------------------
# Token Verify  (wraps simplejwt's view, adds uniform response)
# ---------------------------------------------------------------------------

class TokenVerifyView(BaseTokenVerifyView):
    """
    POST /api/auth/verify/

    Verify that an access token is still valid.

    Permission: public (AllowAny)
    """

    def post(self, request: Request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError) as exc:
            return api_response(
                success=False,
                message="Token is invalid or expired.",
                data={"detail": str(exc)},
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return api_response(
            success=True,
            message="Token is valid.",
            data=response.data,
        )


# ---------------------------------------------------------------------------
# Profile  (GET + PATCH combined)
# ---------------------------------------------------------------------------

class ProfileView(APIView):
    """
    GET  /api/auth/profile/  — retrieve the authenticated user's profile.
    PATCH /api/auth/profile/ — update full_name (email is read-only).

    Permission: IsAuthenticated
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request: Request) -> ...:
        serializer = UserProfileSerializer(request.user)
        return api_response(
            success=True,
            message="Profile retrieved successfully.",
            data=serializer.data,
        )

    def patch(self, request: Request) -> ...:
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Profile update failed.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        return api_response(
            success=True,
            message="Profile updated successfully.",
            data=serializer.data,
        )


# ---------------------------------------------------------------------------
# Change Password
# ---------------------------------------------------------------------------

class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/

    Change the authenticated user's password.

    Body:
        {
            "current_password": "...",
            "new_password": "...",
            "confirm_new_password": "..."
        }

    On success, all existing refresh tokens for this user are blacklisted
    (logout everywhere) so any other sessions are immediately invalidated.

    Permission: IsAuthenticated
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request: Request) -> ...:
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Password change failed.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        logger.info("Password changed for user: %s", request.user.email)
        return api_response(
            success=True,
            message="Password changed successfully. Please log in again.",
        )


# ---------------------------------------------------------------------------
# Additional Profile Feature Views: Bookmarks, History & Preferences
# ---------------------------------------------------------------------------
from resources.models import Resource
from knowledge.models import Article
from .models import UserPreference, ResourceBookmark, ArticleBookmark, RecentlyViewed
from .serializers import (
    UserPreferenceSerializer,
    ResourceBookmarkSerializer,
    ArticleBookmarkSerializer,
    RecentlyViewedSerializer,
)


class UserPreferenceView(APIView):
    """
    GET  /api/users/preferences/  - retrieve the preferences of authenticated user
    PATCH /api/users/preferences/ - update preference details (sectors, stage, onboarding_completed, email_notifications)
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request: Request) -> ...:
        pref, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref)
        return api_response(
            success=True,
            message="Preferences retrieved successfully.",
            data=serializer.data,
        )

    def patch(self, request: Request) -> ...:
        pref, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Preference update failed.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return api_response(
            success=True,
            message="Preferences updated successfully.",
            data=serializer.data,
        )

    def put(self, request: Request) -> ...:
        return self.patch(request)


class ResourceBookmarkView(APIView):
    """
    POST   /api/resources/{slug}/bookmark/   - Bookmark a resource
    DELETE /api/resources/{slug}/bookmark/   - Remove bookmark
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request: Request, slug: str) -> ...:
        try:
            resource = Resource.objects.get(slug=slug)
        except Resource.DoesNotExist:
            return api_response(
                success=False,
                message="Resource not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        bookmark, created = ResourceBookmark.objects.get_or_create(user=request.user, resource=resource)
        serializer = ResourceBookmarkSerializer(bookmark)
        message = "Resource bookmarked successfully." if created else "Resource already bookmarked."
        return api_response(
            success=True,
            message=message,
            data=serializer.data,
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request: Request, slug: str) -> ...:
        try:
            resource = Resource.objects.get(slug=slug)
        except Resource.DoesNotExist:
            return api_response(
                success=False,
                message="Resource not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        deleted_count, _ = ResourceBookmark.objects.filter(user=request.user, resource=resource).delete()
        if deleted_count == 0:
            return api_response(
                success=False,
                message="Bookmark does not exist for this resource.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return api_response(
            success=True,
            message="Bookmark removed successfully.",
        )


class ArticleBookmarkView(APIView):
    """
    POST   /api/knowledge/{slug}/bookmark/   - Bookmark an article
    DELETE /api/knowledge/{slug}/bookmark/   - Remove bookmark
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request: Request, slug: str) -> ...:
        try:
            article = Article.objects.get(slug=slug)
        except Article.DoesNotExist:
            return api_response(
                success=False,
                message="Article not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        bookmark, created = ArticleBookmark.objects.get_or_create(user=request.user, article=article)
        serializer = ArticleBookmarkSerializer(bookmark)
        message = "Article bookmarked successfully." if created else "Article already bookmarked."
        return api_response(
            success=True,
            message=message,
            data=serializer.data,
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request: Request, slug: str) -> ...:
        try:
            article = Article.objects.get(slug=slug)
        except Article.DoesNotExist:
            return api_response(
                success=False,
                message="Article not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        deleted_count, _ = ArticleBookmark.objects.filter(user=request.user, article=article).delete()
        if deleted_count == 0:
            return api_response(
                success=False,
                message="Bookmark does not exist for this article.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return api_response(
            success=True,
            message="Bookmark removed successfully.",
        )


class ResourceBookmarkListView(generics.ListAPIView):
    """
    GET /api/resources/bookmarks/ - list all resource bookmarks for the user
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = ResourceBookmarkSerializer

    def get_queryset(self):
        return ResourceBookmark.objects.filter(user=self.request.user).select_related("resource", "resource__category")

    def list(self, request, *args, **kwargs) -> ...:
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Resource bookmarks retrieved successfully.",
            data=serializer.data,
        )


class ArticleBookmarkListView(generics.ListAPIView):
    """
    GET /api/knowledge/bookmarks/ - list all article bookmarks for the user
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = ArticleBookmarkSerializer

    def get_queryset(self):
        return ArticleBookmark.objects.filter(user=self.request.user).select_related("article", "article__category")

    def list(self, request, *args, **kwargs) -> ...:
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Article bookmarks retrieved successfully.",
            data=serializer.data,
        )


class RecentlyViewedListView(generics.ListAPIView):
    """
    GET /api/users/history/ - list user's recently viewed items
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = RecentlyViewedSerializer

    def get_queryset(self):
        return RecentlyViewed.objects.filter(user=self.request.user).select_related(
            "resource", "resource__category", "article", "article__category"
        )

    def list(self, request, *args, **kwargs) -> ...:
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Recently viewed history retrieved successfully.",
            data=serializer.data,
        )


class DashboardView(APIView):
    """
    GET /api/dashboard/
    Retrieves counts of bookmarks and chat threads, along with a combined chronological feed of recent activities.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request: Request) -> ...:
        user = request.user

        # 1. Fetch count stats
        resource_bookmarks_count = ResourceBookmark.objects.filter(user=user).count()
        article_bookmarks_count = ArticleBookmark.objects.filter(user=user).count()

        # Dynamic import to avoid circular dependency loops
        from ai.models import AIConversation
        ai_conversations_count = AIConversation.objects.filter(user=user).count()

        # 2. Compile recent activity feed
        activity_list = []

        # Get last 5 recently viewed items
        views = RecentlyViewed.objects.filter(user=user).select_related(
            "resource", "resource__category", "article", "article__category"
        )[:5]
        for v in views:
            title = "Unknown"
            slug = ""
            article_data = None
            resource_data = None
            if v.content_type == "resource" and v.resource:
                title = v.resource.title
                slug = v.resource.slug
                resource_data = {
                    "slug": v.resource.slug,
                    "title": v.resource.title,
                    "resource_type": v.resource.resource_type,
                }
            elif v.content_type == "article" and v.article:
                title = v.article.title
                slug = v.article.slug
                article_data = {
                    "slug": v.article.slug,
                    "title": v.article.title,
                    "reading_time": v.article.reading_time,
                    "category": {
                        "name": v.article.category.name if v.article.category else None
                    } if v.article.category else None,
                }

            activity_list.append({
                "id": v.id,
                "type": "view",
                "item_type": v.content_type,
                "content_type": v.content_type,
                "title": title,
                "slug": slug,
                "timestamp": v.viewed_at,
                "viewed_at": v.viewed_at,
                "article": article_data,
                "resource": resource_data,
            })

        # Get last 5 resource bookmarks
        res_bookmarks = ResourceBookmark.objects.filter(user=user).select_related(
            "resource", "resource__category"
        )[:5]
        for rb in res_bookmarks:
            if rb.resource:
                activity_list.append({
                    "id": rb.id,
                    "type": "bookmark",
                    "item_type": "resource",
                    "content_type": "resource",
                    "title": rb.resource.title,
                    "slug": rb.resource.slug,
                    "timestamp": rb.created_at,
                    "viewed_at": rb.created_at,
                    "article": None,
                    "resource": {
                        "slug": rb.resource.slug,
                        "title": rb.resource.title,
                        "resource_type": rb.resource.resource_type,
                    },
                })

        # Get last 5 article bookmarks
        art_bookmarks = ArticleBookmark.objects.filter(user=user).select_related(
            "article", "article__category"
        )[:5]
        for ab in art_bookmarks:
            if ab.article:
                activity_list.append({
                    "id": ab.id,
                    "type": "bookmark",
                    "item_type": "article",
                    "content_type": "article",
                    "title": ab.article.title,
                    "slug": ab.article.slug,
                    "timestamp": ab.created_at,
                    "viewed_at": ab.created_at,
                    "article": {
                        "slug": ab.article.slug,
                        "title": ab.article.title,
                        "reading_time": ab.article.reading_time,
                        "category": {
                            "name": ab.article.category.name if ab.article.category else None
                        } if ab.article.category else None,
                    },
                    "resource": None,
                })

        # Sort combined activity list chronologically (newest first)
        activity_list.sort(key=lambda x: x["timestamp"], reverse=True)
        recent_activity = activity_list[:5]

        data = {
            "bookmarked_resources_count": resource_bookmarks_count,
            "bookmarked_articles_count": article_bookmarks_count,
            "resource_bookmarks_count": resource_bookmarks_count,
            "article_bookmarks_count": article_bookmarks_count,
            "ai_conversations_count": ai_conversations_count,
            "recently_viewed_count": RecentlyViewed.objects.filter(user=user).count(),
            "recent_activity": recent_activity,
        }

        return api_response(
            success=True,
            message="Dashboard statistics retrieved successfully.",
            data=data,
        )


from resources.models import Resource
from knowledge.models import Article
from ai.models import AIConversation
from .models import ContactMessage, ResourceBookmark, ArticleBookmark
from .serializers import ContactMessageSerializer

class ContactView(APIView):
    """
    POST /api/contact/
    Public contact message submission.
    """
    permission_classes = (AllowAny,)

    def post(self, request: Request) -> ...:
        serializer = ContactMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation failed.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return api_response(
            success=True,
            message="Message received. We will get back to you soon.",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED,
        )


class AdminDashboardView(APIView):
    """
    GET /api/admin/dashboard/
    Staff/Admin only dashboard statistics.
    """
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request: Request) -> ...:
        resources_count = Resource.objects.count()
        articles_count = Article.objects.count()
        users_count = User.objects.count()
        conversations_count = AIConversation.objects.count()
        bookmarks_count = ResourceBookmark.objects.count() + ArticleBookmark.objects.count()
        contact_messages_count = ContactMessage.objects.count()

        # Fetch recent 5 items for dashboard listing
        recent_users_qs = User.objects.order_by("-date_joined")[:5]
        recent_users = UserProfileSerializer(recent_users_qs, many=True).data

        recent_contacts_qs = ContactMessage.objects.order_by("-created_at")[:5]
        recent_contacts = ContactMessageSerializer(recent_contacts_qs, many=True).data

        data = {
            "resources_count": resources_count,
            "articles_count": articles_count,
            "users_count": users_count,
            "conversations_count": conversations_count,
            "bookmarks_count": bookmarks_count,
            "contact_messages_count": contact_messages_count,
            "recent_users": recent_users,
            "recent_contact_messages": recent_contacts,
        }

        return api_response(
            success=True,
            message="Admin statistics retrieved successfully.",
            data=data,
        )


from rest_framework import viewsets, filters
from django.contrib.auth import get_user_model
User = get_user_model()
from common.mixins import CRUDResponseMixin
from .serializers import AdminUserSerializer

class AdminUserViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["email", "full_name"]
    ordering_fields = ["date_joined", "email"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get("role")
        if role == "admin":
            queryset = queryset.filter(is_staff=True)
        elif role == "user":
            queryset = queryset.filter(is_staff=False)

        status_param = self.request.query_params.get("status")
        if status_param == "active":
            queryset = queryset.filter(is_active=True)
        elif status_param == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset

    def perform_update(self, serializer):
        user_to_update = self.get_object()
        is_staff_new = serializer.validated_data.get("is_staff")
        is_active_new = serializer.validated_data.get("is_active")

        if (is_staff_new is False or is_active_new is False) and user_to_update.is_staff:
            active_admin_count = User.objects.filter(is_staff=True, is_active=True).count()
            if active_admin_count <= 1:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Cannot remove or deactivate the last active administrator.")

        serializer.save()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot delete your own administrator account.")

        if instance.is_staff:
            admin_count = User.objects.filter(is_staff=True).count()
            if admin_count <= 1:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Cannot delete the last administrator.")

        instance.delete()


class ContactMessageViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "subject", "message"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]




