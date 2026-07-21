# Home page section navigation — Design

**Date:** 2026-07-21  
**Status:** Approved for planning  
**Scope:** Page d’accueil (`/`) uniquement

## Problem

La page principale empile fretboard, harmonisation, progressions IA, presets utilisateur. Il est difficile d’atteindre un bloc précis puis de remonter au manche sans scroller manuellement.

## Goals

- Boutons discrets **sous le fretboard** pour aller directement à chaque bloc principal.
- Bouton discret **fixe en bas au centre** pour remonter au fretboard, visible seulement quand le manche n’est plus entièrement visible.
- Navigation accessible (clavier, `aria-label`), i18n FR/EN.
- Scroll fluide (`smooth`).

## Non-goals

- Sticky mini-nav / TOC latérale.
- Navigation section sur `/chords`.
- Changer le layout ou le contenu des blocs existants (hors `id` / ancres).
- Presets de jump (ex. « Progressions courantes » comme cible séparée) — inclus dans Harmonisation.

## Approach

Ancres HTML + `scrollIntoView({ behavior: "smooth", block: "start" })`, FAB contrôlé par `IntersectionObserver` sur le fretboard.

## Targets

| Bouton | Ancre | Visible si |
|---|---|---|
| `home.nav.harmonization` | `#harmonization` | toujours |
| `home.nav.aiProgressions` | `#ai-progressions` | toujours |
| `home.myProgressions` | `#my-progressions` | `isLoggedIn && progressionPresets.length > 0` |
| `home.myPresets` | `#my-presets` | `isLoggedIn && presets.length > 0` |

Fretboard wrapper : `id="fretboard"`.

Each corresponding `<section>` in `HomePageClient` receives the matching `id`.

On nav / FAB click, update the URL hash with `history.replaceState` (no full navigation) so the target remains shareable after refresh when possible.

## UI

### Section nav (under fretboard)

- Row of text buttons, wrap on small screens.
- Visual language aligned with existing controls: muted text, `var(--border-strong)` border, no heavy cards.
- Placed immediately below `<FretBoard />`, above the harmonization section.

### Back-to-fretboard FAB

- `position: fixed`; bottom center (`bottom-6`, horizontally centered).
- Compact circular/rounded control showing « ↑ »; visible label is the arrow only; full text in `aria-label` (`home.backToFretboard`). Opacity ~0.75.
- Shown only when `#fretboard` is **not** fully intersecting the viewport (`IntersectionObserver` with `threshold: 1`: hide FAB while `isIntersecting === true`).
- Click → smooth scroll to `#fretboard` + hash `#fretboard`.
- Home page only (mounted from home client tree).

## Components / files

| File | Change |
|---|---|
| `components/HomePageClient.tsx` | Wrapper `#fretboard`, section `id`s, mount nav + FAB |
| `components/HomeSectionNav.tsx` (new, preferred) | Nav buttons + FAB + observer logic |
| `messages/fr.ts` / `en.ts` | `home.nav.*`, `home.backToFretboard` |

Keep logic out of `FretBoard.tsx` (no prop sprawl); wrap in the parent.

## i18n keys

- `home.nav.harmonization` — FR: « Harmonisation » / EN: « Harmonization »
- `home.nav.aiProgressions` — FR: « Progressions IA » / EN: « AI progressions »
- Reuse existing `home.myProgressions` and `home.myPresets` for those nav buttons
- `home.backToFretboard` — FR: « Remonter au manche » / EN: « Back to fretboard » (aria-label)

## Error handling / edge cases

- Missing target element: no-op (guard `getElementById`).
- Logged-out / empty presets: hide corresponding nav buttons (same conditions as sections).
- FAB must not block critical UI: keep compact; ensure it does not cover primary CTAs in an unusable way on mobile (padding / size).

## Testing

- `pnpm typecheck` in `semaine-02-guitar-app`.
- Manual: each nav button scrolls to the right block; FAB appears after scrolling past fretboard and hides when fretboard is fully visible again; works on mobile width; FR/EN labels OK.

## Acceptance criteria

1. From below the fretboard, user can jump to Harmonisation, AI progressions, and (when shown) Mes progressions / Mes presets.
2. After scrolling so the fretboard is not fully on screen, a centered bottom FAB appears and returns to the fretboard smoothly.
3. No new navigation chrome on `/chords`.
4. Typecheck passes.
