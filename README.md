# Formation full-stack

[Live demo](https://formation-fullstack.vercel.app/) · [API](https://formation-fullstack-production.up.railway.app/health) · [Swagger](https://formation-fullstack-production.up.railway.app/docs)

Monorepo pédagogique : bases React → todo full-stack → **Guitar App** (Next.js + API FastAPI + IA).

## Projets

| Dossier | Description |
|---|---|
| [`semaine-01-react-bases`](./semaine-01-react-bases/) | Bases React |
| [`semaine-01-todo-app`](./semaine-01-todo-app/) | Todo app |
| [`semaine-02-guitar-app`](./semaine-02-guitar-app/) | Front Next.js — manche, CAGED, presets, auth, thème, lecture de progressions |
| [`semaine-03-guitar-api`](./semaine-03-guitar-api/) | API FastAPI — gammes, accords, harmonisation, progressions IA |

## Guitar App (projet principal)

Application pour visualiser **gammes** et **accords** sur le manche. Logique musicale côté Python, UI et données utilisateur côté Next.js, suggestions de progressions via LLM.

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Next.js — Vercel           │  HTTP   │  FastAPI — Railway           │
│  • Manche + CAGED           │ ──────► │  • Gammes / accords / degrés │
│  • Auth Google (Auth.js)    │         │  • Harmonisation diatonique  │
│  • Presets (Prisma + Neon)  │         │  • Progressions IA           │
│  • Lecture + son (Web Audio)│         │  • Groq / Ollama / OpenAI    │
│  • Thème clair / sombre     │         │                              │
└─────────────────────────────┘         └──────────────────────────────┘
```

### Fonctionnalités clés

- 22 gammes + degrés colorés sur le manche
- Accords CAGED avec doigtés et diagramme SVG
- Harmonisation diatonique (mode adapté auto pour blues / pentatoniques)
- Suggestions de progressions par IA (cache, rafraîchissement, longueur 3–8 accords, fallback)
- **Mode lecture** : enchaîner une progression avec son, BPM, boucle et métronome
- **Presets** (connecté) : gammes, accords CAGED, progressions IA nommées
- **Thème clair / sombre** avec préférence mémorisée
- **Persistance** des sélections Gammes et Accords entre les pages

### Stack

| Couche | Technologies |
|---|---|
| Front | **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4** |
| Auth | **Auth.js v5** (NextAuth) + Google OAuth |
| Données | **Prisma 7**, **Neon** (Postgres), Server Actions |
| API | **FastAPI**, **Pydantic**, **Uvicorn**, Python 3.12+, **pytest** |
| IA | **Groq** (prod), **Ollama** (local), OpenAI optionnel |
| Deploy | **Vercel** (front) + **Railway** (API) |

### Démarrage rapide

```bash
# Terminal 1 — API
cd semaine-03-guitar-api && source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Front
cd semaine-02-guitar-app && pnpm install && pnpm dev
```

Détails, variables d’environnement et déploiement : voir les README de chaque dossier.
