# Plan — Phase 3 (Architecture polyglotte Next.js + FastAPI)

> API Python pour la logique musicale, front Next.js pour UI, auth et presets.

## Décisions actées

- **API :** FastAPI sur Railway
- **Front :** Next.js sur Vercel (inchangé)
- **Auth + presets :** restent dans Next.js + Neon
- **Logique musicale :** migrée vers Python

## Semaine E — FastAPI fondations ✅

- [x] E1 — Hello FastAPI local (`/health`, `/docs`)
- [x] E2 — Deploy Railway + Procfile

## Semaine F — Gammes via API ✅

- [x] F1 — `GET /scales`, `GET /scales/{name}/notes`
- [x] F1 — Page gammes connectée (`lib/guitar-api.ts`)

## Semaine G — Accords CAGED via API ✅

- [x] G1 — `GET /chords/types`, `/library`, `/frets`
- [x] G1 — Page accords connectée

## Semaine H — Finition ✅

- [x] H1 — README architecture polyglotte + variables `GUITAR_API_URL`
- [x] H1 — Suppression `lib/scales.ts`, `lib/caged.ts` (orphelins)
- [x] H2 — `GET /degrees/styles`, styles chargés depuis l'API
- [x] H2 — Tests pytest (`scales`, `caged`, `degrees`, `recommend`)

## Prochaine action

**Phase 4** — Recommandations d'accords intelligentes → voir `PLAN-PHASE-4.md`
