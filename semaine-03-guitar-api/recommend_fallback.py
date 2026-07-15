"""Progressions diatoniques de secours quand l'IA est indisponible."""

from scales import SCALES, scale_degrees_from_root

_MAJOR_ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
_MAJOR_TYPES = ["M", "m", "m", "M", "M", "m", "M"]
_MINOR_ROMAN = ["i", "ii°", "III", "iv", "v", "VI", "VII"]
_MINOR_TYPES = ["m", "M", "M", "m", "m", "M", "M"]

_MODE_DEGREES: dict[str, tuple[list[str], list[str]]] = {
    "major": (_MAJOR_ROMAN, _MAJOR_TYPES),
    "ionian": (_MAJOR_ROMAN, _MAJOR_TYPES),
    "minor": (_MINOR_ROMAN, _MINOR_TYPES),
    "harmonicMinor": (
        ["i", "ii°", "III+", "iv", "V", "VI", "vii°"],
        ["m", "dim", "aug", "m", "M", "M", "dim"],
    ),
    "melodicMinor": (
        ["i", "ii", "III+", "IV", "V", "vi°", "vii°"],
        ["m", "m", "aug", "M", "M", "dim", "dim"],
    ),
    "dorian": (
        ["i", "ii", "bIII", "IV", "v", "vi°", "bVII"],
        ["m", "m", "M", "M", "m", "dim", "M"],
    ),
    "mixolydian": (
        ["I", "ii", "iii°", "IV", "v", "vi", "bVII"],
        ["M", "m", "dim", "M", "m", "m", "M"],
    ),
    "phrygian": (
        ["i", "bII", "bIII", "iv", "v°", "bVI", "bvii"],
        ["m", "M", "M", "m", "dim", "M", "m"],
    ),
    "lydian": (
        ["I", "II", "iii", "#iv°", "V", "vi", "vii"],
        ["M", "M", "m", "dim", "M", "m", "m"],
    ),
    "blues": (_MAJOR_ROMAN, ["7", "7", "7", "7", "7", "7", "7"]),
}

_PROGRESSION_TEMPLATES: dict[str, list[tuple[str, str, list[int]]]] = {
    "minor": [
        ("Mineur classique i–iv–V–i", "Progression mineure naturelle (sans IA).", [0, 3, 4, 0]),
        ("Ballade i–VI–III–VII", "Couleur pop mineure (sans IA).", [0, 5, 2, 6]),
    ],
    "harmonicMinor": [
        (
            "Mineur harmonique i–V–i",
            "Cadence avec dominante majeure (sans IA).",
            [0, 4, 0],
        ),
        (
            "Mineur harmonique i–iv–V–i",
            "Progression classique orientale (sans IA).",
            [0, 3, 4, 0],
        ),
    ],
    "melodicMinor": [
        ("Mélodique mineur i–IV–V–i", "Jazz mineur mélodique (sans IA).", [0, 3, 4, 0]),
        ("Mélodique mineur i–ii–V–i", "Couleur Bebop (sans IA).", [0, 1, 4, 0]),
    ],
    "blues": [
        ("Blues 12 mesures (simplifié)", "Progression blues de base (sans IA).", [0, 0, 0, 0]),
        ("Turnaround blues", "I–IV–I–V en tonalité blues (sans IA).", [0, 3, 0, 4]),
    ],
    "dorian": [
        ("Dorien i–IV", "Couleur jazz / funk modale (sans IA).", [0, 3, 0]),
        ("Dorien i–v–IV–i", "Groove modal (sans IA).", [0, 4, 3, 0]),
    ],
    "mixolydian": [
        ("Mixolydien I–bVII–IV", "Rock classique (sans IA).", [0, 6, 3]),
        ("Mixolydien I–IV–I–bVII", "Cadence dominante (sans IA).", [0, 3, 0, 6]),
    ],
    "phrygian": [
        ("Phrygien i–bII–bVII", "Couleur flamenco / metal (sans IA).", [0, 1, 6]),
        ("Phrygien i–bVI–bVII", "Tension orientale (sans IA).", [0, 5, 6, 0]),
    ],
    "lydian": [
        ("Lydien I–II", "Couleur dream pop (sans IA).", [0, 1, 0]),
        ("Lydien I–V–vi–II", "Ouverture lumineuse (sans IA).", [0, 4, 5, 1]),
    ],
    "major": [
        ("Pop I–V–vi–IV", "Progression pop la plus courante (sans IA).", [0, 4, 5, 3]),
        ("Classique I–IV–V–I", "Cadence fondamentale (sans IA).", [0, 3, 4, 0]),
        ("Ballade vi–IV–I–V", "Couleur émotionnelle (sans IA).", [5, 3, 0, 4]),
    ],
}


def _chord(pcs: list[int], degree: int, chord_type: str, roman: str) -> dict:
    return {
        "root_pc": pcs[degree % len(pcs)],
        "chord_type": chord_type,
        "roman": roman,
    }


def _mode_config(scale_key: str) -> tuple[list[str], list[str]]:
    if scale_key in _MODE_DEGREES:
        return _MODE_DEGREES[scale_key]
    return _MAJOR_ROMAN, _MAJOR_TYPES


def _templates_for_scale(scale_key: str) -> list[tuple[str, str, list[int]]]:
    if scale_key in _PROGRESSION_TEMPLATES:
        return _PROGRESSION_TEMPLATES[scale_key]
    if scale_key == "ionian":
        return _PROGRESSION_TEMPLATES["major"]
    return _PROGRESSION_TEMPLATES["major"]


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
    romans, types = _mode_config(scale_key)
    templates = _templates_for_scale(scale_key)

    def at(degree: int) -> dict:
        safe_degree = degree % len(romans)
        return _chord(pcs, degree, types[safe_degree], romans[safe_degree])

    progressions = []
    for name, description, degrees in templates:
        if scale_key == "blues":
            chords = [_chord(pcs, d, "7", romans[d % len(romans)]) for d in degrees]
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
