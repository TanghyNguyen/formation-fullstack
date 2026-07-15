"""Progressions diatoniques de secours quand l'IA OpenAI est indisponible."""

from scales import SCALES, scale_degrees_from_root

_MAJOR_ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
_MAJOR_TYPES = ["M", "m", "m", "M", "M", "m", "M"]
_MINOR_ROMAN = ["i", "ii°", "III", "iv", "v", "VI", "VII"]
_MINOR_TYPES = ["m", "M", "M", "m", "m", "M", "M"]


def _chord(pcs: list[int], degree: int, chord_type: str, roman: str) -> dict:
    return {
        "root_pc": pcs[degree % len(pcs)],
        "chord_type": chord_type,
        "roman": roman,
    }


def recommend_progressions_fallback(scale_key: str, root_pc: int) -> dict:
    intervals = SCALES.get(scale_key)
    if intervals is None:
        return {
            "scale_key": scale_key,
            "root_pc": root_pc,
            "source": "rules",
            "progressions": [],
        }

    pcs = scale_degrees_from_root(root_pc, intervals)
    if scale_key == "minor":
        romans, types = _MINOR_ROMAN, _MINOR_TYPES
    else:
        romans, types = _MAJOR_ROMAN, _MAJOR_TYPES

    def at(degree: int) -> dict:
        return _chord(pcs, degree, types[degree], romans[degree])

    if scale_key == "minor":
        templates = [
            (
                "Mineur classique i–iv–V–i",
                "Progression mineure naturelle (sans IA).",
                [0, 3, 4, 0],
            ),
            (
                "Ballade i–VI–III–VII",
                "Couleur pop mineure (sans IA).",
                [0, 5, 2, 6],
            ),
        ]
    elif scale_key == "blues":
        templates = [
            (
                "Blues 12 mesures (simplifié)",
                "Progression blues de base (sans IA).",
                [0, 0, 0, 0],
            ),
            (
                "Turnaround blues",
                "I–IV–I–V en tonalité blues (sans IA).",
                [0, 3, 0, 4],
            ),
        ]
    else:
        templates = [
            (
                "Pop I–V–vi–IV",
                "Progression pop la plus courante (sans IA).",
                [0, 4, 5, 3],
            ),
            (
                "Classique I–IV–V–I",
                "Cadence fondamentale (sans IA).",
                [0, 3, 4, 0],
            ),
            (
                "Ballade vi–IV–I–V",
                "Couleur émotionnelle (sans IA).",
                [5, 3, 0, 4],
            ),
        ]

    progressions = []
    for name, description, degrees in templates:
        if scale_key == "blues":
            chords = [_chord(pcs, d, "7", romans[d]) for d in degrees]
        else:
            chords = [at(d) for d in degrees]
        progressions.append(
            {"name": name, "description": description, "chords": chords}
        )

    return {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "source": "rules",
        "progressions": progressions,
    }
