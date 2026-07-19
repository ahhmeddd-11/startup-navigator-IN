import logging
from rest_framework import status, views, generics, viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from common.utils.response import api_response

from .models import AIConversation
from .serializers import (
    IdeaValidationSerializer,
    BusinessModelSerializer,
    FundingGuidanceSerializer,
    GovernmentSchemesSerializer,
    ChatSerializer,
    AIConversationListSerializer,
    AIConversationDetailSerializer,
    AdminAIConversationSerializer,
)
from .services.ai_service import AIService

logger = logging.getLogger(__name__)


class BaseAIView(views.APIView):
    """
    Base view to inherit permission classes, instantiate AIService, and unify exception handling.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ai_service = AIService()

    def handle_ai_exception(self, exc) -> ...:
        """
        Catches provider connectivity errors, rate limiting exceptions, and outputs formatted response.
        """
        logger.error(f"AI View Exception: {exc}", exc_info=True)
        return api_response(
            success=False,
            message="AI Service is temporarily unable to fulfill the request. Please try again later.",
            data={"detail": str(exc)},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class IdeaValidationView(BaseAIView):
    """
    POST /api/ai/validate-idea/
    Validates a startup idea against target markets.
    """

    def post(self, request) -> ...:
        serializer = IdeaValidationSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation error",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = self.ai_service.validate_idea(
                user=request.user,
                idea=serializer.validated_data["idea"],
                target_market=serializer.validated_data["target_market"],
            )
            return api_response(
                success=True,
                message="Idea validated successfully.",
                data=result,
            )
        except Exception as exc:
            return self.handle_ai_exception(exc)


class BusinessModelView(BaseAIView):
    """
    POST /api/ai/business-model/
    Suggests monetization frameworks for a given business concept.
    """

    def post(self, request) -> ...:
        serializer = BusinessModelSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation error",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = self.ai_service.suggest_business_model(
                user=request.user,
                business_description=serializer.validated_data["business_description"],
                stage=serializer.validated_data["stage"],
            )
            return api_response(
                success=True,
                message="Business model suggestions generated successfully.",
                data=result,
            )
        except Exception as exc:
            return self.handle_ai_exception(exc)


class FundingGuidanceView(BaseAIView):
    """
    POST /api/ai/funding-guide/
    Provides early-stage funding strategy recommendations.
    """

    def post(self, request) -> ...:
        serializer = FundingGuidanceSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation error",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = self.ai_service.get_funding_guidance(
                user=request.user,
                stage=serializer.validated_data["stage"],
                funding_needed=serializer.validated_data["funding_needed"],
                industry=serializer.validated_data["industry"],
            )
            return api_response(
                success=True,
                message="Funding guidance generated successfully.",
                data=result,
            )
        except Exception as exc:
            return self.handle_ai_exception(exc)


class GovernmentSchemesView(BaseAIView):
    """
    POST /api/ai/government-schemes/
    Maps a startup sector/description to relevant Indian government policies/schemes.
    """

    def post(self, request) -> ...:
        serializer = GovernmentSchemesSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation error",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = self.ai_service.get_government_schemes(
                user=request.user,
                startup_details=serializer.validated_data["startup_details"],
                sector=serializer.validated_data["sector"],
            )
            return api_response(
                success=True,
                message="Indian government scheme options generated successfully.",
                data=result,
            )
        except Exception as exc:
            return self.handle_ai_exception(exc)


class ChatQAView(BaseAIView):
    """
    POST /api/ai/chat/
    General Startup Q&A interface maintaining session context inside a conversation thread.
    """

    def post(self, request) -> ...:
        serializer = ChatSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation error",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = self.ai_service.chat_qa(
                user=request.user,
                question=serializer.validated_data["message"],
                conversation_id=serializer.validated_data["conversation_id"],
                context=serializer.validated_data["context"],
            )
            return api_response(
                success=True,
                message="AI response generated.",
                data=result,
            )
        except ValueError as val_exc:
            return api_response(
                success=False,
                message=str(val_exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return self.handle_ai_exception(exc)


class ConversationListView(generics.ListAPIView):
    """
    GET /api/ai/conversations/
    Retrieve chat thread list for the authenticated user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = AIConversationListSerializer

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs) -> ...:
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Conversations listed successfully.",
            data=serializer.data,
        )

    def delete(self, request, *args, **kwargs):
        """
        DELETE /api/ai/conversations/
        Delete all chat conversations for the authenticated user.
        """
        AIConversation.objects.filter(user=request.user).delete()
        return api_response(
            success=True,
            message="All conversations cleared successfully."
        )


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """
    GET /api/ai/conversations/{id}/
    Retrieve detailed query exchanges for a specific chat thread.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = AIConversationDetailSerializer
    lookup_field = "id"

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs) -> ...:
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message="Conversation detail retrieved successfully.",
            data=serializer.data,
        )
    
    def destroy(self, request, *args, **kwargs):
        conversation = self.get_object()
        conversation.delete()

        return api_response(
            success=True,
            message="Conversation deleted successfully.",
        )


from common.mixins import CRUDResponseMixin

class AdminAIConversationViewSet(CRUDResponseMixin, viewsets.ModelViewSet):
    queryset = AIConversation.objects.all()
    serializer_class = AdminAIConversationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__email", "title", "interactions__user_query", "interactions__ai_response"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

