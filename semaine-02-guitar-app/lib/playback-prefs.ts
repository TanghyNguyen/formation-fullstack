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
  const prefs = saved ?? DEFAULT_PLAYBACK_PREFS;

  cachedRaw = raw;
  cachedPrefs = prefs;
  return prefs;
}

export function getServerPlaybackPrefsSnapshot(): PlaybackPrefs {
  if (serverSnapshotCache) return serverSnapshotCache;
  serverSnapshotCache = DEFAULT_PLAYBACK_PREFS;
  return serverSnapshotCache;
}

export function writePlaybackPrefs(prefs: PlaybackPrefs): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(prefs);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedPrefs = prefs;
    listeners.forEach((listener) => listener());
  } catch {
    // ignore private mode / blocked storage
  }
}
