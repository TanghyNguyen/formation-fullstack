# Progression Player Volumes + Metronome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add separate chord/metronome volume sliders with persisted playback prefs, then accent beat-1 clicks and a visible beat counter on the progression player.

**Architecture:** Minimal extension of existing Web Audio helpers (`chord-audio.ts`) and `ProgressionPlayer`. New `playback-prefs.ts` mirrors `gammes-prefs` / `accords-prefs` (localStorage + `useSyncExternalStore`). Delivery 1 = prefs + volumes; Delivery 2 = accent + counter.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Web Audio API, existing `t(locale, key)` i18n.

## Global Constraints

- Volumes: **two sliders only** (chords + metronome); no master, no mute buttons
- Persistence key: `guitar-app:playback-prefs`
- Prefs fields: `bpm` (40–200, default 80), `beatsPerChord` (1–16, default 4), `loop` (default true), `metronome` (default false), `chordVolume` (0–100, default 60), `clickVolume` (0–100, default 50)
- Gain mapping: chords `volume/100 * 0.25`; click `volume/100 * 0.12`
- Accent beat 1: click gain ×1.5, frequency ~660 Hz; weak beats ~1000 Hz
- Beat counter visible whenever **playing**; hidden when paused/stopped
- Keep `setInterval` timing (no AudioContext scheduler rewrite)
- i18n: add FR/EN keys for volume labels (and beat counter aria if needed)
- No automated audio tests; verify with `pnpm typecheck` + manual checklist from the spec
- Spec: `docs/superpowers/specs/2026-07-21-progression-player-volumes-metronome-design.md`

## File map

| File | Responsibility |
|---|---|
| `semaine-02-guitar-app/lib/playback-prefs.ts` | Persist + subscribe playback prefs; clamp/normalize |
| `semaine-02-guitar-app/lib/chord-audio.ts` | `chordGainFromVolume`, `clickGainFromVolume`, `playClick({ gain, accent })` |
| `semaine-02-guitar-app/components/ProgressionPlayer.tsx` | Wire prefs, sliders, accent, beat counter |
| `semaine-02-guitar-app/messages/fr.ts` | FR strings |
| `semaine-02-guitar-app/messages/en.ts` | EN strings |

---

### Task 1: Playback prefs store

**Files:**
- Create: `semaine-02-guitar-app/lib/playback-prefs.ts`
- Test: run `pnpm typecheck` in `semaine-02-guitar-app`

**Interfaces:**
- Consumes: nothing (new module)
- Produces:
  - `export type PlaybackPrefs = { bpm: number; beatsPerChord: number; loop: boolean; metronome: boolean; chordVolume: number; clickVolume: number }`
  - `export const DEFAULT_PLAYBACK_PREFS: PlaybackPrefs`
  - `export function subscribePlaybackPrefs(onStoreChange: () => void): () => void`
  - `export function getPlaybackPrefsSnapshot(): PlaybackPrefs`
  - `export function getServerPlaybackPrefsSnapshot(): PlaybackPrefs` (return defaults; cache like gammes)
  - `export function writePlaybackPrefs(prefs: PlaybackPrefs): void`
  - `export function normalizePlaybackPrefs(partial: Partial<PlaybackPrefs>): PlaybackPrefs`

- [ ] **Step 1: Create `lib/playback-prefs.ts`**

```ts
const STORAGE_KEY = "guitar-app:playback-prefs";

export type PlaybackPrefs = {
  bpm: number;
  beatsPerChord: number;
  loop: boolean;
  metronome: boolean;
  chordVolume: number;
  clickVolume: number;
};

export const DEFAULT_PLAYBACK_PREFS: PlaybackPrefs = {
  bpm: 80,
  beatsPerChord: 4,
  loop: true,
  metronome: false,
  chordVolume: 60,
  clickVolume: 50,
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const n = Math.round(value);
  return Math.min(max, Math.max(min, n));
}

export function normalizePlaybackPrefs(
  partial: Partial<PlaybackPrefs> | null | undefined,
): PlaybackPrefs {
  const p = partial ?? {};
  return {
    bpm: clampInt(p.bpm, 40, 200, DEFAULT_PLAYBACK_PREFS.bpm),
    beatsPerChord: clampInt(
      p.beatsPerChord,
      1,
      16,
      DEFAULT_PLAYBACK_PREFS.beatsPerChord,
    ),
    loop: typeof p.loop === "boolean" ? p.loop : DEFAULT_PLAYBACK_PREFS.loop,
    metronome:
      typeof p.metronome === "boolean"
        ? p.metronome
        : DEFAULT_PLAYBACK_PREFS.metronome,
    chordVolume: clampInt(p.chordVolume, 0, 100, DEFAULT_PLAYBACK_PREFS.chordVolume),
    clickVolume: clampInt(p.clickVolume, 0, 100, DEFAULT_PLAYBACK_PREFS.clickVolume),
  };
}

// Mirror gammes-prefs: listeners Set, cachedRaw/cachedPrefs,
// parse JSON safely → normalizePlaybackPrefs, writePlaybackPrefs updates
// localStorage + notifies listeners. getServerPlaybackPrefsSnapshot returns
// DEFAULT_PLAYBACK_PREFS (optionally cached in a module-level const).
```

