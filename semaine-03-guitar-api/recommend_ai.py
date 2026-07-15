"""Recommandations de progressions d'accords via LLM (Ollama, Groq, OpenAI)."""

import json
from pydantic import BaseModel, Field, ValidationError

from caged import CHORD_ORDER
from llm_provider import resolve_llm_provider
from scales import SCALE_LABELS, SCALES, pitch_classes_from_root, scale_degrees_from_root

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


def _sanitize_progressions(payload: ProgressionsPayload) -> list[dict]:
    cleaned: list[dict] = []
    for progression in payload.progressions:
        chords = []
        for step in progression.chords:
            sanitized = _sanitize_chord(step)
            if sanitized:
                chords.append(sanitized.model_dump())
        if len(chords) >= 3:
            cleaned.append(
                {
                    "name": progression.name.strip(),
                    "description": progression.description.strip(),
                    "chords": chords,
                }
            )
    return cleaned


def _build_prompt(scale_key: str, root_pc: int) -> str:
    intervals = SCALES[scale_key]
    scale_notes = [NOTE_NAMES_SHARP[pc] for pc in scale_degrees_from_root(root_pc, intervals)]
    highlight_notes = [NOTE_NAMES_SHARP[pc] for pc in pitch_classes_from_root(root_pc, intervals)]
    root_name = NOTE_NAMES_SHARP[root_pc]
    scale_label = SCALE_LABELS.get(scale_key, scale_key)
    chord_types = ", ".join(CHORD_ORDER)

    return f"""Tu es un professeur de guitare et d'harmonie.

Contexte :
- Gamme : {scale_label} (clé technique "{scale_key}")
- Tonique : {root_name} (root_pc={root_pc})
- Notes de la gamme (ordre diatonique) : {", ".join(scale_notes)}
- Notes sur le manche (toutes tonalités) : {", ".join(highlight_notes)}
- Types d'accords autorisés : {chord_types}

Tâche :
Propose exactement 2 progressions d'accords (4 à 6 accords chacune) cohérentes avec cette gamme.
Chaque accord doit utiliser une fondamentale parmi les pitch classes 0-11 et un type autorisé.

Réponds UNIQUEMENT en JSON valide avec ce schéma :
{{
  "progressions": [
    {{
      "name": "Nom court de la progression",
      "description": "Une phrase expliquant l'ambiance ou l'usage",
      "chords": [
        {{ "root_pc": 0, "chord_type": "M", "roman": "I" }}
      ]
    }}
  ]
}}

Règles :
- root_pc entier entre 0 et 11
- chord_type parmi la liste autorisée
- roman en chiffres romains (I, ii, V7, etc.)
- Progressions musicalement plausibles pour la gamme donnée
"""


def recommend_progressions_ai(scale_key: str, root_pc: int) -> dict:
    provider = resolve_llm_provider()
    prompt = _build_prompt(scale_key, root_pc)
    request_kwargs: dict = {
        "model": provider.model,
        "temperature": 0.7,
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

    progressions = _sanitize_progressions(payload)
    if not progressions:
        raise RuntimeError("AI returned no valid progressions")

    return {
        "scale_key": scale_key,
        "root_pc": root_pc,
        "source": provider.name,
        "model": provider.model,
        "progressions": progressions,
    }
