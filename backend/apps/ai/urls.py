from django.urls import path
from .views import (
    IdeaValidationView,
    BusinessModelView,
    FundingGuidanceView,
    GovernmentSchemesView,
    ChatQAView,
    ConversationListView,
    ConversationDetailView,
    AdminAIConversationViewSet,
)

app_name = "ai"

urlpatterns = [
    path("validate-idea/", IdeaValidationView.as_view(), name="validate_idea"),
    path("business-model/", BusinessModelView.as_view(), name="business_model"),
    path("funding-guide/", FundingGuidanceView.as_view(), name="funding_guide"),
    path("government-schemes/", GovernmentSchemesView.as_view(), name="government_schemes"),
    path("chat/", ChatQAView.as_view(), name="chat"),
    path("conversations/", ConversationListView.as_view(), name="conversation_list"),
    path("conversations/<int:id>/", ConversationDetailView.as_view(), name="conversation_detail"),
    path("admin/conversations/", AdminAIConversationViewSet.as_view({"get": "list"}), name="admin_conversation_list"),
    path("admin/conversations/<int:pk>/", AdminAIConversationViewSet.as_view({"get": "retrieve", "delete": "destroy"}), name="admin_conversation_detail"),
]
