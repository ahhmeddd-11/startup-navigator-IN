from rest_framework import serializers
from .models import AIConversation, AIInteraction


# --- Input Validation Serializers ---

class IdeaValidationSerializer(serializers.Serializer):
    idea = serializers.CharField(required=True, min_length=10)
    target_market = serializers.CharField(required=False, allow_blank=True, default="")


class BusinessModelSerializer(serializers.Serializer):
    business_description = serializers.CharField(required=True, min_length=10)
    stage = serializers.CharField(required=False, allow_blank=True, default="")


class FundingGuidanceSerializer(serializers.Serializer):
    stage = serializers.CharField(required=True)
    funding_needed = serializers.CharField(required=True)
    industry = serializers.CharField(required=True)


class GovernmentSchemesSerializer(serializers.Serializer):
    startup_details = serializers.CharField(required=True, min_length=10)
    sector = serializers.CharField(required=True)


class ChatSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    conversation_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    context = serializers.CharField(required=False, allow_blank=True, default="")


# --- Output / History Serializers ---

class AIInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInteraction
        fields = ["id", "prompt_type", "user_query", "ai_response", "created_at"]


class AIConversationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = ["id", "title", "created_at"]


class AIConversationDetailSerializer(serializers.ModelSerializer):
    interactions = AIInteractionSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ["id", "title", "created_at", "interactions"]


class AdminAIConversationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    messages_count = serializers.SerializerMethodField()
    interactions = AIInteractionSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ["id", "user_email", "title", "created_at", "messages_count", "interactions"]

    def get_messages_count(self, obj) -> int:
        return obj.interactions.count()

