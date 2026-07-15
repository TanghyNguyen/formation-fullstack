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
