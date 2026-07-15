# Plan — Phase 4 (IA / recommandations musicales)

> Enrichir l'API avec des recommandations d'accords à partir d'une gamme.

## Objectif

Suggérer des accords compatibles avec la gamme affichée sur le manche — d'abord par **règles diatoniques**, puis optionnellement via **LLM**.

## Architecture

```
Page Gammes (Next.js)
    │
    ├── GET /scales/{name}/notes     (existant)
    └── POST /recommend/chords      (Phase 4)
            │
            ▼
        FastAPI recommend.py
```

## Semaine I — Recommandations rule-based

### Session I1 — Endpoint + UI ✅
- [x] `POST /recommend/chords` → progressions IA (OpenAI)
- [x] Section « Progressions d'accords (IA) » sur la page Gammes
- [ ] Cliquer une progression → navigation vers `/chords`

### Session I2 — Affinage musical
- [ ] Règles par mode (dorien, mixolydien, blues…)
- [ ] Tests pytest dédiés `recommend.py`
- [ ] Affichage labels français (Majeur, mineur…)

## Semaine J — IA multi-fournisseurs

- [x] Ollama (local, gratuit)
- [x] Groq (cloud gratuit, prod Railway) — voir `DEPLOY-GROQ.md`
- [x] Fallback rule-based si quota dépassé
- [ ] Cache des progressions pour limiter les appels

## Livrable final Phase 4

App guitare **polyglotte** avec suggestions d'accords intelligentes, documentée et testée.
