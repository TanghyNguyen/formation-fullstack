"""Harmonisation diatonique (7 notes) ou adaptée (moins de 7 notes)."""

from caged import CHORD_LABELS
from scales import SCALE_LABELS, SCALES, scale_degrees_from_root

NOTE_NAMES_SHARP = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
]

_ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]

_INTERVAL_ROMAN = {
    0: "I",
    1: "bII",
    2: "II",
    3: "bIII",
    4: "III",
    5: "IV",
    6: "#IV",
    7: "V",
    8: "bVI",
    9: "VI",
    10: "bVII",
    11: "VII",
}

# Progressions classiques en indices de degrés (0-based)
_MAJOR_PROGRESSIONS: list[tuple[str, str, list[int]]] = [
    ("I–vi–ii–V", "Turnaround jazz / cadence classique.", [0, 5, 1, 4]),
    ("I–vi–IV–V", "Progression doo-wop / ballade.", [0, 5, 3, 4]),
    ("I–V–vi–IV", "Progression pop la plus courante.", [0, 4, 5, 3]),
    ("I–vi–iii–vii°", "Couleur plus sombre sur la gamme majeure.", [0, 5, 2, 6]),
]

_MINOR_PROGRESSIONS: list[tuple[str, str, list[int]]] = [
    ("i–VI–III–VII", "Progression pop mineure classique.", [0, 5, 2, 6]),
    ("i–iv–v–i", "Cadence mineure naturelle.", [0, 3, 4, 0]),
    ("i–VI–VII–i", "Couleur andalouse / rock mineur.", [0, 5, 6, 0]),
    ("i–VII–VI–V", "Descente chromatique émotionnelle.", [0, 6, 5, 4]),
]

_MODE_PROGRESSIONS: dict[str, list[tuple[str, str, list[int]]]] = {
    "major": _MAJOR_PROGRESSIONS,
    "ionian": _MAJOR_PROGRESSIONS,
    "minor": _MINOR_PROGRESSIONS,
    "aeolian": _MINOR_PROGRESSIONS,
    "harmonicMinor": [
        ("i–iv–V–i", "Cadence avec dominante majeure (sensible).", [0, 3, 4, 0]),
        ("i–VI–III–V", "Mineur harmonique dramatique.", [0, 5, 2, 4]),
        ("i–ii°–V–i", "Cadence classique orientale.", [0, 1, 4, 0]),
    ],
    "melodicMinor": [
        ("i–IV–V–i", "Jazz mineur mélodique.", [0, 3, 4, 0]),
        ("i–ii–V–i", "Couleur Bebop.", [0, 1, 4, 0]),
    ],
    "dorian": [
        ("i–IV–i", "Groove modal jazz / funk.", [0, 3, 0]),
        ("i–v–IV–i", "Dorien classique.", [0, 4, 3, 0]),
        ("i–bVII–IV–i", "Couleur rock modale.", [0, 6, 3, 0]),
    ],
    "mixolydian": [
        ("I–bVII–IV", "Rock classique mixolydien.", [0, 6, 3]),
        ("I–IV–I–bVII", "Cadence dominante.", [0, 3, 0, 6]),
        ("I–v–IV–I", "Couleur bluesy.", [0, 4, 3, 0]),
    ],
    "phrygian": [
        ("i–bII–bVII", "Couleur flamenco / metal.", [0, 1, 6]),
        ("i–bVI–bVII–i", "Tension orientale.", [0, 5, 6, 0]),
    ],
    "lydian": [
        ("I–II–I", "Couleur dream pop (#4).", [0, 1, 0]),
        ("I–V–vi–II", "Ouverture lumineuse.", [0, 4, 5, 1]),
    ],
    "locrian": [
        ("i°–bII–bIII", "Couleur très instable (locrien).", [0, 1, 2]),
    ],
}


def _triad_quality(root: int, third: int, fifth: int) -> tuple[str, str, str]:
    """Retourne (chord_type, third_label, fifth_label)."""
    third_interval = (third - root) % 12
    fifth_interval = (fifth - root) % 12

    if third_interval == 3:
        third_label = "tierce mineure"
    elif third_interval == 4:
        third_label = "tierce majeure"
    else:
        third_label = f"tierce atypique ({third_interval} demi-tons)"

    if fifth_interval == 6:
        fifth_label = "quinte diminuée"
    elif fifth_interval == 7:
        fifth_label = "quinte juste"
    elif fifth_interval == 8:
        fifth_label = "quinte augmentée"
    else:
        fifth_label = f"quinte atypique ({fifth_interval} demi-tons)"

    if third_interval == 4 and fifth_interval == 7:
        return "M", third_label, fifth_label
    if third_interval == 3 and fifth_interval == 7:
        return "m", third_label, fifth_label
    if third_interval == 3 and fifth_interval == 6:
        return "dim", third_label, fifth_label
    if third_interval == 4 and fifth_interval == 8:
        return "aug", third_label, fifth_label
    if third_interval == 3:
        return "m", third_label, fifth_label
    if third_interval == 4:
        return "M", third_label, fifth_label
    return "M", third_label, fifth_label


