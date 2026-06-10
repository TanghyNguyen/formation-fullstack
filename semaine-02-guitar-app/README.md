# Guitar App — Manche interactif

[Live demo](https://formation-fullstack.vercel.app/)

Application web pour visualiser **gammes** et **accords** sur le manche d'une guitare, avec mise en évidence des degrés (tonique, tierce, quinte, septième…).

Migration en Next.js / React / TypeScript d'un projet original écrit en HTML/CSS/JS.

## Fonctionnalités

### Page Gammes

- Sélection de la **fondamentale** et de la **gamme** (22 gammes : majeure, mineure, modes, blues, pentatoniques, etc.)
- Surlignage des notes de la gamme sur tout le manche (16 frettes)
- Clic sur une case pour définir la fondamentale
- Bascule **dièses / bémols**
- Option **Degrés** : colore chaque note selon sa fonction, avec légende

### Page Accords (CAGED)

- Sélection de la **fondamentale** et du **type d'accord** (majeur, mineur, 7, maj7, m7, dim, aug, sus2, sus4)
- Sélecteur de **position CAGED** (C-A-G-E-D) avec bascule automatique vers une forme disponible
- Manche affichant le doigté de l'accord (cordes jouées, à vide, étouffées)
- **Diagramme d'accord** en SVG : fenêtre de frettes dynamique, sillet, barré, marqueurs
- **Bibliothèque d'accords** cliquable avec formules d'intervalles
- Code couleur par degré partagé avec la page Gammes

## Stack technique

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4**

## Architecture

```
app/
  layout.tsx        Layout racine + navbar
  page.tsx          Page Gammes
  chords/page.tsx   Page Accords (CAGED)
  globals.css       Thème (variables CSS, fond dégradé)
components/
  Navbar.tsx        Navigation avec lien actif (usePathname)
  FretBoard.tsx     Manche des gammes
  FretCell.tsx      Case individuelle
  CagedFretboard.tsx  Manche des accords
  ChordDiagram.tsx  Diagramme d'accord SVG
lib/
  tuning.ts         Accordage, pitch classes
  notes.ts          Noms de notes (dièses / bémols)
  scales.ts         Définition des gammes
  chords.ts         Bibliothèque d'accords
  caged.ts          Formes CAGED, calcul des frettes, degrés
```

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — serveur de production
- `npm run lint` — vérification ESLint

---

Projet réalisé dans le cadre d'une formation full-stack (semaine 02).
