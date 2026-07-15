# Plan — Phase 4 (IA / recommandations musicales)

> Enrichir l'API avec des recommandations d'accords à partir d'une gamme.

## Objectif

Suggérer des progressions d'accords compatibles avec la gamme affichée sur le manche — via **LLM** (Groq/Ollama) avec **fallback diatonique**.

## Architecture

```
Page Gammes (Next.js)
    │
    ├── GET /scales/{name}/notes     (existant)
    └── POST /recommend/chords      (Phase 4)
            │
            ├── recommend_ai.py     (Groq / Ollama / OpenAI + cache)
            └── recommend_fallback.py (secours par mode)
```

## Semaine I — Progressions + navigation

### Session I1 — Endpoint + UI ✅
- [x] `POST /recommend/chords` → progressions IA
- [x] Section « Progressions d'accords (IA) » sur la page Gammes
- [x] Cliquer un accord → navigation vers `/chords?root_pc=&chord_type=`

### Session I2 — Affinage musical ✅
- [x] Règles par mode (dorien, mixolydien, phrygien, lydien, blues…)
- [x] Tests pytest `recommend_fallback.py`
- [x] Affichage labels français (Majeur, mineur…)

## Semaine J — IA multi-fournisseurs ✅

- [x] Ollama (local, gratuit)
- [x] Groq (cloud gratuit, prod Railway) — voir `DEPLOY-GROQ.md`
- [x] Fallback rule-based si quota dépassé
- [x] Cache des progressions (`PROGRESSIONS_CACHE`, TTL 1h)

## Livrable final Phase 4 ✅

App guitare **polyglotte** avec suggestions d'accords intelligentes, navigation CAGED, documentée et testée.
