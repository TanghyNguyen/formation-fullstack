import os

import pytest

from llm_provider import resolve_llm_provider


def test_default_provider_is_ollama():
    old = os.environ.get("AI_PROVIDER")
    os.environ["AI_PROVIDER"] = "ollama"
    try:
        provider = resolve_llm_provider()
        assert provider.name == "ollama"
        assert provider.model == os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    finally:
        if old:
            os.environ["AI_PROVIDER"] = old
        else:
            os.environ.pop("AI_PROVIDER", None)


def test_groq_provider_requires_api_key():
    old_provider = os.environ.get("AI_PROVIDER")
    old_key = os.environ.pop("GROQ_API_KEY", None)
    os.environ["AI_PROVIDER"] = "groq"
    try:
        with pytest.raises(RuntimeError, match="GROQ_API_KEY"):
            resolve_llm_provider()
    finally:
        if old_key:
            os.environ["GROQ_API_KEY"] = old_key
        if old_provider:
            os.environ["AI_PROVIDER"] = old_provider
        else:
            os.environ.pop("AI_PROVIDER", None)


def test_unknown_provider_raises():
    old = os.environ.get("AI_PROVIDER")
    os.environ["AI_PROVIDER"] = "unknown"
    try:
        with pytest.raises(RuntimeError, match="Unknown AI_PROVIDER"):
            resolve_llm_provider()
    finally:
        if old:
            os.environ["AI_PROVIDER"] = old
        else:
            os.environ.pop("AI_PROVIDER", None)
