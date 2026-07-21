"""Recommandations de progressions d'accords via LLM (Ollama, Groq, OpenAI)."""

import json
import os
import time

from openai import APIConnectionError, APIStatusError, AuthenticationError
from pydantic import BaseModel, Field, ValidationError

from caged import CHORD_ORDER
from i18n import Locale, parse_locale, pick, scale_label
from llm_provider import resolve_llm_provider
from scales import SCALES, pitch_classes_from_root, scale_degrees_from_root

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

VALID_CHORD_TYPES = set(CHORD_ORDER)


class ChordStep(BaseModel):
    root_pc: int = Field(..., ge=0, le=11)
    chord_type: str
    roman: str = ""


class Progression(BaseModel):
    name: str
    description: str
    chords: list[ChordStep] = Field(..., min_length=3, max_length=8)


class ProgressionsPayload(BaseModel):
    progressions: list[Progression] = Field(..., min_length=1, max_length=3)


def _sanitize_chord(step: ChordStep) -> ChordStep | None:
    if step.chord_type not in VALID_CHORD_TYPES:
        return None
    return step


def _sanitize_progressions(
    payload: ProgressionsPayload,
    chord_count: int,
) -> list[dict]:
    cleaned: list[dict] = []
    for progression in payload.progressions:
        chords = []
        for step in progression.chords:
            sanitized = _sanitize_chord(step)
            if sanitized:
                chords.append(sanitized.model_dump())
        if len(chords) > chord_count:
            chords = chords[:chord_count]
        if len(chords) >= 3:
            cleaned.append(
                {
                    "name": progression.name.strip(),
                    "description": progression.description.strip(),
                    "chords": chords,
                }
            )
    return cleaned


def _is_tonic_roman(roman: str) -> bool:
    core = (
        roman.strip()
        .replace("maj7", "")
        .replace("m7", "")
        .replace("7", "")
        .replace("°", "")
        .replace("+", "")
        .replace("M", "")
        .replace("m", "")
    )
    return core in {"I", "i"}


def _chords_in_scale(chords: list[dict], scale_pcs: set[int]) -> bool:
    return all(chord["root_pc"] in scale_pcs for chord in chords)


def _transpose_chords(chords: list[dict], delta: int) -> list[dict]:
    return [
        {**chord, "root_pc": (chord["root_pc"] + delta) % 12} for chord in chords
    ]


def _align_progressions_to_root(
    progressions: list[dict],
    root_pc: int,
    scale_pcs: set[int],
) -> list[dict]:
    """Corrige les progressions IA renvoyées dans la mauvaise tonalité (souvent Do)."""
    aligned: list[dict] = []
    for progression in progressions:
        chords = progression["chords"]
        if _chords_in_scale(chords, scale_pcs) and any(
            chord["root_pc"] == root_pc for chord in chords
        ):
            aligned.append(progression)
            continue

        tonic = next(
            (chord for chord in chords if _is_tonic_roman(chord.get("roman", ""))),
            chords[0],
        )
        delta = (root_pc - tonic["root_pc"]) % 12
        shifted = _transpose_chords(chords, delta)
        if _chords_in_scale(shifted, scale_pcs):
            aligned.append({**progression, "chords": shifted})

    return aligned


def _build_prompt(
    scale_key: str,
    root_pc: int,
    chord_count: int,
    locale: Locale = "fr",
) -> str:
    intervals = SCALES[scale_key]
    scale_notes = [NOTE_NAMES_SHARP[pc] for pc in scale_degrees_from_root(root_pc, intervals)]
    highlight_notes = [NOTE_NAMES_SHARP[pc] for pc in pitch_classes_from_root(root_pc, intervals)]
    root_name = NOTE_NAMES_SHARP[root_pc]
    display_name = scale_label(scale_key, locale)
    chord_types = ", ".join(CHORD_ORDER)
    tonic_type = "m" if "minor" in scale_key.lower() or scale_key in {
        "dorian",
        "phrygian",
        "locrian",
        "blues",
        "pentatonicMinor",
    } else "M"
    tonic_roman = "i" if tonic_type == "m" else "I"
    language = "English" if locale == "en" else "French"
    language_instruction = pick(
        locale,
        (
            "Écris les champs `name` et `description` en français. "
            "Garde root_pc, chord_type et roman en codes techniques inchangés."
        ),
        (
            "Write the `name` and `description` fields in English. "
            "Keep root_pc, chord_type and roman as unchanged technical codes."
        ),
    )

    return f"""Tu es un professeur de guitare et d'harmonie.

Language for text fields: {language}.
{language_instruction}

Contexte :
- Gamme : {display_name} (clé technique "{scale_key}")
- Tonique : {root_name} (root_pc={root_pc})  ← OBLIGATOIRE pour l'accord I/i
- Notes de la gamme (ordre diatonique) : {", ".join(scale_notes)}
- Notes sur le manche (toutes tonalités) : {", ".join(highlight_notes)}
- Types d'accords autorisés : {chord_types}

Tâche :
Propose exactement 2 progressions d'accords de **exactement {chord_count} accords chacune** cohérentes avec **cette gamme précise** ({display_name} en {root_name}).
Les accords doivent respecter l'harmonie de cette gamme — pas une autre.
Chaque `root_pc` DOIT être une des pitch classes diatoniques : {", ".join(str(pc) for pc in scale_degrees_from_root(root_pc, intervals))}.
L'accord de tonique (I/i) DOIT avoir root_pc={root_pc} ({root_name}).

Réponds UNIQUEMENT en JSON valide avec ce schéma :
{{
  "progressions": [
    {{
      "name": "Nom court de la progression",
      "description": "Une phrase expliquant l'ambiance ou l'usage",
      "chords": [
        {{ "root_pc": {root_pc}, "chord_type": "{tonic_type}", "roman": "{tonic_roman}" }}
      ]
    }}
  ]
}}

Règles :
- Chaque progression DOIT contenir exactement {chord_count} accords (ni plus, ni moins)
- root_pc entier entre 0 et 11, parmi les notes de la gamme
- chord_type parmi la liste autorisée
- roman en chiffres romains (I, ii, V7, etc.)
- Ne JAMAIS renvoyer une progression en Do (root_pc=0) si la tonique demandée est autre
- Progressions musicalement plausibles pour {root_name} {display_name}
- name et description DOIVENT être rédigés en {language}
"""


