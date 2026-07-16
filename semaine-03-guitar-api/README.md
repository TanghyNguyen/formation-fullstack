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
| `GET` | `/scales/{name}/harmonization?root_pc=0` | Harmonisation diatonique (7 accords + progressions) |
| `GET` | `/chords/types` | Types d'accords CAGED |
| `GET` | `/chords/library` | Bibliothèque groupée |
| `GET` | `/chords/frets?root_pc=0&chord_type=M&position=E` | Doigté |
| `GET` | `/degrees/styles` | Couleurs et labels des degrés |
| `GET` | `/degrees/at?pc=4&root_pc=0` | Degré d'une note |
| `POST` | `/recommend/chords` | Progressions d'accords générées par IA (Groq / Ollama / OpenAI) |

### Exemple harmonisation diatonique

```bash
curl "https://formation-fullstack-production.up.railway.app/scales/major/harmonization?root_pc=0"
```

- Gamme à **7 notes** → harmonisation diatonique (`mode: "diatonic"`)
- Gamme à **moins de 7 notes** (blues, pentatonique, égyptienne…) → bascule auto en mode adapté (`mode: "adapted"`, ex. I7–IV7–V7 pour le blues)

### Configuration IA

| Variable | Description |
|---|---|
| `AI_PROVIDER` | `ollama` (local, gratuit), `groq` (cloud gratuit), `openai` (payant) |
| `OLLAMA_BASE_URL` | URL Ollama (défaut : `http://127.0.0.1:11434/v1`) |
| `OLLAMA_MODEL` | Modèle Ollama (défaut : `llama3.1:8b`) |
| `GROQ_API_KEY` | Clé gratuite [console.groq.com](https://console.groq.com) |
| `OPENAI_API_KEY` | Clé OpenAI (optionnel, payant) |
| `OPENAI_FALLBACK` | `true` = progressions rule-based si l'IA échoue |

**Local gratuit (recommandé)** — Ollama tourne sur ton Mac, sans quota :

```bash
brew install ollama          # déjà installé chez toi
ollama serve                   # terminal 1
ollama pull llama3.1:8b         # ou un modèle déjà installé
# dans .env : AI_PROVIDER=ollama
```

**Cloud gratuit** — Groq pour Railway (limites journalières, mais généreux) :

```bash
# .env Railway : AI_PROVIDER=groq + GROQ_API_KEY
```

### Exemple progressions IA

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
harmonize.py   Harmonisation diatonique (triades + progressions)
recommend_ai.py  Progressions IA (Ollama / Groq / OpenAI)
llm_provider.py  Configuration fournisseur LLM
recommend_fallback.py  Secours rule-based
tests/         pytest
```

## Deploy Railway

- Root Directory : `semaine-03-guitar-api`
- `Procfile` : `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

### Prod IA (Groq)

Voir **[DEPLOY-GROQ.md](./DEPLOY-GROQ.md)** pour la checklist complète.

Variables minimales Railway :
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
OPENAI_FALLBACK=true
```

Voir `PLAN-PHASE-3.md` et `PLAN-PHASE-4.md` pour le suivi pédagogique.
