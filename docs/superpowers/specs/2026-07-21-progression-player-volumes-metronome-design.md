# Design — Progression player: separate volumes + clearer metronome

Date: 2026-07-21  
App: `semaine-02-guitar-app`  
Status: approved in brainstorming (approach: minimal)

## Goal

Improve the progression playback block as a practice tool:

1. **Delivery 1** — Separate volume sliders for chords and metronome click, with persisted prefs.
2. **Delivery 2** — Clearer metronome: accented beat 1 + visible beat counter `1 · 2 · 3 · 4`.

## Decisions

| Topic | Choice |
|---|---|
| Approach | Minimal: extend existing `chord-audio` + `ProgressionPlayer`; no Web Audio bus graph |
| Volumes | Two sliders only (chords + metronome); no master, no mute buttons |
| Metronome UX | Accent on beat 1 (lower + louder) + visual beat counter |
| Persistence | Full: volumes, metronome on/off, BPM, beats/chord, loop → localStorage |
| i18n | New UI strings in `messages/fr.ts` / `en.ts` |

## Out of scope

- Master volume / mute toggles
- Dedicated `GainNode` buses for live mid-note volume morphing
- High-precision scheduling via `AudioContext.currentTime` (keep `setInterval` for now)
- Realistic guitar samples, MIDI, waveforms
- Collapsible “settings drawer” redesign

## Architecture

```
ProgressionPlayer
  ├── playback prefs (localStorage via useSyncExternalStore)
  ├── transport UI (existing) + volume sliders + beat counter
  └── chord-audio
        playChord(root, intervals, { gain })
        playClick({ gain, accent? })
```

### Data: `PlaybackPrefs`

Stored under key `guitar-app:playback-prefs` (same store pattern as `gammes-prefs`).

```ts
type PlaybackPrefs = {
  bpm: number;            // 40–200, default 80
  beatsPerChord: number;  // 1–16, default 4
  loop: boolean;          // default true
  metronome: boolean;     // default false
  chordVolume: number;    // 0–100 UI, default 60
  clickVolume: number;    // 0–100 UI, default 50
};
```

Invalid / missing values fall back to defaults.

### Volume → gain mapping

UI range `0–100` maps linearly to Web Audio gain:

- Chords: `0 → 0`, `100 → 0.25` (current default ~0.12 ≈ 48%)
- Click: `0 → 0`, `100 → 0.12` (current default ~0.06 ≈ 50%)

Volume `0` is silence (no error). Gain is applied on the **next** sound event (chord change or click); no need to restart playback.

Accented beat 1 uses click gain ×1.5 and frequency ~660 Hz; weak beats use the mapped click gain and ~1000 Hz.

## UI

### Unchanged transport

Play/Pause, Previous, Next, BPM, Beats/chord, Loop checkbox, Metronome checkbox.

### Delivery 1 — Volumes

Two range inputs under the transport row:

- Label “Accords” / “Chords”
- Label “Métronome” / “Metronome” (volume of the click)

### Delivery 2 — Metronome clarity

- On each beat while playing + metronome on: call `playClick({ gain, accent: beat === 1 })`
- Visual counter `1 · 2 · 3 · 4` (or up to `beatsPerChord` if ≠ 4): current beat emphasized
- Counter resets to 1 on chord change / prev / next
- Show the beat counter whenever playback is running (even if metronome is off), so the pulse stays readable; hide it when paused/stopped

## Files to touch

| File | Change |
|---|---|
| `lib/playback-prefs.ts` | **New** — read/write/subscribe prefs |
| `lib/chord-audio.ts` | `playClick` accent option; optional helpers `chordGainFromVolume` / `clickGainFromVolume` |
| `components/ProgressionPlayer.tsx` | Wire prefs, sliders (D1), accent + counter (D2) |
| `messages/fr.ts`, `messages/en.ts` | Volume / beat labels |

## Delivery order

1. **Volumes + prefs** — ship and manually verify persistence + audible level changes  
2. **Metronome accent + counter** — ship on top of D1

## Edge cases

- Prefs JSON corrupt → defaults  
- `beatsPerChord` changes mid-play → clamp beat index into new range  
- Metronome off → no clicks; counter may still advance with play for visual pulse  
- Locale toggle → volume labels update via existing `t(locale, …)`

## Testing

Manual only:

1. Open playback from a progression  
2. Move chord / click sliders → next sounds reflect levels; 0 = silence  
3. Reload page → prefs restored  
4. Enable metronome → beat 1 sounds different; counter highlights current beat  
5. Switch FR/EN → labels localized  

No automated audio tests.

## Success criteria

- User can balance chord vs click volume independently  
- Prefs survive reload  
- With metronome on, beat 1 is clearly stronger/lower and the beat number is visible  
