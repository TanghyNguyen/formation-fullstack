from recommend_fallback import recommend_progressions_fallback


def test_fallback_major_returns_progressions():
    result = recommend_progressions_fallback("major", 0)
    assert result["source"] == "rules"
    assert len(result["progressions"]) >= 2
    assert len(result["progressions"][0]["chords"]) >= 3


def test_fallback_follows_root_for_non_c_major():
    result = recommend_progressions_fallback("major", 9)
    first = result["progressions"][0]["chords"][0]
    assert first["root_pc"] == 9
    assert first["roman"] == "I"
