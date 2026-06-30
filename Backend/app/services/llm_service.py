"""
Gemini LLM wrapper — generates a personalized answer from combined context.
"""

import logging

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_LLM_MODEL = "gemini-3.5-flash"

_SYSTEM_INSTRUCTION = (
    "You are a personalized book assistant. "
    "You are given the user's profile (their goals, challenges, and learning preferences), "
    "relevant passages from the book they are reading, and their question.\n\n"
    "Instructions:\n"
    "- Answer the question using only the provided passages.\n"
    "- Tailor your answer to the user's goals and profile when relevant.\n"
    "- Be concise, clear, and practical.\n"
    "- If the passages do not contain enough information, say so honestly."
)

_llm_client: genai.Client | None = None


def _get_llm_client() -> genai.Client:
    global _llm_client
    if _llm_client is None:
        _llm_client = genai.Client(api_key=settings.GOOGLE_LLM_API_KEY)
    return _llm_client


def generate_answer(combined_context: str) -> str:
    """Send the combined context to Gemini and return the generated answer."""
    client = _get_llm_client()
    try:
        response = client.models.generate_content(
            model=GEMINI_LLM_MODEL,
            contents=combined_context,
            config={"system_instruction": _SYSTEM_INSTRUCTION},
        )
        return response.text
    except Exception as e:
        logger.error("LLM generation failed: %s", e)
        raise
