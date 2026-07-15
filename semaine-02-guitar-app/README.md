# Guitar App — Manche interactif full-stack

[Live demo](https://formation-fullstack.vercel.app/) · [API](https://formation-fullstack-production.up.railway.app/health)

Application web pour visualiser **gammes** et **accords** sur le manche d'une guitare. Logique musicale servie par une **API FastAPI** (Python), UI et données utilisateur par **Next.js** (TypeScript).

## Architecture polyglotte

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Next.js — Vercel           │  HTTP   │  FastAPI — Railway           │
│  • UI React                 │ ──────► │  • Gammes / accords / degrés   │
│  • Auth Google (Auth.js)    │         │  • Recommandations d'accords   │
│  • Presets (Prisma + Neon)  │         │  • Tests pytest                │
└─────────────────────────────┘         └──────────────────────────────┘
```

| Projet | Dossier | URL prod |
|---|---|---|
| Front | `semaine-02-guitar-app` | https://formation-fullstack.vercel.app |
| API | `semaine-03-guitar-api` | https://formation-fullstack-production.up.railway.app |

## Captures d'écran

### Page Gammes — presets utilisateur

![Page Gammes avec manche interactif et presets](docs/screenshots/gammes.png)

### Page Accords — système CAGED

![Page Accords avec forme CAGED et diagramme](docs/screenshots/accords.png)

## Fonctionnalités

### Page Gammes

- 22 gammes via API (`GET /scales`)
- Notes surlignées via API (`GET /scales/{name}/notes`)
- Degrés colorés (styles via `GET /degrees/styles`)
- **Accords suggérés** via API (`POST /recommend/chords`) — Phase 4
- Presets utilisateur (Neon)

### Page Accords (CAGED)

- Types d'accords + positions via API
- Doigtés calculés via API (`GET /chords/frets`)
- Presets accords avec position CAGED

### Authentification

- Google OAuth, sessions en base, données isolées par `userId`

## Stack technique

| Couche | Technologie |
|---|---|
| Front | **Next.js 16**, React 19, Tailwind v4 |
| API | **FastAPI**, Python 3.12+, Uvicorn |
| Base | **Neon** Postgres, **Prisma 7** |
| Auth | **Auth.js v5** + Google OAuth |
| Deploy | **Vercel** (front) + **Railway** (API) |

## Démarrage local (2 terminaux)

**Terminal 1 — API :**
```bash
cd semaine-03-guitar-api
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Front :**
```bash
cd semaine-02-guitar-app
pnpm install
cp .env.example .env   # remplir DATABASE_URL, AUTH_*, GUITAR_API_URL
pnpm prisma db push
pnpm dev
```

### Variables d'environnement (front)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres |
| `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Auth.js |
| `GUITAR_API_URL` | API serveur (`http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_GUITAR_API_URL` | API client (`http://127.0.0.1:8000`) |

## Déploiement

- **Vercel** : Root Directory = `semaine-02-guitar-app` + toutes les variables ci-dessus
- **Railway** : Root Directory = `semaine-03-guitar-api` + Procfile

---

Formation full-stack — Phases 2 (full-stack Next.js) + 3 (API Python) + 4 (recommandations).
