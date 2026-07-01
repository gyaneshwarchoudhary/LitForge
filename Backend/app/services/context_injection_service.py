"""
Assembles the four-part context passed to the LLM:
  1. User profile (personalization)
  2. Retrieved chunks (Pinecone results)
  3. Conversation history (recent prior turns)
  4. The raw question
"""

from app.models.user_profile_model import UserProfile

_MAX_CHUNK_CHARS = 800
_MAX_BIO_CHARS = 300


def _build_profile_context(profile: UserProfile | None) -> tuple[bool, str]:
    if profile is None:
        return False, ""

    parts: list[str] = []

    if profile.bio:
        parts.append(f"About the user: {profile.bio[:_MAX_BIO_CHARS]}")
    if profile.goals:
        parts.append(f"Goals: {', '.join(profile.goals)}")
    if profile.current_challenges:
        parts.append(f"Current challenges: {', '.join(profile.current_challenges)}")
    if profile.areas_to_improve:
        parts.append(f"Areas to improve: {', '.join(profile.areas_to_improve)}")
    if profile.personality_traits:
        parts.append(f"Personality traits: {', '.join(profile.personality_traits)}")
    if profile.preferred_learning_style:
        parts.append(f"Learning style: {profile.preferred_learning_style}")
    if profile.existing_habits:
        parts.append(f"Existing habits: {', '.join(profile.existing_habits)}")
    if profile.environment_constraints:
        parts.append(f"Environment constraints: {', '.join(profile.environment_constraints)}")
    if profile.available_time_per_week_hours is not None:
        parts.append(f"Available time per week: {profile.available_time_per_week_hours} hours")

    if not parts:
        return False, ""

    text = "## User Profile\n" + "\n".join(f"- {p}" for p in parts)
    return True, text


def _build_retrieved_context(chunks: list[dict]) -> str:
    if not chunks:
        return ""

    lines = ["## Relevant Passages from the Book"]
    for i, chunk in enumerate(chunks, 1):
        text = chunk.get("text", "")[:_MAX_CHUNK_CHARS]
        score = chunk.get("score", 0.0)
        lines.append(f"\n[{i}] (relevance: {score:.2f})\n{text}")

    return "\n".join(lines)


def build_combined_context(
    profile: UserProfile | None,
    chunks: list[dict],
    question: str,
    history_text: str = "",
) -> dict:
    """Return profile_used, profile_context, retrieved_context, combined_context."""
    profile_used, profile_context = _build_profile_context(profile)
    retrieved_context = _build_retrieved_context(chunks)

    sections: list[str] = []
    if profile_context:
        sections.append(profile_context)
    if retrieved_context:
        sections.append(retrieved_context)
    if history_text:
        sections.append(history_text)
    sections.append(f"## User Question\n{question}")

    return {
        "profile_used": profile_used,
        "profile_context": profile_context,
        "retrieved_context": retrieved_context,
        "combined_context": "\n\n".join(sections),
    }
