from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

load_dotenv()

from scales import SCALES, SCALE_LABELS, pitch_classes_from_root
from caged import (
    CAGED_POSITIONS,
    LIBRARY_GROUPS,
    compute_frets,
    get_shape,
    list_chord_types,
)
from degrees import DEGREE_STYLES, chord_degree
from recommend_ai import recommend_progressions_ai
from recommend_fallback import recommend_progressions_fallback

app = FastAPI(
    title="Guitar API",
    description="API REST pour la logique musicale de Guitar App",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://formation-fullstack.vercel.app",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "Guitar API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/scales")
def list_scales():
    return [
        {
            "key": key,
            "label": SCALE_LABELS[key],
            "intervals": intervals,
        }
        for key, intervals in SCALES.items()
    ]


@app.get("/scales/{name}/notes")
def scale_notes(
    name: str,
    root_pc: int = Query(..., ge=0, le=11, alias="root_pc"),
):
    intervals = SCALES.get(name)
    if intervals is None:
        raise HTTPException(status_code=404, detail=f"Scale '{name}' not found")

    return {
        "key": name,
        "root_pc": root_pc,
        "pitch_classes": pitch_classes_from_root(root_pc, intervals),
    }


@app.get("/chords/types")
def chord_types():
    return list_chord_types()


@app.get("/chords/library")
def chord_library():
    return LIBRARY_GROUPS


@app.get("/chords/caged/positions")
def caged_positions():
    return CAGED_POSITIONS


@app.get("/chords/frets")
def chord_frets(
    root_pc: int = Query(..., ge=0, le=11, alias="root_pc"),
    chord_type: str = Query(..., alias="chord_type"),
    position: str = Query(...),
):
    shape = get_shape(chord_type, position)
    if shape is None:
        raise HTTPException(
            status_code=404,
            detail=f"Shape '{position}' not available for chord '{chord_type}'",
        )

    return {
        "root_pc": root_pc,
        "chord_type": chord_type,
        "position": position,
        "frets": compute_frets(root_pc, shape),
    }


@app.get("/degrees/styles")
def degree_styles():
    return DEGREE_STYLES


@app.get("/degrees/at")
def degree_at(
    pc: int = Query(..., ge=0, le=11),
    root_pc: int = Query(..., ge=0, le=11, alias="root_pc"),
):
    degree = chord_degree(pc, root_pc)
    return {
        "pc": pc,
        "root_pc": root_pc,
        "degree": degree,
        "style": DEGREE_STYLES[degree],
    }


class RecommendRequest(BaseModel):
    scale_key: str
    root_pc: int = Field(..., ge=0, le=11)
    force_refresh: bool = False


@app.post("/recommend/chords")
def recommend_chords_for_scale(body: RecommendRequest):
    if body.scale_key not in SCALES:
        raise HTTPException(
            status_code=404, detail=f"Scale '{body.scale_key}' not found"
        )

    try:
        return recommend_progressions_ai(
            body.scale_key,
            body.root_pc,
            force_refresh=body.force_refresh,
        )
    except RuntimeError as exc:
        message = str(exc)
        if os.getenv("OPENAI_FALLBACK", "true").lower() in {"1", "true", "yes"}:
            fallback = recommend_progressions_fallback(body.scale_key, body.root_pc)
            if fallback["progressions"]:
                fallback["ai_error"] = message
                return fallback
        if "GROQ_API_KEY" in message or (
            "OPENAI_API_KEY" in message and "invalid" not in message.lower()
        ):
            raise HTTPException(
                status_code=503,
                detail="AI API key is not configured on the API server",
            ) from exc
        raise HTTPException(status_code=502, detail=message) from exc
