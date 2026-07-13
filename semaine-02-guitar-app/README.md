# Guitar App — Manche interactif full-stack

[Live demo](https://formation-fullstack.vercel.app/)

Application web pour visualiser **gammes** et **accords** sur le manche d'une guitare, avec mise en évidence des degrés (tonique, tierce, quinte, septième…). Les utilisateurs connectés peuvent **sauvegarder leurs configurations favorites** (gammes et accords) en base de données.

Migration en Next.js / React / TypeScript d'un projet original écrit en HTML/CSS/JS, puis extension full-stack (Neon, Prisma, Auth.js).

## Captures d'écran

### Page Gammes — presets utilisateur

![Page Gammes avec manche interactif et presets](docs/screenshots/gammes.png)

### Page Accords — système CAGED

![Page Accords avec forme CAGED et diagramme](docs/screenshots/accords.png)

## Fonctionnalités

### Page Gammes

- Sélection de la **fondamentale** et de la **gamme** (22 gammes : majeure, mineure, modes, blues, pentatoniques, etc.)
- Surlignage des notes de la gamme sur tout le manche (16 frettes)
- Clic sur une case pour définir la fondamentale
- Bascule **dièses / bémols**
- Option **Degrés** : colore chaque note selon sa fonction, avec légende
- **Presets** (utilisateur connecté) : sauvegarder, charger et supprimer ses gammes favorites

### Page Accords (CAGED)

- Sélection de la **fondamentale** et du **type d'accord** (majeur, mineur, 7, maj7, m7, dim, aug, sus2, sus4)
- Sélecteur de **position CAGED** (C-A-G-E-D) avec bascule automatique vers une forme disponible
- Manche affichant le doigté de l'accord (cordes jouées, à vide, étouffées)
- **Diagramme d'accord** en SVG : fenêtre de frettes dynamique, sillet, barré, marqueurs
- **Bibliothèque d'accords** cliquable avec formules d'intervalles
- Code couleur par degré partagé avec la page Gammes
- **Presets** (utilisateur connecté) : sauvegarder, charger et supprimer ses accords favorites

### Authentification

- Connexion / déconnexion via **Google OAuth**
- Session persistée en base (Auth.js + Prisma Adapter)
- Données isolées par utilisateur (`userId` sur chaque preset)

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS v4** |
| Langage | **TypeScript** (strict) |
| Base de données | **Neon** (Postgres serverless) |
| ORM | **Prisma 7** |
| Auth | **Auth.js v5** (next-auth beta) + Google OAuth |
| Déploiement | **Vercel** |

## Architecture

```
app/
  layout.tsx              Layout racine + navbar
  page.tsx                Page Gammes (Server Component)
  chords/page.tsx         Page Accords (Server Component)
  actions/
    auth.ts               signInWithGoogle, signOutAction
    presets.ts            createPreset, deletePreset
  api/auth/[...nextauth]/ Server route Auth.js
components/
  Navbar.tsx              Session + boutons auth (Server)
  NavbarLinks.tsx         Liens actifs (Client)
  HomePageClient.tsx      UI gammes + presets (Client)
  ChordsPageClient.tsx    UI accords + presets (Client)
  SubmitButton.tsx        Bouton submit avec état pending (Client)
  FretBoard.tsx           Manche des gammes
  CagedFretboard.tsx      Manche des accords
  ChordDiagram.tsx        Diagramme d'accord SVG
lib/
  prisma.ts               Singleton Prisma + adapter Postgres
  scales.ts, caged.ts     Logique musicale
prisma/
  schema.prisma           User, Session, Preset…
auth.ts                   Config Auth.js
```

## Démarrage local

### Prérequis

- Node.js 20+
- Compte [Neon](https://neon.tech) (base Postgres)
- Identifiants OAuth Google ([Google Cloud Console](https://console.cloud.google.com))

### Installation

```bash
pnpm install
cp .env.example .env   # puis remplir les variables
pnpm prisma db push      # synchroniser le schéma
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Neon Postgres |
| `AUTH_SECRET` | Secret session (`openssl rand -base64 32`) |
| `AUTH_URL` | URL de l'app (`http://localhost:3000` en local) |
| `AUTH_GOOGLE_ID` | Client ID OAuth Google |
| `AUTH_GOOGLE_SECRET` | Client Secret OAuth Google |

Redirect URI Google en local : `http://localhost:3000/api/auth/callback/google`

## Scripts

- `pnpm dev` — serveur de développement
- `pnpm build` — build de production
- `pnpm start` — serveur de production
- `pnpm lint` — vérification ESLint

## Déploiement (Vercel)

- **Root Directory** : `semaine-02-guitar-app` (monorepo)
- Configurer les 5 variables d'environnement en **Production**
- Redirect URI Google : `https://formation-fullstack.vercel.app/api/auth/callback/google`

---

Projet réalisé dans le cadre d'une formation full-stack — Phase 2 (Next.js moderne + base + auth + presets).
