"""Rule-based chord recommendations for a scale (Phase 4 — Session I1)."""

from scales import SCALES, pitch_classes_from_root

# scale degree index → chord qualities to try on that degree
_DIATONIC_CHORDS: dict[str, list[tuple[int, str]]] = {
    "major": [(0, "M"), (0, "m"), (0, "7"), (0, "maj7")],
    "minor": [(0, "m"), (0, "M"), (0, "m7"), (0, "7")],
    "blues": [(0, "7"), (0, "m7"), (0, "M")],
}

_DEFAULT_DEGREES = [(0, "M"), (0, "m"), (0, "7")]


def recommend_chords(scale_key: str, root_pc: int) -> list[dict]:
    intervals = SCALES.get(scale_key)
    if intervals is None:
        return []

    pitch_classes = pitch_classes_from_root(root_pc, intervals)
    templates = _DIATONIC_CHORDS.get(scale_key, _DEFAULT_DEGREES)

    recommendations: list[dict] = []
    seen: set[tuple[int, str]] = set()

    for degree_index, pc in enumerate(pitch_classes[:4]):
        for offset, chord_type in templates:
            idx = (degree_index + offset) % len(pitch_classes)
            chord_root = pitch_classes[idx]
            key = (chord_root, chord_type)
            if key in seen:
                continue
            seen.add(key)
            recommendations.append(
                {
                    "root_pc": chord_root,
                    "chord_type": chord_type,
                    "scale_degree": degree_index + 1,
                }
            )

    return recommendations[:6]
