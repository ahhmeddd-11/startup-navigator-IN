from django.conf import settings
from django.db import models


class AIConversation(models.Model):
    """
    Represents an ongoing chat thread between a user and the AI.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_conversations",
    )
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "AI Conversation"
        verbose_name_plural = "AI Conversations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} - {self.title} ({self.created_at.strftime('%Y-%m-%d')})"


class AIInteraction(models.Model):
    """
    Represents a single query-response exchange within a conversation.
    """

    PROMPT_TYPE_CHOICES = [
        ("idea_validation", "Idea Validation"),
        ("business_model", "Business Model"),
        ("funding", "Funding Guidance"),
        ("government_schemes", "Government Schemes"),
        ("general_qa", "General Startup Q&A"),
    ]

    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name="interactions",
    )
    prompt_type = models.CharField(max_length=50, choices=PROMPT_TYPE_CHOICES)
    user_query = models.TextField()
    ai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "AI Interaction"
        verbose_name_plural = "AI Interactions"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.prompt_type} in {self.conversation.id} at {self.created_at.strftime('%H:%M:%S')}"


class AIUsageLog(models.Model):
    """
    Keeps track of processing metrics, response status, and exceptions for telemetry.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_usage_logs",
    )
    interaction = models.ForeignKey(
        AIInteraction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usage_logs",
    )
    prompt_type = models.CharField(max_length=50)
    processing_time_ms = models.IntegerField(help_text="Time taken to process request in milliseconds")
    status_code = models.IntegerField(help_text="HTTP response status from provider or view")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "AI Usage Log"
        verbose_name_plural = "AI Usage Logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        status_str = "SUCCESS" if self.status_code == 200 else f"FAILED ({self.status_code})"
        return f"{self.prompt_type} - {status_str} at {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
