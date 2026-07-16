from harmonize import harmonize_scale


def test_c_major_triad_qualities():
    result = harmonize_scale("major", 0)
    assert result["available"] is True
    assert result["mode"] == "diatonic"
    types = [c["chord_type"] for c in result["chords"]]
    assert types == ["M", "m", "m", "M", "M", "m", "dim"]
    romans = [c["roman"] for c in result["chords"]]
    assert romans == ["I", "ii", "iii", "IV", "V", "vi", "vii°"]


def test_a_natural_minor_structure():
    result = harmonize_scale("minor", 9)  # A minor
    assert result["available"] is True
    assert result["chords"][0]["root_pc"] == 9
    assert result["chords"][0]["chord_type"] == "m"
    types = [c["chord_type"] for c in result["chords"]]
    assert types == ["m", "dim", "M", "m", "m", "M", "M"]


def test_f_sharp_major_transposes_qualities():
    result = harmonize_scale("major", 6)  # F#
    types = [c["chord_type"] for c in result["chords"]]
    assert types == ["M", "m", "m", "M", "M", "m", "dim"]
    assert result["chords"][0]["root_pc"] == 6
    assert result["chords"][4]["root_pc"] == (6 + 7) % 12  # V = C#


def test_pentatonic_switches_to_adapted():
    result = harmonize_scale("pentatonic", 0)
    assert result["available"] is True
    assert result["mode"] == "adapted"
    assert len(result["chords"]) >= 2
    assert "adaptée" in result["explanation"] or "adapté" in result["explanation"]


def test_blues_uses_dominant_progressions():
    result = harmonize_scale("blues", 0)
    assert result["available"] is True
    assert result["mode"] == "adapted"
    types = {c["chord_type"] for c in result["chords"][:3]}
    assert "7" in types
    assert result["chords"][0]["root_pc"] == 0
    assert any("7" in p["name"] or "I" in p["name"] for p in result["progressions"])


def test_egyptian_adapted_transposes():
    c_result = harmonize_scale("egyptian", 0)
    a_result = harmonize_scale("egyptian", 9)
    assert c_result["mode"] == "adapted"
    assert a_result["mode"] == "adapted"
    assert len(c_result["chords"]) == len(a_result["chords"])
    # Même structure relative, racines décalées de +9
    for c_chord, a_chord in zip(c_result["chords"], a_result["chords"]):
        assert a_chord["root_pc"] == (c_chord["root_pc"] + 9) % 12
        assert a_chord["chord_type"] == c_chord["chord_type"]


def test_major_includes_classic_progressions():
    result = harmonize_scale("major", 0)
    names = [p["name"] for p in result["progressions"]]
    assert any("vi" in n and "ii" in n and "V" in n for n in names)
    assert len(result["progressions"][0]["chords"]) >= 3