_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = int(os.getenv("PROGRESSIONS_CACHE_TTL", "3600"))


def _cache_enabled() -> bool:
    return os.getenv("PROGRESSIONS_CACHE", "true").lower() in {"1", "true", "yes"}


def _cache_key(
    scale_key: str,
    root_pc: int,
    provider_name: str,
    model: str,
    chord_count: int,
    locale: Locale = "fr",
) -> str:
    return f"{provider_name}:{model}:{scale_key}:{root_pc}:{chord_count}:{locale}"


def recommend_progressions_ai(
    scale_key: str,
    root_pc: int,
    *,
    force_refresh: bool = False,
    chord_count: int = 4,
    locale: str | Locale = "fr",
) -> dict:
    if chord_count < 3 or chord_count > 8:
        raise ValueError("chord_count must be between 3 and 8")

    loc = parse_locale(locale)
    provider = resolve_llm_provider()
    key = _cache_key(
        scale_key, root_pc, provider.name, provider.model, chord_count, loc
    )

    if (
        not force_refresh
        and _cache_enabled()
        and key in _CACHE
    ):
        cached_at, cached_result = _CACHE[key]
        if time.time() - cached_at < _CACHE_TTL_SECONDS:
            result = dict(cached_result)
            result["cached"] = True
            return result

    prompt = _build_prompt(scale_key, root_pc, chord_count, loc)
    if force_refresh:
        prompt += (
            "\n\nIMPORTANT : propose des progressions DIFFÉRENTES "
            "des classiques trop évidentes (varie les degrés et l'ambiance)."
        )
    request_kwargs: dict = {
        "model": provider.model,
        "temperature": 0.95 if force_refresh else 0.7,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Tu réponds uniquement en JSON strict, sans markdown, "
                    "pour des progressions d'accords de guitare."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }
    if provider.name in {"openai", "groq"}:
        request_kwargs["response_format"] = {"type": "json_object"}

    try:
        response = provider.client.chat.completions.create(**request_kwargs)
    except APIConnectionError as exc:
        if provider.name == "ollama":
            raise RuntimeError(
                "Ollama n'est pas démarré — lance `ollama serve` puis "
                "`ollama pull llama3.2`"
            ) from exc
        raise RuntimeError(f"LLM connection error ({provider.name}): {exc}") from exc
    except AuthenticationError as exc:
        raise RuntimeError(
            f"Invalid API key for provider '{provider.name}'"
        ) from exc
    except APIStatusError as exc:
        if exc.status_code == 429:
            raise RuntimeError(
                f"{provider.name.upper()}_QUOTA_EXCEEDED — change de fournisseur "
                "(AI_PROVIDER=ollama) ou attends le reset du quota"
            ) from exc
        raise RuntimeError(f"LLM API error ({provider.name}): {exc}") from exc

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError(f"Empty response from {provider.name}")

    try:
        raw = json.loads(content)
        payload = ProgressionsPayload.model_validate(raw)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise RuntimeError(f"Invalid AI response: {exc}") from exc

    progressions = _sanitize_progressions(payload, chord_count)
    scale_pcs = set(scale_degrees_from_root(root_pc, SCALES[scale_key]))
    progressions = _align_progressions_to_root(progressions, root_pc, scale_pcs)
    if not progressions:
        raise RuntimeError("AI returned no valid progressions for this tonic")

    result = {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "chord_count": chord_count,
        "locale": loc,
        "source": provider.name,
        "model": provider.model,
        "progressions": progressions,
        "cached": False,
    }
    if _cache_enabled():
        _CACHE[key] = (time.time(), result)
    return result