Follow the subscribe/cache pattern in `lib/gammes-prefs.ts` (same listener + `cachedRaw` approach). Keep the file focused on prefs only (no audio).

- [ ] **Step 2: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS (exit 0)

- [ ] **Step 3: Commit** (if user asked for commits; otherwise leave staged note)

```bash
git add semaine-02-guitar-app/lib/playback-prefs.ts
git commit -m "$(cat <<'EOF'
feat(playback): add persisted playback prefs store

Store BPM, beats, loop, metronome, and volume levels in localStorage for the progression player.
EOF
)"
```

---

### Task 2: Volume → gain helpers + accented click

**Files:**
- Modify: `semaine-02-guitar-app/lib/chord-audio.ts`
- Test: `pnpm typecheck`

**Interfaces:**
- Consumes: none
- Produces:
  - `export function chordGainFromVolume(volume0to100: number): number`
  - `export function clickGainFromVolume(volume0to100: number): number`
  - `playClick(options?: { gain?: number; accent?: boolean }): void` — accent uses ×1.5 gain and ~660 Hz; non-accent ~1000 Hz
  - Existing `playChord(..., { gain })` unchanged signature

- [ ] **Step 1: Add gain mappers and update `playClick`**

At top of exports section in `chord-audio.ts`:

```ts
export function chordGainFromVolume(volume0to100: number): number {
  const v = Math.min(100, Math.max(0, volume0to100));
  return (v / 100) * 0.25;
}

export function clickGainFromVolume(volume0to100: number): number {
  const v = Math.min(100, Math.max(0, volume0to100));
  return (v / 100) * 0.12;
}
```

Replace `playClick` with:

```ts
export function playClick(options?: { gain?: number; accent?: boolean }): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const accent = options?.accent === true;
  const base = options?.gain ?? 0.06;
  const level = accent ? base * 1.5 : base;
  const freq = accent ? 660 : 1000;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(level, 0.0001), now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}
```

If `level` is 0, skip creating oscillators (early return) to avoid useless nodes:

```ts
if (level <= 0) return;
```

- [ ] **Step 2: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add semaine-02-guitar-app/lib/chord-audio.ts
git commit -m "$(cat <<'EOF'
feat(audio): map UI volumes to gain and accent metronome clicks

Add chord/click gain helpers and lower/louder beat-1 clicks for the progression metronome.
EOF
)"
```

---

### Task 3: Delivery 1 — Wire prefs + volume sliders in player

**Files:**
- Modify: `semaine-02-guitar-app/components/ProgressionPlayer.tsx`
- Modify: `semaine-02-guitar-app/messages/fr.ts`
- Modify: `semaine-02-guitar-app/messages/en.ts`
- Test: `pnpm typecheck` + manual volume checklist

**Interfaces:**
- Consumes: `PlaybackPrefs`, `getPlaybackPrefsSnapshot`, `getServerPlaybackPrefsSnapshot`, `subscribePlaybackPrefs`, `writePlaybackPrefs` from `playback-prefs`; `chordGainFromVolume`, `clickGainFromVolume`, `playChord`, `playClick` from `chord-audio`
- Produces: Player UI with two range inputs; all transport state driven by prefs

- [ ] **Step 1: Add i18n keys**

In `messages/fr.ts`:

```ts
"player.chordVolume": "Volume accords",
"player.clickVolume": "Volume métronome",
```

In `messages/en.ts`:

```ts
"player.chordVolume": "Chord volume",
"player.clickVolume": "Metronome volume",
```

- [ ] **Step 2: Replace local BPM/beats/loop/metronome state with prefs**

In `ProgressionPlayer.tsx`:

1. Import prefs helpers + gain helpers.
2. Subscribe:

```ts
const prefs = useSyncExternalStore(
  subscribePlaybackPrefs,
  getPlaybackPrefsSnapshot,
  getServerPlaybackPrefsSnapshot,
);
```

3. Derive `bpm`, `beatsPerChord`, `loop`, `metronome`, `chordVolume`, `clickVolume` from `prefs`.
4. Keep `bpmDraft` / `beatsDraft` as local strings initialized from prefs; on blur call `writePlaybackPrefs({ ...prefs, bpm: next })` (same for beats).
5. Loop / metronome checkboxes call `writePlaybackPrefs({ ...prefs, loop / metronome })`.
6. When calling audio:

```ts
playChord(chord.root_pc, intervals, {
  gain: chordGainFromVolume(prefs.chordVolume),
});
// in interval:
playClick({
  gain: clickGainFromVolume(prefs.clickVolume),
});
```

Use a ref for prefs (or volumes) inside the interval so the timer always sees latest volumes without restarting on every slider move — e.g. `prefsRef.current = prefs` in an effect, read `prefsRef.current` in the interval callback.

7. Add two `<input type="range" min={0} max={100} />` under the transport row bound to `chordVolume` / `clickVolume` with `onChange` → `writePlaybackPrefs`.

- [ ] **Step 3: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Manual verify (Delivery 1)**

1. Start API + `pnpm dev`, open a progression → Lire  
2. Move chord volume → next chord louder/quieter; 0 = silence  
3. Enable metronome, move click volume → clicks change; 0 = silence  
4. Hard reload → volumes/BPM/loop/metronome restored  

- [ ] **Step 5: Commit**

```bash
git add semaine-02-guitar-app/components/ProgressionPlayer.tsx \
  semaine-02-guitar-app/messages/fr.ts \
  semaine-02-guitar-app/messages/en.ts