def _roman_for_quality(degree_index: int, chord_type: str) -> str:
    base = _ROMAN_BASE[degree_index]
    if chord_type == "m":
        return base.lower()
    if chord_type == "dim":
        return base.lower() + "°"
    if chord_type == "aug":
        return base + "+"
    return base


def _roman_from_interval(interval: int, chord_type: str) -> str:
    base = _INTERVAL_ROMAN[interval % 12]
    # Garder les altérations (b, #) en tête, adapter la casse du chiffre
    prefix = ""
    core = base
    if base.startswith("b") or base.startswith("#"):
        prefix = base[0]
        core = base[1:]
    if chord_type in {"m", "m7", "dim"}:
        core = core.lower()
    if chord_type == "dim":
        core = core + "°"
    if chord_type == "aug":
        core = core + "+"
    if chord_type == "7":
        core = core + "7"
    if chord_type == "m7":
        core = core + "7"
    return prefix + core


def _progression_templates(
    scale_key: str,
) -> list[tuple[str, str, list[int]]]:
    if scale_key in _MODE_PROGRESSIONS:
        return _MODE_PROGRESSIONS[scale_key]
    if "minor" in scale_key.lower() or scale_key in {
        "dorian",
        "phrygian",
        "locrian",
        "aeolian",
    }:
        return _MINOR_PROGRESSIONS
    return _MAJOR_PROGRESSIONS


def _best_chord_from_scale_tones(
    root: int,
    scale_set: set[int],
    *,
    prefer_dominant7: bool = False,
) -> tuple[str, list[int], str] | None:
    """Choisit le meilleur type d'accord dont les notes sont dans la gamme."""
    def has(semi: int) -> bool:
        return (root + semi) % 12 in scale_set

    m3, M3 = has(3), has(4)
    d5, P5, A5 = has(6), has(7), has(8)
    m7, M7 = has(10), has(11)
    sus2, sus4 = has(2), has(5)

    # Blues / rock : dominante 7 même si la tierce majeure n'est pas dans la gamme
    if prefer_dominant7 and P5 and m7:
        notes = [root, (root + 4) % 12, (root + 7) % 12, (root + 10) % 12]
        return "7", notes, "accord de 7ème dominante (harmonie blues / rock)"

    if M3 and P5 and m7:
        notes = [root, (root + 4) % 12, (root + 7) % 12, (root + 10) % 12]
        return "7", notes, "tierce majeure + quinte juste + 7ème mineure"
    if m3 and P5 and m7:
        notes = [root, (root + 3) % 12, (root + 7) % 12, (root + 10) % 12]
        return "m7", notes, "tierce mineure + quinte juste + 7ème mineure"
    if M3 and P5 and M7:
        notes = [root, (root + 4) % 12, (root + 7) % 12, (root + 11) % 12]
        return "maj7", notes, "tierce majeure + quinte juste + 7ème majeure"
    if M3 and P5:
        return "M", [root, (root + 4) % 12, (root + 7) % 12], "tierce majeure + quinte juste"
    if m3 and P5:
        return "m", [root, (root + 3) % 12, (root + 7) % 12], "tierce mineure + quinte juste"
    if m3 and d5:
        return "dim", [root, (root + 3) % 12, (root + 6) % 12], "tierce mineure + quinte diminuée"
    if M3 and A5:
        return "aug", [root, (root + 4) % 12, (root + 8) % 12], "tierce majeure + quinte augmentée"
    if P5 and sus2:
        return "sus2", [root, (root + 2) % 12, (root + 7) % 12], "seconde + quinte juste (sus2)"
    if P5 and sus4:
        return "sus4", [root, (root + 5) % 12, (root + 7) % 12], "quarte + quinte juste (sus4)"
    if P5:
        # Triade incomplète : on expose quand même un majeur/mineur selon la tierce dispo
        if M3:
            return "M", [root, (root + 4) % 12, (root + 7) % 12], "quinte juste (tierce majeure)"
        if m3:
            return "m", [root, (root + 3) % 12, (root + 7) % 12], "quinte juste (tierce mineure)"
    return None


