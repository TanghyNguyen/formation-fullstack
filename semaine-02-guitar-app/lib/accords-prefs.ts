import type { CagedPosition, ChordType } from "@/lib/music-types";

const STORAGE_KEY = "guitar-app:accords-prefs";

export type AccordsPrefs = {
  rootPc: number;
  chordType: string;
  cagedPos: CagedPosition;
  useFlats: boolean;
};

type Listener = () => void;

const listeners = new Set<Listener>();
const CAGED: readonly CagedPosition[] = ["C", "A", "G", "E", "D"];

let cachedRaw: string | null | undefined = undefined;
let cachedKey = "";
let cachedPrefs: AccordsPrefs | null = null;
const serverSnapshotCache = new Map<string, AccordsPrefs>();

function isCagedPosition(value: unknown): value is CagedPosition {
  return typeof value === "string" && CAGED.includes(value as CagedPosition);
}

function parseAccordsPrefs(raw: string): AccordsPrefs | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AccordsPrefs>;
    if (
      typeof parsed.rootPc !== "number" ||
      !Number.isInteger(parsed.rootPc) ||
      parsed.rootPc < 0 ||
      parsed.rootPc > 11 ||
      typeof parsed.chordType !== "string" ||
      !parsed.chordType ||
      !isCagedPosition(parsed.cagedPos)
    ) {
      return null;
    }
    return {
      rootPc: parsed.rootPc,
      chordType: parsed.chordType,
      cagedPos: parsed.cagedPos,
      useFlats: Boolean(parsed.useFlats),
    };
  } catch {
    return null;
  }
}

function defaultPrefs(defaultChordType: ChordType): AccordsPrefs {
  return {
    rootPc: 0,
    chordType: defaultChordType,
    cagedPos: "E",
    useFlats: false,
  };
}

export function subscribeAccordsPrefs(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getAccordsPrefsSnapshot(
  defaultChordType: ChordType,
  validChordTypes: readonly string[],
  positionsByType: Record<string, string[]>,
): AccordsPrefs {
  const cacheKey = `${defaultChordType}|${validChordTypes.join("\0")}`;
  const raw =
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);

  if (cachedPrefs && cachedRaw === raw && cachedKey === cacheKey) {
    return cachedPrefs;
  }

  const saved = raw ? parseAccordsPrefs(raw) : null;
  let prefs = defaultPrefs(defaultChordType);

  if (saved && validChordTypes.includes(saved.chordType)) {
    const positions = positionsByType[saved.chordType] ?? [];
    prefs = {
      rootPc: saved.rootPc,
      chordType: saved.chordType,
      cagedPos: positions.includes(saved.cagedPos)
        ? saved.cagedPos
        : ((positions.find((p) => CAGED.includes(p as CagedPosition)) ??
            "E") as CagedPosition),
      useFlats: saved.useFlats,
    };
  }

  cachedRaw = raw;
  cachedKey = cacheKey;
  cachedPrefs = prefs;
  return prefs;
}

export function getServerAccordsPrefsSnapshot(
  defaultChordType: ChordType,
): AccordsPrefs {
  const cached = serverSnapshotCache.get(defaultChordType);
  if (cached) return cached;
  const prefs = defaultPrefs(defaultChordType);
  serverSnapshotCache.set(defaultChordType, prefs);
  return prefs;
}

export function writeAccordsPrefs(prefs: AccordsPrefs): void {
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
