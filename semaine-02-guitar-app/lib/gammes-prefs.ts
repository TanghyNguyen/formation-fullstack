const STORAGE_KEY = "guitar-app:gammes-prefs";

export type GammesPrefs = {
  rootPc: number;
  currentScale: string;
  useFlats: boolean;
  showDegrees: boolean;
  /** Nombre d'accords demandé pour les progressions IA (3–8). */
  chordCount: number;
};

export const CHORD_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8] as const;
export const DEFAULT_CHORD_COUNT = 4;

function normalizeChordCount(value: unknown): number {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 3 &&
    value <= 8
  ) {
    return value;
  }
  return DEFAULT_CHORD_COUNT;
}

type Listener = () => void;

const listeners = new Set<Listener>();

let cachedRaw: string | null | undefined = undefined;
let cachedFallbackScale = "";
let cachedValidKey = "";
let cachedPrefs: GammesPrefs | null = null;
const serverSnapshotCache = new Map<string, GammesPrefs>();

function parseGammesPrefs(raw: string): GammesPrefs | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GammesPrefs>;
    if (
      typeof parsed.rootPc !== "number" ||
      !Number.isInteger(parsed.rootPc) ||
      parsed.rootPc < 0 ||
      parsed.rootPc > 11 ||
      typeof parsed.currentScale !== "string" ||
      !parsed.currentScale
    ) {
      return null;
    }
    return {
      rootPc: parsed.rootPc,
      currentScale: parsed.currentScale,
      useFlats: Boolean(parsed.useFlats),
      showDegrees:
        typeof parsed.showDegrees === "boolean" ? parsed.showDegrees : true,
      chordCount: normalizeChordCount(parsed.chordCount),
    };
  } catch {
    return null;
  }
}

function defaultPrefs(fallbackScale: string): GammesPrefs {
  return {
    rootPc: 0,
    currentScale: fallbackScale,
    useFlats: false,
    showDegrees: true,
    chordCount: DEFAULT_CHORD_COUNT,
  };
}

export function subscribeGammesPrefs(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getGammesPrefsSnapshot(
  fallbackScale: string,
  validScaleKeys: readonly string[],
): GammesPrefs {
  const validKey = validScaleKeys.join("\0");
  const raw =
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);

  if (
    cachedPrefs &&
    cachedRaw === raw &&
    cachedFallbackScale === fallbackScale &&
    cachedValidKey === validKey
  ) {
    return cachedPrefs;
  }

  const saved = raw ? parseGammesPrefs(raw) : null;
  const prefs = saved
    ? {
        ...saved,
        currentScale: validScaleKeys.includes(saved.currentScale)
          ? saved.currentScale
          : fallbackScale,
      }
    : defaultPrefs(fallbackScale);

  cachedRaw = raw;
  cachedFallbackScale = fallbackScale;
  cachedValidKey = validKey;
  cachedPrefs = prefs;
  return prefs;
}

export function getServerGammesPrefsSnapshot(
  fallbackScale: string,
): GammesPrefs {
  const cached = serverSnapshotCache.get(fallbackScale);
  if (cached) return cached;
  const prefs = defaultPrefs(fallbackScale);
  serverSnapshotCache.set(fallbackScale, prefs);
  return prefs;
}

export function writeGammesPrefs(prefs: GammesPrefs): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(prefs);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedFallbackScale = prefs.currentScale;
    cachedPrefs = prefs;
    listeners.forEach((listener) => listener());
  } catch {
    // ignore private mode / blocked storage
  }
}
