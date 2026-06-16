# Plan — Fin de Phase 2 (Stack Next.js moderne)

> Document de suivi pédagogique. Objectif : transformer l'app guitare en projet
> **full-stack déployé** (base Neon + auth NextAuth/Google + presets par utilisateur).

## Décisions actées

- **Base de données :** Neon (Postgres cloud, même base dev/prod)
- **ORM :** Prisma
- **Auth :** NextAuth / Auth.js, **provider Google OAuth**
- **UI :** introduction de **shadcn/ui** au moment de l'UI auth + presets
- **Feature full-stack visée :** sauvegarder / charger / supprimer des presets (gamme ou accord favori) par utilisateur
- **Rythme :** ~30h/semaine → plan sur ~3-4 semaines
- **Méthode :** micro-étapes (je code, le mentor valide), reformulation à chaque concept nouveau, lecture de la doc Next.js/Auth.js avant de coder (cette version de Next a des breaking changes)

## Principe directeur

Un livrable **déployé** à chaque palier — jamais plusieurs features empilées avant de tester.

---

## Semaine A — Mise en prod + fondations DB

**Livrable : URL live de la guitare + connexion à une vraie base.**

### Session A1 — Déploiement guitare ✅
- [x] Importer le repo sur Vercel, Root Directory = `semaine-02-guitar-app`
- [x] Vérifier le build, obtenir l'URL live → https://formation-fullstack.vercel.app/
- [x] Mettre à jour le README avec le lien `[Live demo]`
- Concepts : monorepo sur Vercel, build prod vs dev, déploiements immuables, rollback via alias, Deployment Protection

### Session A2 — Neon + Prisma branchés ✅
- [x] Créer un compte Neon, une base, récupérer `DATABASE_URL`
- [x] `.env` (jamais commité) + variable sur Vercel (à faire au deploy full-stack)
- [x] Installer Prisma, `prisma init`, premier modèle bidon, `prisma db push`
- [x] Ouvrir Prisma Studio pour voir la base
- [x] `lib/prisma.ts` — singleton client + adapter Postgres
- Concepts : ORM, schéma, migration vs push, variables d'environnement, secrets, clé primaire, UTC

---

## Semaine B — Authentification (NextAuth / Auth.js)

**Livrable : se connecter / se déconnecter, session visible.**

### Session B1 — Schéma Prisma complet
- [ ] Modèles NextAuth (`User`, `Account`, `Session`, `VerificationToken`) via l'adapter Prisma
- Concepts : relations 1-N, clés étrangères, rôle de l'adapter

### Session B2 — NextAuth + provider Google
- [ ] Config Auth.js (App Router), provider Google OAuth
- [ ] Console Google Cloud : créer les identifiants OAuth, secrets en `.env` + Vercel
- Concepts : OAuth (flux navigateur ↔ Google ↔ app), session, callback

### Session B3 — UI connexion + lecture de session
- [ ] Bouton « Se connecter / Se déconnecter » dans la Navbar
- [ ] Lire la session côté Server Component
- [ ] Introduction shadcn/ui (Button, Dropdown)
- Concepts : session serveur vs client, route protégée

---

## Semaine C — Feature presets (le vrai full-stack)

**Livrable : sauvegarder, lister, charger, supprimer ses presets.**

### Session C1 — Modèle `Preset` + écriture
- [ ] Modèle `Preset { id, userId, name, rootPc, scaleOrChord, type, createdAt }`
- [ ] Server Action `createPreset(formData)` → insertion liée au `userId`
- Concepts : Server Actions, mutation, `revalidatePath`

### Session C2 — Lecture + affichage
- [ ] `prisma.preset.findMany({ where: { userId } })` côté serveur
- [ ] Liste des presets de l'utilisateur
- Concepts : requête filtrée par utilisateur, ownership des données

### Session C3 — Charger + supprimer + brancher au manche
- [ ] Cliquer un preset → applique `rootPc` + gamme/accord au `FretBoard`
- [ ] Supprimer un preset (Server Action + confirmation)
- [ ] UI form « Sauvegarder » (shadcn Dialog / Input)
- Concepts : remontée d'état client ↔ données serveur, suppression sécurisée

---

## Semaine D — Déploiement full-stack + finition portfolio

**Livrable : app full-stack en prod, README pro, prête à montrer.**

- [ ] Déploiement complet : Neon prod + `DATABASE_URL` + secrets NextAuth/Google sur Vercel
- [ ] Tester le flux entier en prod (login → save → reload → presets persistés)
- [ ] README pro : stack, features full-stack, captures, URL live
- [ ] Nettoyage : gestion d'erreurs, états de chargement, `lib/chords.ts` orphelin (brancher ou retirer)
- [ ] Bilan Phase 2 → préparer la Phase 3 (Python / FastAPI / IA)

---

## Récap

| Semaine | Thème | Livrable déployé |
|---|---|---|
| A | Deploy + Neon/Prisma | Guitare en ligne + base connectée |
| B | Auth NextAuth + Google | Connexion / déconnexion |
| C | Presets full-stack | Sauvegarde / chargement par utilisateur |
| D | Deploy full-stack + portfolio | App complète en prod + README pro |

## Prochaine action

Session A1 — déploiement de la guitare sur Vercel.
