# Home Section Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add under-fretboard jump buttons and a scroll-aware back-to-fretboard FAB on the home page.

**Architecture:** Anchor `id`s on the fretboard wrapper and each major section. A small client component `HomeSectionNav` renders the jump row + fixed FAB, uses `scrollIntoView({ behavior: "smooth" })`, updates the hash via `history.replaceState`, and toggles FAB visibility with `IntersectionObserver` on `#fretboard`.

**Tech Stack:** Next.js App Router, React 19 client components, TypeScript, existing `t(locale, key)` i18n, CSS variables already used on the home page.

## Global Constraints

- Home page (`/`) only — no section nav on `/chords`
- Anchors: `#fretboard`, `#harmonization`, `#ai-progressions`, `#my-progressions`, `#my-presets`
- FAB visible only when `#fretboard` is not fully in the viewport (`IntersectionObserver`, `threshold: 1`)
- FAB: fixed bottom-center, « ↑ » glyph, `aria-label` from `home.backToFretboard`, opacity ~0.75
- Nav buttons for Mes progressions / Mes presets only when those sections render (`isLoggedIn && length > 0`)
- Do not modify `FretBoard.tsx` internals — wrap with `id="fretboard"` in the parent
- Prefer new `HomeSectionNav.tsx` over dumping observer logic into `HomePageClient`
- i18n FR/EN; reuse `home.myProgressions` / `home.myPresets` for those buttons
- Verify with `pnpm typecheck` + manual checklist (no automated scroll tests in this repo)
- Spec: `docs/superpowers/specs/2026-07-21-home-section-nav-design.md`

## File map

| File | Responsibility |
|---|---|
| `semaine-02-guitar-app/components/HomeSectionNav.tsx` | Jump buttons + FAB + observer + scroll helper |
| `semaine-02-guitar-app/components/HomePageClient.tsx` | Section/`fretboard` ids; mount nav with visibility flags |
| `semaine-02-guitar-app/messages/fr.ts` | FR strings |
| `semaine-02-guitar-app/messages/en.ts` | EN strings |

---

### Task 1: i18n keys + `HomeSectionNav`

**Files:**
- Create: `semaine-02-guitar-app/components/HomeSectionNav.tsx`
- Modify: `semaine-02-guitar-app/messages/fr.ts`
- Modify: `semaine-02-guitar-app/messages/en.ts`
- Test: `cd semaine-02-guitar-app && pnpm typecheck`

**Interfaces:**
- Consumes: `t` from `@/lib/i18n`, `Locale` from `@/lib/locale`
- Produces:
  - `export default function HomeSectionNav(props: { locale: Locale; showMyProgressions: boolean; showMyPresets: boolean }): JSX.Element`
  - Scroll helper used internally: `scrollToId(id: string): void`

- [ ] **Step 1: Add i18n keys**

In `messages/fr.ts` (near other `home.*` keys):

```ts
"home.nav.label": "Sections",
"home.nav.harmonization": "Harmonisation",
"home.nav.aiProgressions": "Progressions IA",
"home.backToFretboard": "Remonter au manche",
```

In `messages/en.ts`:

```ts
"home.nav.label": "Sections",
"home.nav.harmonization": "Harmonization",
"home.nav.aiProgressions": "AI progressions",
"home.backToFretboard": "Back to fretboard",
```

(Do not duplicate `home.myProgressions` / `home.myPresets` — reuse those keys.)

- [ ] **Step 2: Create `HomeSectionNav.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

type HomeSectionNavProps = {
  locale: Locale;
  showMyProgressions: boolean;
  showMyPresets: boolean;
};

function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    history.replaceState(null, "", `#${id}`);
  } catch {
    // ignore
  }
}