git commit -m "$(cat <<'EOF'
feat(player): add separate chord and metronome volume sliders

Persist playback settings and apply UI volumes to Web Audio gains on each sound.
EOF
)"
```

---

### Task 4: Delivery 2 — Accent + beat counter

**Files:**
- Modify: `semaine-02-guitar-app/components/ProgressionPlayer.tsx`
- Modify: `semaine-02-guitar-app/messages/fr.ts` / `en.ts` (optional aria label)
- Test: `pnpm typecheck` + manual metronome checklist

**Interfaces:**
- Consumes: `playClick({ gain, accent })` from Task 2; prefs from Task 1/3
- Produces: Visual beat counter while `playing`; accented beat-1 clicks

- [ ] **Step 1: Track displayed beat in state**

```ts
const [beat, setBeat] = useState(1); // 1-based for display
```

Keep `beatRef` as 0-based internal counter (existing) OR switch consistently. Spec: reset to 1 on chord change / prev / next.

On `applyChord`, after updating index:

```ts
beatRef.current = 0;
setBeat(1);
```

In the interval, after incrementing the beat:

```ts
const currentBeat = beatRef.current; // 1..beatsPerChord after increment mapping
if (prefsRef.current.metronome) {
  playClick({
    gain: clickGainFromVolume(prefsRef.current.clickVolume),
    accent: currentBeat === 1,
  });
}
setBeat(currentBeat);
```

Important: today the interval increments `beatRef` then plays click then may change chord when `beatRef >= beatsPerChord`. Align so **first click of a chord is beat 1 with accent**. On play start, after `applyChord`, the first interval tick should be beat 2 **or** play an immediate beat-1 click on Play — prefer: on `handlePlay` / `applyChord(..., true)`, if metronome on, also `playClick({ accent: true })` for beat 1 at chord attack, then interval handles beats 2..N. Document the chosen behavior in a one-line comment in the player.

Chosen behavior for this plan:  
- On chord attack (`applyChord` with sound): if metronome on, play accented click (beat 1) together with the chord.  
- Interval only advances beats 2..beatsPerChord (weak clicks), then wraps and changes chord.

Refactor interval accordingly so we do not double-accent beat 1.

- [ ] **Step 2: Render beat counter when `playing`**

```tsx
{playing ? (
  <div
    className="flex gap-2 mt-3"
    aria-label={t(locale, "player.beatCounter")}
  >
    {Array.from({ length: prefs.beatsPerChord }, (_, i) => {
      const n = i + 1;
      const active = beat === n;
      return (
        <span
          key={n}
          className="text-sm font-semibold min-w-6 text-center"
          style={{
            color: active ? "var(--accent)" : "var(--muted)",
            opacity: active ? 1 : 0.55,
          }}
        >
          {n}
        </span>
      );
    })}
  </div>
) : null}
```

Add keys:

```ts
// fr
"player.beatCounter": "Temps du métronome",
// en
"player.beatCounter": "Metronome beat",
```

- [ ] **Step 3: Typecheck**

Run: `cd semaine-02-guitar-app && pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Manual verify (Delivery 2)**

1. Play with metronome on → beat 1 louder/lower; counter highlights 1..N  
2. Prev/Next resets counter to 1  
3. Pause hides counter  
4. FR/EN labels OK  

- [ ] **Step 5: Commit**

```bash
git add semaine-02-guitar-app/components/ProgressionPlayer.tsx \
  semaine-02-guitar-app/messages/fr.ts \
  semaine-02-guitar-app/messages/en.ts
git commit -m "$(cat <<'EOF'
feat(player): accent beat one and show beat counter

Make the metronome clearer with a stronger downbeat click and a live beat readout while playing.
EOF
)"
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Separate chord/metronome volumes | 2, 3 |
| Persist bpm/beats/loop/metro/volumes | 1, 3 |
| Gain mapping 0–100 → 0.25 / 0.12 | 2 |
| Accent beat 1 (×1.5, ~660 Hz) | 2, 4 |
| Beat counter while playing | 4 |
| i18n labels | 3, 4 |
| No master/mute/bus/scheduler rewrite | respected (out of scope) |

## Placeholder scan

None intentional. Commit steps are optional if the user has not requested git commits — implementer should still prepare the messages above.
