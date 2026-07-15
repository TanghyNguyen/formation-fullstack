"""Configuration des fournisseurs LLM (Ollama, Groq, OpenAI)."""

import os
from dataclasses import dataclass

from openai import OpenAI


@dataclass(frozen=True)
class LlmProvider:
    name: str
    model: str
    client: OpenAI


def _provider_name() -> str:
    return os.getenv("AI_PROVIDER", "ollama").strip().lower()


def resolve_llm_provider() -> LlmProvider:
    provider = _provider_name()

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        if api_key.startswith("sk-replace") or api_key.endswith("-key"):
            raise RuntimeError(
                "OPENAI_API_KEY is still the placeholder from .env.example"
            )
        return LlmProvider(
            name="openai",
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            client=OpenAI(api_key=api_key),
        )

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not configured")
        return LlmProvider(
            name="groq",
            model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            client=OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
            ),
        )

    if provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1").rstrip(
            "/"
        )
        return LlmProvider(
            name="ollama",
            model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
            client=OpenAI(
                api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
                base_url=base_url,
            ),
        )

    raise RuntimeError(
        f"Unknown AI_PROVIDER '{provider}' — use ollama, groq, or openai"
    )
