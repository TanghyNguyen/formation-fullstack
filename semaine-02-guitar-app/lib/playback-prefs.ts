const STORAGE_KEY = "guitar-app:playback-prefs";

export type PlaybackPrefs = {
  bpm: number;
  beatsPerChord: number;
  loop: boolean;
  metronome: boolean;
  /** 1-based beat numbers that trigger a metronome click (sorted unique). */
  metronomeBeats: number[];
  chordVolume: number;
  clickVolume: number;
};

export const DEFAULT_PLAYBACK_PREFS: PlaybackPrefs = {
  bpm: 80,
  beatsPerChord: 4,
  loop: true,
  metronome: false,
  metronomeBeats: [1, 2, 3, 4],
  chordVolume: 60,
  clickVolume: 50,
};

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const n = Math.round(value);
  return Math.min(max, Math.max(min, n));
}

/** Normalize a raw beats list to sorted unique ints in 1..16; empty → [1]. */
export function normalizeMetronomeBeats(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_PLAYBACK_PREFS.metronomeBeats];
  }
  const seen = new Set<number>();
  for (const item of value) {
    if (typeof item !== "number" || !Number.isFinite(item)) continue;
    const n = Math.round(item);
    if (n >= 1 && n <= 16) seen.add(n);
  }
  if (seen.size === 0) return [1];
  return Array.from(seen).sort((a, b) => a - b);
}

/**
 * Filter selection to 1..beatsPerChord. When beatsPerChord grows vs
 * `previousBeatsPerChord`, newly available beats default to on.
 */
export function resolveMetronomeBeats(
  beats: number[],
  beatsPerChord: number,
  previousBeatsPerChord: number = beatsPerChord,
): number[] {
  const n = clampInt(beatsPerChord, 1, 16, DEFAULT_PLAYBACK_PREFS.beatsPerChord);
  const prevN = clampInt(
    previousBeatsPerChord,
    1,
    16,
    DEFAULT_PLAYBACK_PREFS.beatsPerChord,
  );
  const kept = normalizeMetronomeBeats(beats).filter((b) => b <= n);
  const next = new Set(kept);
  if (n > prevN) {
    for (let b = prevN + 1; b <= n; b++) {
      next.add(b);
    }
  }
  if (next.size === 0) next.add(1);
  return Array.from(next).sort((a, b) => a - b);
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
    metronomeBeats: normalizeMetronomeBeats(p.metronomeBeats),
    chordVolume: clampInt(
      p.chordVolume,
      0,
      100,
      DEFAULT_PLAYBACK_PREFS.chordVolume,
    ),
    clickVolume: clampInt(
      p.clickVolume,
      0,
      100,
      DEFAULT_PLAYBACK_PREFS.clickVolume,
    ),
  };
}

type Listener = () => void;

const listeners = new Set<Listener>();

let cachedRaw: string | null | undefined = undefined;
let cachedPrefs: PlaybackPrefs | null = null;
let serverSnapshotCache: PlaybackPrefs | null = null;

function parsePlaybackPrefs(raw: string): PlaybackPrefs | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PlaybackPrefs>;
    return normalizePlaybackPrefs(parsed);
  } catch {
    return null;
  }
}

export function subscribePlaybackPrefs(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getPlaybackPrefsSnapshot(): PlaybackPrefs {
  const raw =
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);

  if (cachedPrefs && cachedRaw === raw) {
    return cachedPrefs;
  }

  const saved = raw ? parsePlaybackPrefs(raw) : null;
  const prefs = saved ?? normalizePlaybackPrefs({});

  cachedRaw = raw;
  cachedPrefs = prefs;
  return prefs;
}

export function getServerPlaybackPrefsSnapshot(): PlaybackPrefs {
  if (serverSnapshotCache) return serverSnapshotCache;
  serverSnapshotCache = normalizePlaybackPrefs({});
  return serverSnapshotCache;
}

export function writePlaybackPrefs(prefs: PlaybackPrefs): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = normalizePlaybackPrefs(prefs);
    const raw = JSON.stringify(normalized);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedPrefs = normalized;
    listeners.forEach((listener) => listener());
  } catch {
    // ignore private mode / blocked storage
  }
}
