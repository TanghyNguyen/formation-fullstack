import os

import pytest

from recommend_ai import recommend_progressions_ai


def test_recommend_without_provider_config_raises():
    old_provider = os.environ.get("AI_PROVIDER")
    old_key = os.environ.pop("OPENAI_API_KEY", None)
    os.environ["AI_PROVIDER"] = "openai"
    try:
        with pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
            recommend_progressions_ai("major", 0)
    finally:
        if old_key:
            os.environ["OPENAI_API_KEY"] = old_key
        if old_provider:
            os.environ["AI_PROVIDER"] = old_provider
        else:
            os.environ.pop("AI_PROVIDER", None)


def test_recommend_with_placeholder_key_raises():
    old_provider = os.environ.get("AI_PROVIDER")
    old = os.environ.get("OPENAI_API_KEY")
    os.environ["AI_PROVIDER"] = "openai"
    os.environ["OPENAI_API_KEY"] = "sk-replace-with-your-openai-key"
    try:
        with pytest.raises(RuntimeError, match="placeholder"):
            recommend_progressions_ai("major", 0)
    finally:
        if old:
            os.environ["OPENAI_API_KEY"] = old
        else:
            os.environ.pop("OPENAI_API_KEY", None)
        if old_provider:
            os.environ["AI_PROVIDER"] = old_provider
        else:
            os.environ.pop("AI_PROVIDER", None)
