from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM providers.
    Ensures the provider can be swapped out easily in settings.
    """

    @abstractmethod
    def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        """
        Generate text response from the provider given prompt & system instruction.
        """
        pass