def _build_progressions_from_chords(
    chords: list[dict],
    templates: list[tuple[str, str, list[int]]],
) -> list[dict]:
    if not chords:
        return []
    n = len(chords)
    progressions: list[dict] = []
    for _name, description, degrees in templates:
        # Ignorer les templates qui dépassent le nombre de degrés disponibles
        if any(d >= n for d in degrees):
            continue
        prog_chords = [
            {
                "root_pc": chords[d]["root_pc"],
                "chord_type": chords[d]["chord_type"],
                "roman": chords[d]["roman"],
            }
            for d in degrees
        ]
        roman_seq = "–".join(chords[d]["roman"] for d in degrees)
        progressions.append(
            {
                "name": roman_seq,
                "description": description,
                "chords": prog_chords,
            }
        )
    return progressions


def _harmonize_diatonic(
    scale_key: str,
    root_pc: int,
    pcs: list[int],
    tonic_name: str,
    scale_label: str,
) -> dict:
    chords: list[dict] = []
    for i in range(7):
        root = pcs[i]
        third = pcs[(i + 2) % 7]
        fifth = pcs[(i + 4) % 7]
        chord_type, third_label, fifth_label = _triad_quality(root, third, fifth)
        roman = _roman_for_quality(i, chord_type)
        quality_label = CHORD_LABELS.get(chord_type, chord_type)
        note_names = [
            NOTE_NAMES_SHARP[root],
            NOTE_NAMES_SHARP[third],
            NOTE_NAMES_SHARP[fifth],
        ]
        chords.append(
            {
                "degree": i + 1,
                "roman": roman,
                "root_pc": root,
                "chord_type": chord_type,
                "note_names": note_names,
                "quality_label": quality_label,
                "explanation": (
                    f"Degré {i + 1} ({roman}) : {third_label} + {fifth_label} "
                    f"→ accord {quality_label.lower()} "
                    f"({', '.join(note_names)})."
                ),
            }
        )

    progressions = _build_progressions_from_chords(
        chords, _progression_templates(scale_key)
    )

    return {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "mode": "diatonic",
        "explanation": (
            f"En empilant une tierce puis une quinte sur chaque degré de "
            f"{tonic_name} {scale_label}, on obtient 7 accords diatoniques. "
            f"Leur nature (majeur, mineur, diminué…) dépend des intervalles "
            f"présents dans la gamme — la structure se transpose dans "
            f"n’importe quelle tonalité."
        ),
        "available": True,
        "chords": chords,
        "progressions": progressions,
    }


def _blues_progressions(chords_by_interval: dict[int, dict]) -> list[dict]:
    """Progressions blues classiques à partir des accords I / IV / V disponibles."""
    templates = [
        ([0, 5, 7], "Blues de base I7–IV7–V7."),
        ([0, 5, 0, 7], "Turnaround blues I–IV–I–V."),
        ([0, 0, 5, 0, 7, 5, 0], "Plan 12 mesures simplifié (I–I–IV–I–V–IV–I)."),
    ]
    progressions = []
    for intervals, description in templates:
        if not all(i in chords_by_interval for i in set(intervals)):
            continue
        prog_chords = [
            {
                "root_pc": chords_by_interval[i]["root_pc"],
                "chord_type": chords_by_interval[i]["chord_type"],
                "roman": chords_by_interval[i]["roman"],
            }
            for i in intervals
        ]
        # Dédupliquer l'affichage du nom pour le plan long
        if len(intervals) > 4:
            name = "I7–IV7–V7 (12 mesures)"
        else:
            name = "–".join(chords_by_interval[i]["roman"] for i in intervals)
        progressions.append(
            {"name": name, "description": description, "chords": prog_chords}
        )
    return progressions


