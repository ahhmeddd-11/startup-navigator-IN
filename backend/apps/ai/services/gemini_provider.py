import os
import logging
import requests
from .base_provider import BaseLLMProvider

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    """
    Concrete implementation of BaseLLMProvider using Google's Gemini API via HTTP POST.
    """

    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        # self.url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        self.url = (
            f"https://generativelanguage.googleapis.com/v1/models/"
            f"{self.model_name}:generateContent"
        )

        logger.info(f"Using Gemini model: {self.model_name}")
        logger.info(f"Gemini endpoint: {self.url}")

    def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        """
        Invokes Gemini API via HTTP POST request.
        Handles API errors, timeouts, and empty responses.
        """
        if not self.api_key:
            logger.error("GEMINI_API_KEY environment variable is missing.")
            raise ValueError("AI service is currently misconfigured. Please check GEMINI_API_KEY.")

        headers = {
            "Content-Type": "application/json",
        }

        # Build prompt payload contents
        # contents = {
        #     "parts": [
        #         {"text": prompt}
        #     ]
        # }

        # data = {
        #     "contents": [contents],
        # }

        # # Handle system instruction if provided
        # if system_instruction:
        #     data["systemInstruction"] = {
        #         "parts": [
        #             {"text": system_instruction}
        #         ]
        #     }
        



        full_prompt = prompt

        if system_instruction:
            full_prompt = f"{system_instruction}\n\nUser:\n{prompt}"

        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ]
        }

        params = {
            "key": self.api_key
        }

        try:
            # Enforce a 20-second timeout limit
            response = requests.post(
                self.url,
                json=data,
                headers=headers,
                params=params,
                timeout=20.0,
            )

            # Handle Rate Limiting (HTTP 429)
            if response.status_code == 429:
                logger.warning("Gemini API rate limit (429) encountered.")
                raise Exception("AI service rate limit exceeded. Please wait a moment before trying again.")

            # Handle other HTTP errors
            if response.status_code != 200:
                logger.error(f"Gemini API returned status code {response.status_code}: {response.text}")
                raise Exception(
                    f"Gemini API Error ({response.status_code}): {response.text}"
                )

            json_resp = response.json()

            # Safely parse text response from nested candidates dict
            candidates = json_resp.get("candidates", [])
            if not candidates:
                logger.error("Gemini API returned an empty list of candidates.")
                raise Exception("AI provider returned no text response.")

            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if not parts:
                logger.error("Gemini API returned no content parts.")
                raise Exception("AI provider returned no text response.")

            ai_text = parts[0].get("text", "")
            if not ai_text:
                raise Exception("AI provider generated an empty text response.")

            return ai_text

        except requests.Timeout as exc:
            logger.error(f"Timeout occurred while calling Gemini API: {exc}")
            raise Exception("AI service timed out. Please try again.")
        except requests.RequestException as exc:
            logger.error(f"HTTP request error while calling Gemini API: {exc}")
            raise Exception("Error communicating with AI service.")
