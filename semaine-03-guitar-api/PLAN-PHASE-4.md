# Plan — Phase 4 (IA / recommandations musicales)

> Enrichir l'API avec des recommandations d'accords à partir d'une gamme.

## Objectif

Suggérer des progressions d'accords compatibles avec la gamme affichée sur le manche — via **LLM** (Groq/Ollama) avec **fallback diatonique**, plus une **harmonisation théorique** déterministe.

## Architecture

```
Page Gammes (Next.js)
    │
    ├── GET /scales/{name}/notes           (existant)
    ├── GET /scales/{name}/harmonization   (règles : 7 accords + progressions)
    └── POST /recommend/chords             (IA + fallback)
            │
            ├── recommend_ai.py
            └── recommend_fallback.py
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
- [x] Bouton Rafraîchir (bypass cache)

## Harmonisation diatonique ✅

- [x] `GET /scales/{name}/harmonization?root_pc=`
- [x] Empilement de tierces → 7 accords + explications
- [x] Progressions classiques (I–vi–ii–V, etc.)
- [x] Bascule auto `mode: "adapted"` pour blues / pentatonique / égyptienne…
- [x] Section UI au-dessus des suggestions IA
- [x] Tests pytest `test_harmonize.py`

## Livrable final Phase 4 ✅

App guitare **polyglotte** avec harmonisation théorique, suggestions IA, navigation CAGED, documentée et testée.
