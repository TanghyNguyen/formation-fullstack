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

### Session I1 — Endpoint + UI ✅ (démarré)
- [x] `POST /recommend/chords { scale_key, root_pc }`
- [x] Section « Accords suggérés » sur la page Gammes
- [ ] Cliquer un accord suggéré → navigation vers `/chords` avec preset appliqué

### Session I2 — Affinage musical
- [ ] Règles par mode (dorien, mixolydien, blues…)
- [ ] Tests pytest dédiés `recommend.py`
- [ ] Affichage labels français (Majeur, mineur…)

## Semaine J — Option IA (bonus)

- [ ] Intégration OpenAI / modèle local
- [ ] Prompt contextuel : gamme + niveau + style
- [ ] Fallback rule-based si API IA indisponible

## Livrable final Phase 4

App guitare **polyglotte** avec suggestions d'accords intelligentes, documentée et testée.