export default function HomeSectionNav({
  locale,
  showMyProgressions,
  showMyPresets,
}: HomeSectionNavProps) {
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const target = document.getElementById("fretboard");
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Fully visible → hide FAB; otherwise show.
        setShowFab(!(entry?.isIntersecting ?? false));
      },
      { threshold: 1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const links: { id: string; label: string; show: boolean }[] = [
    {
      id: "harmonization",
      label: t(locale, "home.nav.harmonization"),
      show: true,
    },
    {
      id: "ai-progressions",
      label: t(locale, "home.nav.aiProgressions"),
      show: true,
    },
    {
      id: "my-progressions",
      label: t(locale, "home.myProgressions"),
      show: showMyProgressions,
    },
    {
      id: "my-presets",
      label: t(locale, "home.myPresets"),
      show: showMyPresets,
    },
  ];

  return (
    <>
      <nav
        className="mt-4 mb-2 flex flex-wrap gap-2"
        aria-label={t(locale, "home.nav.label")}
      >
        {links
          .filter((link) => link.show)
          .map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="text-sm px-3 py-1.5 rounded-md"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--border-strong)",
                background: "transparent",
              }}
            >
              {link.label}
            </button>
          ))}
      </nav>

      {showFab ? (
        <button
          type="button"
          onClick={() => scrollToId("fretboard")}
          aria-label={t(locale, "home.backToFretboard")}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full text-sm font-semibold w-10 h-10"
          style={{
            opacity: 0.75,
            background: "var(--panel)",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          ↑
        </button>
      ) : null}
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS (component may be unused until Task 2 — that is fine)

- [ ] **Step 4: Commit**

```bash
git add semaine-02-guitar-app/components/HomeSectionNav.tsx \
  semaine-02-guitar-app/messages/fr.ts \
  semaine-02-guitar-app/messages/en.ts
git commit -m "$(cat <<'EOF'
feat(home): add section jump nav component and i18n keys

Provide under-fretboard jump targets and a scroll-aware back-to-fretboard FAB.
EOF
)"
```

---

### Task 2: Wire anchors into `HomePageClient`

**Files:**
- Modify: `semaine-02-guitar-app/components/HomePageClient.tsx`
- Test: `cd semaine-02-guitar-app && pnpm typecheck` + manual checklist

**Interfaces:**
- Consumes: `HomeSectionNav` from Task 1
- Produces: DOM ids `fretboard`, `harmonization`, `ai-progressions`, `my-progressions`, `my-presets` matching the nav

- [ ] **Step 1: Import and mount nav under the fretboard**

Add import:

```tsx
import HomeSectionNav from "@/components/HomeSectionNav";
```

Wrap the existing `<FretBoard ... />` and insert nav immediately after:

```tsx
<div id="fretboard">
  <FretBoard
    highlightSet={highlightSet}
    rootPc={rootPc}
    useFlats={useFlats}
    onCellClick={(pc) => setRootPc(pc)}
    showDegrees={showDegrees}
    scaleIntervals={scaleIntervals[currentScale] ?? []}
    degreeStyles={degreeStyles}
  />
</div>
<HomeSectionNav
  locale={locale}
  showMyProgressions={isLoggedIn && progressionPresets.length > 0}
  showMyPresets={isLoggedIn && presets.length > 0}
/>
```

- [ ] **Step 2: Add section ids**

On the harmonization `<section ...>` (the one whose `h2` uses `home.harmonization` / adapted), add `id="harmonization"`.

On the AI progressions `<section ...>` (the one whose `h2` uses `home.aiTitle`), add `id="ai-progressions"`.

On the conditional Mes progressions section:

```tsx
{isLoggedIn && progressionPresets.length > 0 && (
  <section id="my-progressions" className="mt-8">
```

On the conditional Mes presets section:

```tsx
{isLoggedIn && presets.length > 0 && (
  <section id="my-presets" className="mt-8">
```

Do not change section contents beyond adding these `id`s.

- [ ] **Step 3: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Manual verify**

1. Home `/` — buttons under fretboard for Harmonisation + Progressions IA.
2. Click each → smooth scroll to the matching block; URL hash updates.
3. Scroll until fretboard leaves the viewport → ↑ FAB appears bottom-center; click → returns to fretboard; FAB hides when fretboard fully visible.
4. Logged-in with presets: Mes progressions / Mes presets buttons appear and jump correctly.
5. Logged-out: those two buttons absent.
6. `/chords` unchanged (no FAB / section nav).

- [ ] **Step 5: Commit**

```bash
git add semaine-02-guitar-app/components/HomePageClient.tsx
git commit -m "$(cat <<'EOF'
feat(home): wire section anchors and jump navigation

Let users jump between home blocks and return to the fretboard without long manual scrolling.
EOF
)"
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Jump buttons under fretboard | 1, 2 |
| Targets harmonization / AI / my progressions / my presets | 1, 2 |
| Conditional visibility for Mes * | 1 props + 2 flags |
| FAB bottom-center, ↑, discreet | 1 |
| FAB only when fretboard not fully visible | 1 observer |
| Smooth scroll + hash via replaceState | 1 `scrollToId` |
| Home only / no FretBoard prop changes | 2 wrapper |
| i18n FR/EN | 1 |
| Typecheck + manual | 1, 2 |