def _harmonize_adapted(
    scale_key: str,
    root_pc: int,
    pcs: list[int],
    tonic_name: str,
    scale_label: str,
) -> dict:
    scale_set = set(pcs)
    is_blues = scale_key == "blues"
    # Pour le blues : forcer I7 / IV7 / V7 (harmonie dominante traditionnelle)
    blues_roots = {
        0: root_pc,
        5: (root_pc + 5) % 12,
        7: (root_pc + 7) % 12,
    }

    chords: list[dict] = []
    chords_by_interval: dict[int, dict] = {}

    if is_blues:
        for interval, chord_root in blues_roots.items():
            chord_type = "7"
            notes = [
                chord_root,
                (chord_root + 4) % 12,
                (chord_root + 7) % 12,
                (chord_root + 10) % 12,
            ]
            roman = _roman_from_interval(interval, chord_type)
            quality_label = CHORD_LABELS.get(chord_type, chord_type)
            note_names = [NOTE_NAMES_SHARP[n] for n in notes]
            chord = {
                "degree": len(chords) + 1,
                "roman": roman,
                "root_pc": chord_root,
                "chord_type": chord_type,
                "note_names": note_names,
                "quality_label": quality_label,
                "explanation": (
                    f"{roman} : harmonie blues dominante "
                    f"({', '.join(note_names)}) — la tierce majeure peut "
                    f"sortir de la gamme blues."
                ),
            }
            chords.append(chord)
            chords_by_interval[interval] = chord

        # Accords supplémentaires construits uniquement avec les notes de la gamme
        for pc in pcs:
            interval = (pc - root_pc) % 12
            if interval in chords_by_interval:
                continue
            built = _best_chord_from_scale_tones(pc, scale_set)
            if built is None:
                continue
            chord_type, notes, reason = built
            roman = _roman_from_interval(interval, chord_type)
            quality_label = CHORD_LABELS.get(chord_type, chord_type)
            note_names = [NOTE_NAMES_SHARP[n] for n in notes]
            chord = {
                "degree": len(chords) + 1,
                "roman": roman,
                "root_pc": pc,
                "chord_type": chord_type,
                "note_names": note_names,
                "quality_label": quality_label,
                "explanation": (
                    f"{roman} : {reason} → {quality_label.lower()} "
                    f"({', '.join(note_names)})."
                ),
            }
            chords.append(chord)
            chords_by_interval[interval] = chord

        progressions = _blues_progressions(chords_by_interval)
        explanation = (
            f"« {tonic_name} {scale_label} » a {len(pcs)} notes : bascule "
            f"automatique en harmonisation adaptée. Pour le blues, on utilise "
            f"surtout les dominantes I7–IV7–V7 (transposables), complétées "
            f"par des accords issus des notes de la gamme."
        )
    else:
        for index, pc in enumerate(pcs):
            built = _best_chord_from_scale_tones(pc, scale_set)
            if built is None:
                continue
            chord_type, notes, reason = built
            interval = (pc - root_pc) % 12
            roman = _roman_from_interval(interval, chord_type)
            quality_label = CHORD_LABELS.get(chord_type, chord_type)
            note_names = [NOTE_NAMES_SHARP[n] for n in notes]
            chord = {
                "degree": index + 1,
                "roman": roman,
                "root_pc": pc,
                "chord_type": chord_type,
                "note_names": note_names,
                "quality_label": quality_label,
                "explanation": (
                    f"Degré sur {NOTE_NAMES_SHARP[pc]} ({roman}) : {reason} "
                    f"→ {quality_label.lower()} ({', '.join(note_names)})."
                ),
            }
            chords.append(chord)
            chords_by_interval[interval] = chord

        # Progressions génériques sur les 1ers accords disponibles
        templates: list[tuple[str, str, list[int]]] = []
        if len(chords) >= 3:
            templates.append(
                ("suite-1", "Enchaînement simple sur les premiers degrés disponibles.", [0, 1, 2, 0])
            )
        if len(chords) >= 4:
            templates.append(
                ("suite-2", "Tour complet des accords principaux de la gamme.", [0, 2, 3, 1])
            )
        if 0 in chords_by_interval and 5 in chords_by_interval and 7 in chords_by_interval:
            # Indices dans la liste chords
            idx = {c["root_pc"]: i for i, c in enumerate(chords)}
            i_iv_v = [
                idx[chords_by_interval[0]["root_pc"]],
                idx[chords_by_interval[5]["root_pc"]],
                idx[chords_by_interval[7]["root_pc"]],
            ]
            templates.insert(
                0,
                ("I–IV–V", "Cadence fondamentale adaptée à cette gamme.", i_iv_v + [i_iv_v[0]]),
            )
        progressions = _build_progressions_from_chords(chords, templates)
        explanation = (
            f"« {tonic_name} {scale_label} » a {len(pcs)} notes (pas 7) : "
            f"bascule automatique en harmonisation adaptée. Chaque note de la "
            f"gamme devient une fondamentale possible ; on construit l’accord "
            f"le plus riche possible uniquement avec les sons de la gamme."
        )

    return {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "mode": "adapted",
        "explanation": explanation,
        "available": True,
        "chords": chords,
        "progressions": progressions,
    }


def harmonize_scale(scale_key: str, root_pc: int) -> dict:
    intervals = SCALES.get(scale_key)
    if intervals is None:
        return {
            "scale_key": scale_key,
            "root_pc": root_pc,
            "mode": "none",
            "explanation": f"Gamme « {scale_key} » inconnue.",
            "available": False,
            "chords": [],
            "progressions": [],
        }

    pcs = scale_degrees_from_root(root_pc, intervals)
    scale_label = SCALE_LABELS.get(scale_key, scale_key)
    tonic_name = NOTE_NAMES_SHARP[root_pc]

    if len(pcs) == 7:
        return _harmonize_diatonic(
            scale_key, root_pc, pcs, tonic_name, scale_label
        )

    return _harmonize_adapted(scale_key, root_pc, pcs, tonic_name, scale_label)
