# Guitar API — FastAPI

API REST Python pour la logique musicale de [Guitar App](../semaine-02-guitar-app/).

Phase 3 de la formation full-stack : le front Next.js consommera cette API au lieu d'importer `lib/scales.ts` et `lib/caged.ts` directement.

## Stack

- **Python 3.12+**
- **FastAPI** — framework REST + validation Pydantic
- **Uvicorn** — serveur ASGI

## Démarrage local

```bash
cd semaine-03-guitar-api
python3 -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Ouvrir :

- [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) → `{"status":"ok"}`
- [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) → Swagger UI (doc auto-générée)

## Routes (Session E1)

| Méthode | Route | Réponse |
|---|---|---|
| `GET` | `/health` | `{ "status": "ok" }` |

## Scripts utiles

```bash
# Lancer le serveur (dev, rechargement auto)
uvicorn main:app --reload

# Lancer sur un port précis
uvicorn main:app --reload --port 8000
```
