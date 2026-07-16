import type { DegreeStyles } from "@/lib/music-types";

export type ScaleInfo = {
  key: string;
  label: string;
  intervals: number[];
};

export type ScaleNotesResponse = {
  key: string;
  root_pc: number;
  pitch_classes: number[];
};

export type ChordTypeInfo = {
  key: string;
  label: string;
  intervals: number[];
  positions: string[];
};

export type ChordLibraryGroup = {
  title: string;
  keys: string[];
};

export type ChordFretsResponse = {
  root_pc: number;
  chord_type: string;
  position: string;
  frets: number[];
};

export type ChordRecommendation = {
  root_pc: number;
  chord_type: string;
  roman?: string;
};

export type ChordProgression = {
  name: string;
  description: string;
  chords: ChordRecommendation[];
};

export type ChordProgressionsResponse = {
  scale_key: string;
  root_pc: number;
  source: string;
  model?: string;
  ai_error?: string;
  cached?: boolean;
  progressions: ChordProgression[];
};

function getApiUrl(): string {
  const url =
    process.env.GUITAR_API_URL ??
    process.env.NEXT_PUBLIC_GUITAR_API_URL ??
    "http://127.0.0.1:8000";
  return url.replace(/\/$/, "");
}

export async function fetchScales(): Promise<ScaleInfo[]> {
  const res = await fetch(`${getApiUrl()}/scales`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch scales: ${res.status}`);
  }

  return res.json();
}

export async function fetchScaleNotes(
  scaleKey: string,
  rootPc: number,
): Promise<number[]> {
  const res = await fetch(
    `${getApiUrl()}/scales/${scaleKey}/notes?root_pc=${rootPc}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch scale notes: ${res.status}`);
  }

  const data: ScaleNotesResponse = await res.json();
  return data.pitch_classes;
}

export async function fetchChordTypes(): Promise<ChordTypeInfo[]> {
  const res = await fetch(`${getApiUrl()}/chords/types`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch chord types: ${res.status}`);
  }

  return res.json();
}

export async function fetchChordLibrary(): Promise<ChordLibraryGroup[]> {
  const res = await fetch(`${getApiUrl()}/chords/library`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch chord library: ${res.status}`);
  }

  return res.json();
}

export async function fetchChordFrets(
  chordType: string,
  position: string,
  rootPc: number,
): Promise<number[] | null> {
  const res = await fetch(
    `${getApiUrl()}/chords/frets?root_pc=${rootPc}&chord_type=${encodeURIComponent(chordType)}&position=${position}`,
    { cache: "no-store" },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch chord frets: ${res.status}`);
  }

  const data: ChordFretsResponse = await res.json();
  return data.frets;
}

export async function fetchDegreeStyles(): Promise<DegreeStyles> {
  const res = await fetch(`${getApiUrl()}/degrees/styles`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch degree styles: ${res.status}`);
  }

  return res.json();
}

export async function fetchChordProgressions(
  scaleKey: string,
  rootPc: number,
  options?: { forceRefresh?: boolean },
): Promise<ChordProgressionsResponse> {
  const res = await fetch(`${getApiUrl()}/recommend/chords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scale_key: scaleKey,
      root_pc: rootPc,
      force_refresh: options?.forceRefresh ?? false,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to fetch progressions: ${res.status} ${detail}`);
  }

  return res.json();
}
