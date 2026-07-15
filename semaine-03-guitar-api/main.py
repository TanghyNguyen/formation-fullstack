from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from scales import SCALES, SCALE_LABELS, pitch_classes_from_root
from caged import (
    CAGED_POSITIONS,
    LIBRARY_GROUPS,
    compute_frets,
    get_shape,
    list_chord_types,
)

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
    allow_methods=["GET"],
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
