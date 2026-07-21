from i18n import parse_locale, scale_label
from recommend_ai import _build_prompt


def test_parse_locale_basics():
    assert parse_locale("fr") == "fr"
    assert parse_locale("en") == "en"
    assert parse_locale("EN") == "en"
    assert parse_locale(None) == "fr"
    assert parse_locale("de") == "fr"
    assert parse_locale("") == "fr"


def test_scale_label_english_major():
    assert scale_label("major", "en") == "Major"


def test_build_prompt_english_locale():
    prompt = _build_prompt("major", 0, 4, locale="en")
    assert "English" in prompt or "english" in prompt
