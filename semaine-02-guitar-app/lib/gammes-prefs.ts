const STORAGE_KEY = "guitar-app:gammes-prefs";

export type GammesPrefs = {
  rootPc: number;
  currentScale: string;
  useFlats: boolean;
  showDegrees: boolean;
};

export function readGammesPrefs(): GammesPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
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
    };
  } catch {
    return null;
  }
}

export function writeGammesPrefs(prefs: GammesPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore private mode / blocked storage
  }
}
