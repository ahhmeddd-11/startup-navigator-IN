import time
import logging
from ..models import AIConversation, AIInteraction, AIUsageLog
from .gemini_provider import GeminiProvider
from .prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)


class AIService:
    """
    Core orchestrating service for handling AI interactions.
    Manages API call telemetry tracking, conversation context mapping, and audit logging.
    """

    def __init__(self, provider=None):
        self.provider = provider or GeminiProvider()

    def _execute_ai_action(
        self,
        user,
        prompt_type: str,
        prompt_text: str,
        system_instruction: str,
        conversation_id: int = None,
        conversation_title: str = None,
    ) -> dict:
        """
        Executes the AI provider request, logs usage metrics, and links the interaction to a conversation thread.
        """
        start_time = time.time()
        status_code = 200
        error_msg = ""
        ai_response_text = ""
        interaction = None

        # 1. Resolve or create the conversation thread
        if conversation_id:
            try:
                conversation = AIConversation.objects.get(id=conversation_id, user=user)
            except AIConversation.DoesNotExist:
                logger.error(f"AIConversation ID {conversation_id} not found for user {user.email}")
                raise ValueError("Conversation thread does not exist.")
        else:
            title = conversation_title or f"AI {prompt_type.replace('_', ' ').title()}"
            conversation = AIConversation.objects.create(user=user, title=title)

        try:
            # 2. Query the LLM provider
            ai_response_text = self.provider.generate_response(prompt_text, system_instruction)

            # 3. Save the interaction in database
            interaction = AIInteraction.objects.create(
                conversation=conversation,
                prompt_type=prompt_type,
                user_query=prompt_text,
                ai_response=ai_response_text,
            )

        except Exception as exc:
            status_code = 500
            error_msg = str(exc)
            logger.error(f"Error during execution of AI action: {exc}")
            raise exc

        finally:
            # 4. Measure elapsed time and record metrics in AIUsageLog
            duration_ms = int((time.time() - start_time) * 1000)
            AIUsageLog.objects.create(
                user=user,
                interaction=interaction,
                prompt_type=prompt_type,
                processing_time_ms=duration_ms,
                status_code=status_code,
                error_message=error_msg,
            )

        return {
            "conversation_id": conversation.id,
            "conversation_title": conversation.title,
            "response": ai_response_text,
            "interaction_id": interaction.id if interaction else None,
        }

    def validate_idea(self, user, idea: str, target_market: str = "") -> dict:
        prompt_text = PromptBuilder.build_validation_prompt(idea, target_market)
        system_instruction = PromptBuilder.get_system_instruction("idea_validation")
        title = f"Validate: {idea[:30]}..." if len(idea) > 30 else f"Validate: {idea}"
        return self._execute_ai_action(
            user, "idea_validation", prompt_text, system_instruction, conversation_title=title
        )

    def suggest_business_model(self, user, business_description: str, stage: str = "") -> dict:
        prompt_text = PromptBuilder.build_business_model_prompt(business_description, stage)
        system_instruction = PromptBuilder.get_system_instruction("business_model")
        title = (
            f"Biz Model: {business_description[:30]}..."
            if len(business_description) > 30
            else f"Biz Model: {business_description}"
        )
        return self._execute_ai_action(
            user, "business_model", prompt_text, system_instruction, conversation_title=title
        )

    def get_funding_guidance(self, user, stage: str, funding_needed: str, industry: str) -> dict:
        prompt_text = PromptBuilder.build_funding_prompt(stage, funding_needed, industry)
        system_instruction = PromptBuilder.get_system_instruction("funding")
        title = f"Funding: {industry}"
        return self._execute_ai_action(
            user, "funding", prompt_text, system_instruction, conversation_title=title
        )

    def get_government_schemes(self, user, startup_details: str, sector: str) -> dict:
        prompt_text = PromptBuilder.build_government_schemes_prompt(startup_details, sector)
        system_instruction = PromptBuilder.get_system_instruction("government_schemes")
        title = f"Gov Schemes: {sector}"
        return self._execute_ai_action(
            user, "government_schemes", prompt_text, system_instruction, conversation_title=title
        )

    def chat_qa(self, user, question: str, conversation_id: int = None, context: str = "") -> dict:
        prompt_text = PromptBuilder.build_general_qa_prompt(question, context)
        system_instruction = PromptBuilder.get_system_instruction("general_qa")
        title = f"Chat: {question[:30]}..." if len(question) > 30 else f"Chat: {question}"
        return self._execute_ai_action(
            user,
            "general_qa",
            prompt_text,
            system_instruction,
            conversation_id=conversation_id,
            conversation_title=title,
        )
