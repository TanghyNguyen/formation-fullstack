"""Progressions diatoniques de secours quand l'IA est indisponible."""

from i18n import Locale, parse_locale, pick
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

# (fr_name, en_name, fr_desc, en_desc, degrees)
_PROGRESSION_TEMPLATES: dict[str, list[tuple[str, str, str, str, list[int]]]] = {
    "minor": [
        (
            "Mineur classique i–iv–V–i",
            "Classic minor i–iv–V–i",
            "Progression mineure naturelle (sans IA).",
            "Natural minor progression (no AI).",
            [0, 3, 4, 0],
        ),
        (
            "Ballade i–VI–III–VII",
            "Ballad i–VI–III–VII",
            "Couleur pop mineure (sans IA).",
            "Minor pop color (no AI).",
            [0, 5, 2, 6],
        ),
    ],
    "harmonicMinor": [
        (
            "Mineur harmonique i–V–i",
            "Harmonic minor i–V–i",
            "Cadence avec dominante majeure (sans IA).",
            "Cadence with major dominant (no AI).",
            [0, 4, 0],
        ),
        (
            "Mineur harmonique i–iv–V–i",
            "Harmonic minor i–iv–V–i",
            "Progression classique orientale (sans IA).",
            "Classic oriental progression (no AI).",
            [0, 3, 4, 0],
        ),
    ],
    "melodicMinor": [
        (
            "Mélodique mineur i–IV–V–i",
            "Melodic minor i–IV–V–i",
            "Jazz mineur mélodique (sans IA).",
            "Melodic minor jazz (no AI).",
            [0, 3, 4, 0],
        ),
        (
            "Mélodique mineur i–ii–V–i",
            "Melodic minor i–ii–V–i",
            "Couleur Bebop (sans IA).",
            "Bebop color (no AI).",
            [0, 1, 4, 0],
        ),
    ],
    "blues": [
        (
            "Blues 12 mesures (simplifié)",
            "12-bar blues (simplified)",
            "Progression blues de base (sans IA).",
            "Basic blues progression (no AI).",
            [0, 0, 0, 0],
        ),
        (
            "Turnaround blues",
            "Blues turnaround",
            "I–IV–I–V en tonalité blues (sans IA).",
            "I–IV–I–V in a blues key (no AI).",
            [0, 3, 0, 4],
        ),
    ],
    "dorian": [
        (
            "Dorien i–IV",
            "Dorian i–IV",
            "Couleur jazz / funk modale (sans IA).",
            "Modal jazz / funk color (no AI).",
            [0, 3, 0],
        ),
        (
            "Dorien i–v–IV–i",
            "Dorian i–v–IV–i",
            "Groove modal (sans IA).",
            "Modal groove (no AI).",
            [0, 4, 3, 0],
        ),
    ],
    "mixolydian": [
        (
            "Mixolydien I–bVII–IV",
            "Mixolydian I–bVII–IV",
            "Rock classique (sans IA).",
            "Classic rock (no AI).",
            [0, 6, 3],
        ),
        (
            "Mixolydien I–IV–I–bVII",
            "Mixolydian I–IV–I–bVII",
            "Cadence dominante (sans IA).",
            "Dominant cadence (no AI).",
            [0, 3, 0, 6],
        ),
    ],
    "phrygian": [
        (
            "Phrygien i–bII–bVII",
            "Phrygian i–bII–bVII",
            "Couleur flamenco / metal (sans IA).",
            "Flamenco / metal color (no AI).",
            [0, 1, 6],
        ),
        (
            "Phrygien i–bVI–bVII",
            "Phrygian i–bVI–bVII",
            "Tension orientale (sans IA).",
            "Oriental tension (no AI).",
            [0, 5, 6, 0],
        ),
    ],
    "lydian": [
        (
            "Lydien I–II",
            "Lydian I–II",
            "Couleur dream pop (sans IA).",
            "Dream pop color (no AI).",
            [0, 1, 0],
        ),
        (
            "Lydien I–V–vi–II",
            "Lydian I–V–vi–II",
            "Ouverture lumineuse (sans IA).",
            "Bright opening (no AI).",
            [0, 4, 5, 1],
        ),
    ],
    "major": [
        (
            "Pop I–V–vi–IV",
            "Pop I–V–vi–IV",
            "Progression pop la plus courante (sans IA).",
            "Most common pop progression (no AI).",
            [0, 4, 5, 3],
        ),
        (
            "Classique I–IV–V–I",
            "Classic I–IV–V–I",
            "Cadence fondamentale (sans IA).",
            "Fundamental cadence (no AI).",
            [0, 3, 4, 0],
        ),
        (
            "Ballade vi–IV–I–V",
            "Ballad vi–IV–I–V",
            "Couleur émotionnelle (sans IA).",
            "Emotional color (no AI).",
            [5, 3, 0, 4],
        ),
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


def _templates_for_scale(
    scale_key: str,
) -> list[tuple[str, str, str, str, list[int]]]:
    if scale_key in _PROGRESSION_TEMPLATES:
        return _PROGRESSION_TEMPLATES[scale_key]
    if scale_key == "ionian":
        return _PROGRESSION_TEMPLATES["major"]
    return _PROGRESSION_TEMPLATES["major"]


def _resize_degrees(degrees: list[int], chord_count: int) -> list[int]:
    if chord_count <= 0:
        return []
    if len(degrees) >= chord_count:
        return degrees[:chord_count]
    resized = list(degrees)
    while len(resized) < chord_count:
        resized.append(degrees[len(resized) % len(degrees)])
    return resized


def recommend_progressions_fallback(
    scale_key: str,
    root_pc: int,
    *,
    chord_count: int = 4,
    locale: str | Locale = "fr",
) -> dict:
    loc = parse_locale(locale)
    intervals = SCALES.get(scale_key)
    if intervals is None:
        return {
            "scale_key": scale_key,
            "root_pc": root_pc,
            "chord_count": chord_count,
            "locale": loc,
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
    for fr_name, en_name, fr_desc, en_desc, degrees in templates:
        sized = _resize_degrees(degrees, chord_count)
        if scale_key == "blues":
            chords = [_chord(pcs, d, "7", romans[d % len(romans)]) for d in sized]
        else:
            chords = [at(d) for d in sized]
        progressions.append(
            {
                "name": pick(loc, fr_name, en_name),
                "description": pick(loc, fr_desc, en_desc),
                "chords": chords,
            }
        )

    return {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "chord_count": chord_count,
        "locale": loc,
        "source": "rules",
        "progressions": progressions,
    }
