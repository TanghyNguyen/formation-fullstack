OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH = [4, 9, 2, 7, 11, 4]

CAGED_POSITIONS = ["C", "A", "G", "E", "D"]

CHORD_ORDER = [
    "M",
    "m",
    "7",
    "m7",
    "maj7",
    "dim",
    "aug",
    "sus2",
    "sus4",
    "9",
    "maj9",
    "m9",
    "add9",
    "madd9",
]

CHORD_LABELS = {
    "M": "Majeur",
    "m": "Mineur",
    "7": "7ème dominante",
    "m7": "Mineur 7",
    "maj7": "Majeur 7",
    "dim": "Diminué",
    "aug": "Augmenté",
    "sus2": "Sus 2",
    "sus4": "Sus 4",
    "9": "9ème dominante",
    "maj9": "Majeur 9",
    "m9": "Mineur 9",
    "add9": "Add 9",
    "madd9": "Mineur add 9",
}

CHORD_INTERVALS = {
    "M": [0, 4, 7],
    "m": [0, 3, 7],
    "7": [0, 4, 7, 10],
    "m7": [0, 3, 7, 10],
    "maj7": [0, 4, 7, 11],
    "dim": [0, 3, 6],
    "aug": [0, 4, 8],
    "sus2": [0, 2, 7],
    "sus4": [0, 5, 7],
    "9": [0, 2, 4, 7, 10],
    "maj9": [0, 2, 4, 7, 11],
    "m9": [0, 2, 3, 7, 10],
    "add9": [0, 2, 4, 7],
    "madd9": [0, 2, 3, 7],
}

LIBRARY_GROUPS = [
    {"title": "Triades", "keys": ["M", "m", "dim", "aug", "sus2", "sus4"]},
    {"title": "Septièmes", "keys": ["7", "maj7", "m7"]},
    {"title": "Neuvièmes", "keys": ["9", "maj9", "m9", "add9", "madd9"]},
]

SHAPES: dict[str, dict[str, dict[str, int | list[int]]]] = {
    "M": {
        "C": {"off": [-1, 3, 2, 0, 1, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 2, 2, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 0, 0, 3], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 2, 1, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 3, 2], "rs": 2, "ro": 0},
    },
    "m": {
        "C": {"off": [-1, 3, 1, 0, 1, -1], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 2, 1, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 1, 0, 0, -1, 3], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 2, 0, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 3, 1], "rs": 2, "ro": 0},
    },
    "7": {
        "C": {"off": [-1, 3, 2, 3, 1, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 0, 2, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 0, 0, 1], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 0, 1, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 1, 2], "rs": 2, "ro": 0},
    },
    "m7": {
        "C": {"off": [-1, 3, 1, 3, 1, -1], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 0, 1, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 1, 0, 0, -1, 1], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 0, 0, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 1, 1], "rs": 2, "ro": 0},
    },
    "maj7": {
        "C": {"off": [-1, 3, 2, 0, 0, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 1, 2, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 0, 0, 2], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 1, 1, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 2, 2], "rs": 2, "ro": 0},
    },
    "dim": {
        "A": {"off": [-1, 0, 1, 2, 1, 0], "rs": 1, "ro": 0},
        "E": {"off": [0, 1, 2, 0, 0, -1], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 1, 3, 1], "rs": 2, "ro": 0},
    },
    "aug": {
        "A": {"off": [-1, 0, 3, 2, 2, -1], "rs": 1, "ro": 0},
        "E": {"off": [0, 3, 2, 1, 0, -1], "rs": 0, "ro": 0},
    },
    "sus2": {
        "A": {"off": [-1, 0, 2, 2, 0, 0], "rs": 1, "ro": 0},
        "E": {"off": [0, 2, 4, 4, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 3, 0], "rs": 2, "ro": 0},
    },
    "sus4": {
        "A": {"off": [-1, 0, 2, 2, 3, 0], "rs": 1, "ro": 0},
        "E": {"off": [0, 2, 2, 2, 0, 0], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 3, 3], "rs": 2, "ro": 0},
    },
    "9": {
        "C": {"off": [-1, 3, 2, 3, 3, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 0, 2, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 2, 0, 1], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 0, 1, 0, 2], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 1, 0], "rs": 2, "ro": 0},
    },
    "maj9": {
        "C": {"off": [-1, 3, 2, 4, 3, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 1, 0, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 2, 0, 2], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 1, 1, 0, 2], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 2, 0], "rs": 2, "ro": 0},
    },
    "m9": {
        "C": {"off": [-1, 3, 1, 3, 3, -1], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 4, 1, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 1, 0, 2, -1, 1], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 0, 0, 0, 2], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 1, 1], "rs": 2, "ro": 0},
    },
    "add9": {
        "C": {"off": [-1, 3, 2, 0, 3, 0], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 4, 2, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 2, 0, 2, 0, 3], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 2, 1, 0, 2], "rs": 0, "ro": 0},
        "D": {"off": [-1, -1, 0, 2, 3, 0], "rs": 2, "ro": 0},
    },
    "madd9": {
        "C": {"off": [-1, 3, 1, 0, 3, -1], "rs": 1, "ro": 3},
        "A": {"off": [-1, 0, 2, 4, 1, 0], "rs": 1, "ro": 0},
        "G": {"off": [3, 1, 0, 2, -1, 3], "rs": 0, "ro": 3},
        "E": {"off": [0, 2, 2, 0, 0, 2], "rs": 0, "ro": 0},
    },
}


def compute_frets(root_pc: int, shape: dict[str, int | list[int]]) -> list[int]:
    rs = int(shape["rs"])
    ro = int(shape["ro"])
    off = shape["off"]
    assert isinstance(off, list)

    tf = (root_pc - OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH[rs] + 12) % 12
    base = tf - ro
    if base < 0:
        base += 12
    return [o if o == -1 else base + o for o in off]


def get_shape(chord_type: str, position: str) -> dict[str, int | list[int]] | None:
    return SHAPES.get(chord_type, {}).get(position)


def list_chord_types(locale: str = "fr") -> list[dict]:
    from i18n import chord_label, parse_locale

    loc = parse_locale(locale)
    return [
        {
            "key": key,
            "label": chord_label(key, loc),
            "intervals": CHORD_INTERVALS[key],
            "positions": list(SHAPES[key].keys()),
        }
        for key in CHORD_ORDER
    ]


def library_groups(locale: str = "fr") -> list[dict]:
    from i18n import LIBRARY_GROUPS_I18N, parse_locale

    return LIBRARY_GROUPS_I18N[parse_locale(locale)]
