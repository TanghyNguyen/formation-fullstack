# Formation full-stack

[Live demo](https://formation-fullstack.vercel.app/) · [API](https://formation-fullstack-production.up.railway.app/health) · [Swagger](https://formation-fullstack-production.up.railway.app/docs)

Monorepo pédagogique : bases React → todo full-stack → **Guitar App** (Next.js + API FastAPI).

## Projets

| Dossier | Description |
|---|---|
| [`semaine-01-react-bases`](./semaine-01-react-bases/) | Bases React |
| [`semaine-01-todo-app`](./semaine-01-todo-app/) | Todo app |
| [`semaine-02-guitar-app`](./semaine-02-guitar-app/) | Front Next.js — manche, CAGED, presets, auth Google |
| [`semaine-03-guitar-api`](./semaine-03-guitar-api/) | API FastAPI — gammes, accords, harmonisation, progressions IA |

## Guitar App (projet principal)

Application pour visualiser **gammes** et **accords** sur le manche. Logique musicale côté Python, UI et données utilisateur côté Next.js.

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Next.js — Vercel           │  HTTP   │  FastAPI — Railway           │
│  • Manche + CAGED           │ ──────► │  • Gammes / accords / degrés │
│  • Auth Google (Auth.js)    │         │  • Harmonisation diatonique  │
│  • Presets (Prisma + Neon)  │         │  • Progressions IA (Groq…)   │
└─────────────────────────────┘         └──────────────────────────────┘
```

### Fonctionnalités clés

- 22 gammes + degrés colorés sur le manche
- Accords CAGED avec doigtés
- Harmonisation diatonique (ou mode adapté pour blues / pentatoniques)
- Suggestions de progressions par IA (avec fallback)
- **Presets** (connecté) : gammes, accords, et progressions IA nommées

### Démarrage rapide

```bash
# Terminal 1 — API
cd semaine-03-guitar-api && source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Front
cd semaine-02-guitar-app && pnpm install && pnpm dev
```

Détails, variables d’environnement et déploiement : voir les README de chaque dossier.
