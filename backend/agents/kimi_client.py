"""
Shared Kimi API client for all FinUnity debate agents.
Loads AI_CONTEXT.md as the base system prompt for every call.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load .env from repo root
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

KIMI_API_KEY = os.getenv("KIMI_API_KEY")
KIMI_BASE_URL = os.getenv("KIMI_BASE_URL", "https://platform.kimi.ai/v1")

_client = None

def get_client():
    global _client
    if _client is None:
        if not KIMI_API_KEY:
            raise ValueError("KIMI_API_KEY not found in .env — check your setup")
        _client = OpenAI(api_key=KIMI_API_KEY, base_url=KIMI_BASE_URL)
    return _client

def load_ai_context():
    """Load the shared rules/objective from docs/AI_CONTEXT.md"""
    context_path = Path(__file__).resolve().parents[2] / "docs" / "AI_CONTEXT.md"
    return context_path.read_text(encoding="utf-8")

def call_kimi(role_instructions: str, evidence: str, mock_mode: bool = True) -> str:
    """
    Calls Kimi with shared context + role-specific instructions + evidence.
    mock_mode=True returns a fake response, no real API call, no cost.
    """
    if mock_mode:
        return f"[MOCK RESPONSE for role instructions: {role_instructions[:50]}...]\nThis is a placeholder response using evidence: {evidence[:100]}"

    system_prompt = load_ai_context() + "\n\n" + role_instructions
    client = get_client()

    response = client.chat.completions.create(
        model="moonshot-v1-8k",  # confirm exact model name in Kimi's docs
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": evidence},
        ],
        temperature=0.5,
        max_tokens=400,
    )
    return response.choices[0].message.content