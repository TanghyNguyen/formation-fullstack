# Déployer Groq sur Railway (prod)

Groq fournit une API **gratuite** (quota journalier) compatible OpenAI — idéale pour les progressions en production.

## 1. Créer une clé Groq

1. Va sur [console.groq.com](https://console.groq.com)
2. Crée un compte (Google/GitHub)
3. **API Keys** → **Create API Key**
4. Copie la clé (`gsk_...`)

## 2. Variables Railway

Railway n’a pas de menu « Service API ». Tu dois d’abord **cliquer sur le bon service** dans ton projet.

### Trouver le bon service

1. Va sur [railway.app/dashboard](https://railway.app/dashboard)
2. Ouvre ton projet (probablement **formation-fullstack** ou un nom proche)
3. Tu vois un **canvas** avec une ou plusieurs **cartes/boîtes** (services)
4. Clique sur le service qui correspond à l’**API Python** :
   - souvent nommé comme le repo, `semaine-03-guitar-api`, `web`, ou `formation-fullstack-production`
   - c’est celui dont l’URL ressemble à `formation-fullstack-production.up.railway.app`
   - pour vérifier : onglet **Settings** → **Networking** → domaine public

### Ajouter les variables

Une fois le service sélectionné (panneau à droite ouvert) :

1. Onglet **Variables** (en haut : Deployments, Variables, Metrics, Settings…)
2. **+ New Variable** ou **Raw Editor** pour coller tout d’un coup :

```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_ta_cle_ici
GROQ_MODEL=llama-3.1-8b-instant
OPENAI_FALLBACK=true
```

3. **Save** / **Deploy** — Railway redéploie automatiquement

> Si tu ne vois qu’**un seul service** dans le projet, c’est probablement le bon. S’il y en a plusieurs (ex. Postgres + API), prends celui qui **n’est pas** une base de données.

## 3. Vérifier Vercel (front)

Variables du projet **semaine-02-guitar-app** sur Vercel :

| Variable | Valeur |
|---|---|
| `GUITAR_API_URL` | `https://formation-fullstack-production.up.railway.app` |
| `NEXT_PUBLIC_GUITAR_API_URL` | `https://formation-fullstack-production.up.railway.app` |

`NEXT_PUBLIC_` est **obligatoire** : les progressions sont chargées depuis le navigateur.

## 4. Tester en prod

```bash
curl -X POST "https://formation-fullstack-production.up.railway.app/recommend/chords" \
  -H "Content-Type: application/json" \
  -d '{"scale_key":"major","root_pc":0}'
```

Réponse attendue :
- `"source": "groq"`
- `"model": "llama-3.1-8b-instant"`
- `"progressions": [...]`

Puis ouvre [formation-fullstack.vercel.app](https://formation-fullstack.vercel.app), change la fondamentale, vérifie la section **Progressions d'accords (IA)**.

## 5. Local (optionnel)

Pour tester Groq en local avant de pousser :

```bash
# semaine-03-guitar-api/.env
AI_PROVIDER="groq"
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.1-8b-instant"
OPENAI_FALLBACK="true"
```

```bash
pkill -f "uvicorn main:app"
uvicorn main:app --reload --port 8000
```

En local tu peux garder `AI_PROVIDER=ollama` (sans quota) et réserver Groq pour Railway.

## Dépannage

| Symptôme | Cause | Fix |
|---|---|---|
| `"source": "rules"` + quota | Groq non configuré ou quota dépassé | Vérifier variables Railway |
| Erreur CORS | URL front incorrecte | Vérifier `NEXT_PUBLIC_GUITAR_API_URL` |
| 503 GROQ_API_KEY | Clé absente sur Railway | Ajouter `GROQ_API_KEY` |
| Lent en prod | Normal (5–15 s) | Groq est rapide ; le cold start Railway peut ajouter un délai |
