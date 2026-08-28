"""Internationalisation FR / EN pour l'API guitare."""

from __future__ import annotations

from typing import Literal

Locale = Literal["fr", "en"]
DEFAULT_LOCALE: Locale = "fr"


def parse_locale(value: str | None) -> Locale:
    if value and value.strip().lower() in {"fr", "en"}:
        return value.strip().lower()  # type: ignore[return-value]
    return DEFAULT_LOCALE


SCALE_LABELS_I18N: dict[str, dict[Locale, str]] = {
    "major": {"fr": "Majeure", "en": "Major"},
    "minor": {"fr": "Mineure naturelle", "en": "Natural minor"},
    "harmonicMinor": {"fr": "Mineure harmonique", "en": "Harmonic minor"},
    "melodicMinor": {
        "fr": "Mineure mélodique (asc.)",
        "en": "Melodic minor (asc.)",
    },
    "melodicMinorDesc": {
        "fr": "Mineure mélodique (desc.)",
        "en": "Melodic minor (desc.)",
    },
    "blues": {"fr": "Blues", "en": "Blues"},
    "pentatonic": {"fr": "Pentatonique majeure", "en": "Major pentatonic"},
    "pentatonicMinor": {
        "fr": "Pentatonique mineure",
        "en": "Minor pentatonic",
    },
    "wholeTone": {"fr": "Gamme par tons", "en": "Whole tone"},
    "ionian": {"fr": "Ionien", "en": "Ionian"},
    "dorian": {"fr": "Dorien", "en": "Dorian"},
    "phrygian": {"fr": "Phrygien", "en": "Phrygian"},
    "lydian": {"fr": "Lydien", "en": "Lydian"},
    "mixolydian": {"fr": "Mixolydien", "en": "Mixolydian"},
    "locrian": {"fr": "Locrien", "en": "Locrian"},
    "phrygianDominant": {
        "fr": "Phrygien dominant",
        "en": "Phrygian dominant",
    },
    "lydianB7": {"fr": "Lydien ♭7", "en": "Lydian ♭7"},
    "superLocrian": {"fr": "Super Locrien", "en": "Super Locrian"},
    "doubleHarmonicMinor": {
        "fr": "Double harmonique",
        "en": "Double harmonic",
    },
    "hungarianMinor": {"fr": "Hongroise", "en": "Hungarian minor"},
    "hirajoshi": {"fr": "Hirajoshi", "en": "Hirajoshi"},
    "egyptian": {"fr": "Égyptienne", "en": "Egyptian"},
}

CHORD_LABELS_I18N: dict[str, dict[Locale, str]] = {
    "M": {"fr": "Majeur", "en": "Major"},
    "m": {"fr": "Mineur", "en": "Minor"},
    "7": {"fr": "7ème dominante", "en": "Dominant 7th"},
    "m7": {"fr": "Mineur 7", "en": "Minor 7"},
    "maj7": {"fr": "Majeur 7", "en": "Major 7"},
    "dim": {"fr": "Diminué", "en": "Diminished"},
    "aug": {"fr": "Augmenté", "en": "Augmented"},
    "sus2": {"fr": "Sus 2", "en": "Sus 2"},
    "sus4": {"fr": "Sus 4", "en": "Sus 4"},
    "9": {"fr": "9ème dominante", "en": "Dominant 9th"},
    "maj9": {"fr": "Majeur 9", "en": "Major 9"},
    "m9": {"fr": "Mineur 9", "en": "Minor 9"},
    "add9": {"fr": "Add 9", "en": "Add 9"},
    "madd9": {"fr": "Mineur add 9", "en": "Minor add 9"},
}

LIBRARY_GROUPS_I18N: dict[Locale, list[dict]] = {
    "fr": [
        {"title": "Triades", "keys": ["M", "m", "dim", "aug", "sus2", "sus4"]},
        {"title": "Septièmes", "keys": ["7", "maj7", "m7"]},
        {"title": "Neuvièmes", "keys": ["9", "maj9", "m9", "add9", "madd9"]},
    ],
    "en": [
        {
            "title": "Triads",
            "keys": ["M", "m", "dim", "aug", "sus2", "sus4"],
        },
        {"title": "Sevenths", "keys": ["7", "maj7", "m7"]},
        {
            "title": "Ninths",
            "keys": ["9", "maj9", "m9", "add9", "madd9"],
        },
    ],
}


def scale_label(scale_key: str, locale: Locale = DEFAULT_LOCALE) -> str:
    entry = SCALE_LABELS_I18N.get(scale_key)
    if not entry:
        return scale_key
    return entry.get(locale) or entry["fr"]


def chord_label(chord_type: str, locale: Locale = DEFAULT_LOCALE) -> str:
    entry = CHORD_LABELS_I18N.get(chord_type)
    if not entry:
        return chord_type
    return entry.get(locale) or entry["fr"]


def pick(locale: Locale, fr: str, en: str) -> str:
    return en if locale == "en" else fr
