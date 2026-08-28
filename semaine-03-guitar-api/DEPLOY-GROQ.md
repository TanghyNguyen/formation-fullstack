# Déployer l’API sur Render + Groq (prod)

L’API FastAPI tourne sur **Render** (free). Groq fournit une API LLM **gratuite** (quota journalier) pour les progressions.

## 1. Créer une clé Groq

1. [console.groq.com](https://console.groq.com)
2. **API Keys** → **Create API Key**
3. Copie la clé (`gsk_...`)

## 2. Déployer sur Render

1. [render.com/dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. Repo GitHub `formation-fullstack`
3. Réglages :

| Champ | Valeur |
|---|---|
| Root Directory | `semaine-03-guitar-api` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

4. Variables d’environnement :

```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_ta_cle_ici
GROQ_MODEL=llama-3.1-8b-instant
OPENAI_FALLBACK=true
```

5. **Create Web Service** → attendre le statut **Live**
6. Copie l’URL publique (`https://….onrender.com`)

Vérifier :

```bash
curl "https://TON-URL.onrender.com/health"
# → {"status":"ok"}
```

> Free tier : cold start ~30–60 s après inactivité.

## 3. Variables Vercel (front)

Projet **formation-fullstack** → **Settings** → **Environment Variables** :

| Variable | Valeur |
|---|---|
| `GUITAR_API_URL` | `https://TON-URL.onrender.com` |
| `NEXT_PUBLIC_GUITAR_API_URL` | `https://TON-URL.onrender.com` |

`NEXT_PUBLIC_` est **volontaire** : le navigateur appelle l’API pour les progressions. Ce n’est pas un secret.

Puis **Redeploy** le front (obligatoire pour `NEXT_PUBLIC_*`).

## 4. Tester en prod

```bash
curl -X POST "https://TON-URL.onrender.com/recommend/chords" \
  -H "Content-Type: application/json" \
  -d '{"scale_key":"major","root_pc":0}'
```

Attendu : `"source": "groq"`, `"progressions": [...]`.

Puis ouvre [formation-fullstack.vercel.app](https://formation-fullstack.vercel.app).

## 5. Local (optionnel)

```bash
# semaine-03-guitar-api/.env
AI_PROVIDER="groq"
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.1-8b-instant"
OPENAI_FALLBACK="true"
```

Ou `AI_PROVIDER=ollama` en local sans quota.

## Dépannage

| Symptôme | Cause | Fix |
|---|---|---|
| `"source": "rules"` | Groq absent / quota | Variables Render |
| CORS | Preview Vercel | `allow_origin_regex` déjà dans `main.py` |
| 404 scales sur Vercel | Mauvaise URL API | Vérifier env Vercel + redeploy |
| 1ère requête lente | Cold start Free | Réessayer |
