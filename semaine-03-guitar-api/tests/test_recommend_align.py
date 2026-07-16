from recommend_ai import _align_progressions_to_root, _is_tonic_roman


def test_is_tonic_roman():
    assert _is_tonic_roman("I")
    assert _is_tonic_roman("i")
    assert _is_tonic_roman("I7")
    assert _is_tonic_roman("imaj7")
    assert not _is_tonic_roman("ii")
    assert not _is_tonic_roman("IV")
    assert not _is_tonic_roman("V7")


def test_align_transposes_c_major_to_c_sharp():
    # Ollama renvoyait souvent une progression en Do pour C#
    progressions = [
        {
            "name": "Pop",
            "description": "test",
            "chords": [
                {"root_pc": 0, "chord_type": "M", "roman": "I"},
                {"root_pc": 7, "chord_type": "M", "roman": "V"},
                {"root_pc": 9, "chord_type": "m", "roman": "vi"},
                {"root_pc": 5, "chord_type": "M", "roman": "IV"},
            ],
        }
    ]
    # C# major degrees: 1, 3, 5, 6, 8, 10, 0
    scale_pcs = {1, 3, 5, 6, 8, 10, 0}
    aligned = _align_progressions_to_root(progressions, 1, scale_pcs)
    assert len(aligned) == 1
    roots = [c["root_pc"] for c in aligned[0]["chords"]]
    assert roots[0] == 1  # C#
    assert roots == [1, 8, 10, 6]  # I V vi IV in C#


def test_align_keeps_correct_progression():
    progressions = [
        {
            "name": "Ok",
            "description": "déjà en C#",
            "chords": [
                {"root_pc": 1, "chord_type": "M", "roman": "I"},
                {"root_pc": 8, "chord_type": "M", "roman": "V"},
                {"root_pc": 6, "chord_type": "M", "roman": "IV"},
            ],
        }
    ]
    scale_pcs = {1, 3, 5, 6, 8, 10, 0}
    aligned = _align_progressions_to_root(progressions, 1, scale_pcs)
    assert aligned[0]["chords"][0]["root_pc"] == 1
    assert aligned[0]["chords"][1]["root_pc"] == 8
