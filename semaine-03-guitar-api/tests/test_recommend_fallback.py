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


def test_fallback_dorian_has_modal_progression():
    result = recommend_progressions_fallback("dorian", 2)
    assert result["progressions"][0]["name"].startswith("Dorien")
    assert result["progressions"][0]["chords"][0]["roman"] == "i"


def test_fallback_harmonic_minor_uses_major_fifth():
    result = recommend_progressions_fallback("harmonicMinor", 0)
    fifth = result["progressions"][0]["chords"][1]
    assert fifth["root_pc"] == 7  # G = V en Do mineur harmonique
    assert fifth["chord_type"] == "M"


def test_fallback_mixolydian_has_bVII():
    result = recommend_progressions_fallback("mixolydian", 7)
    romans = [c["roman"] for c in result["progressions"][0]["chords"]]
    assert "bVII" in romans
