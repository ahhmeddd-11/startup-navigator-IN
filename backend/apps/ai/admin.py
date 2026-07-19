from django.contrib import admin
from .models import AIConversation, AIInteraction, AIUsageLog


class AIInteractionInline(admin.TabularInline):
    model = AIInteraction
    extra = 0
    readonly_fields = ("prompt_type", "user_query", "ai_response", "created_at")
    can_delete = False


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__full_name", "title")
    ordering = ("-created_at",)
    inlines = [AIInteractionInline]


@admin.register(AIInteraction)
class AIInteractionAdmin(admin.ModelAdmin):
    list_display = ("conversation", "prompt_type", "created_at")
    list_filter = ("prompt_type", "created_at")
    search_fields = ("conversation__user__email", "user_query", "ai_response")
    ordering = ("-created_at",)


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("prompt_type", "user", "processing_time_ms", "status_code", "created_at")
    list_filter = ("status_code", "prompt_type", "created_at")
    search_fields = ("user__email", "prompt_type", "error_message")
    ordering = ("-created_at",)

    # Telemetry audits should remain read-only in admin panel to prevent tampering
    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
