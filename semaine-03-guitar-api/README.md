# Guitar API — FastAPI

API REST Python pour la logique musicale de [Guitar App](../semaine-02-guitar-app/).

[Live API](https://formation-fullstack-production.up.railway.app/health) · [Swagger](https://formation-fullstack-production.up.railway.app/docs)

## Stack

- **Python 3.12+**
- **FastAPI** + **Pydantic**
- **Uvicorn** (ASGI)
- **pytest**

## Démarrage local

```bash
cd semaine-03-guitar-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/health` | Santé de l'API |
| `GET` | `/scales` | Liste des gammes |
| `GET` | `/scales/{name}/notes?root_pc=0` | Pitch classes |
| `GET` | `/chords/types` | Types d'accords CAGED |
| `GET` | `/chords/library` | Bibliothèque groupée |
| `GET` | `/chords/frets?root_pc=0&chord_type=M&position=E` | Doigté |
| `GET` | `/degrees/styles` | Couleurs et labels des degrés |
| `GET` | `/degrees/at?pc=4&root_pc=0` | Degré d'une note |
| `POST` | `/recommend/chords` | Accords suggérés pour une gamme |

### Exemple recommandations

```bash
curl -X POST "https://formation-fullstack-production.up.railway.app/recommend/chords" \
  -H "Content-Type: application/json" \
  -d '{"scale_key":"major","root_pc":0}'
```

## Tests

```bash
pytest
```

## Structure

```
main.py        Routes FastAPI + CORS
scales.py      Gammes et intervalles
caged.py       Formes CAGED et calcul des frettes
degrees.py     Degrés et styles couleur
recommend.py   Recommandations d'accords (Phase 4)
tests/         pytest
```

## Deploy Railway

- Root Directory : `semaine-03-guitar-api`
- `Procfile` : `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

Voir `PLAN-PHASE-3.md` et `PLAN-PHASE-4.md` pour le suivi pédagogique.
