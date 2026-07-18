import type { ChordRecommendation } from "@/lib/guitar-api";

const STORAGE_KEY = "guitar-app:progression-playback";

export type PlaybackProgression = {
  name: string;
  chords: ChordRecommendation[];
};

function isChord(value: unknown): value is ChordRecommendation {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as ChordRecommendation).root_pc === "number" &&
    typeof (value as ChordRecommendation).chord_type === "string"
  );
}

export function savePlaybackProgression(progression: PlaybackProgression): void {
  if (typeof window === "undefined") return;
  if (!progression.name.trim() || progression.chords.length === 0) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: progression.name.trim(),
        chords: progression.chords.filter(isChord),
      }),
    );
  } catch {
    // ignore private mode / blocked storage
  }
}

export function loadPlaybackProgression(): PlaybackProgression | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlaybackProgression>;
    if (
      typeof parsed.name !== "string" ||
      !parsed.name.trim() ||
      !Array.isArray(parsed.chords)
    ) {
      return null;
    }
    const chords = parsed.chords.filter(isChord);
    if (chords.length === 0) return null;
    return { name: parsed.name.trim(), chords };
  } catch {
    return null;
  }
}

export function clearPlaybackProgression(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
