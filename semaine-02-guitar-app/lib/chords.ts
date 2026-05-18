type ChordGroup = {
  title: string;
  keys: readonly string[];
};

export const CHORDS: Record<string, readonly number[]> = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7": [0, 4, 7, 10],
  /** 7ème majeure — même accord que M7 / Δ7 / « ma7 » sur les grilles. */
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  "m7♭5": [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  "7sus4": [0, 5, 7, 10],
  maj7sus2: [0, 2, 7, 11],
  maj7sus4: [0, 5, 7, 11],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  mM7: [0, 3, 7, 11],
  "9": [0, 4, 7, 10, 2],
  maj9: [0, 4, 7, 11, 2],
  m9: [0, 3, 7, 10, 2],
  add9: [0, 4, 7, 2],
  madd9: [0, 3, 7, 2],
  "11": [0, 4, 7, 10, 2, 5],
  maj11: [0, 4, 7, 11, 2, 5],
  m11: [0, 3, 7, 10, 2, 5],
  "13": [0, 4, 7, 10, 2, 9],
  maj13: [0, 4, 7, 11, 2, 9],
  m13: [0, 3, 7, 10, 2, 9],
  "7♭5": [0, 4, 6, 10],
  "7♯5": [0, 4, 8, 10],
  "7♭9": [0, 4, 7, 10, 1],
  "7♯9": [0, 4, 7, 10, 3],
  "7♭13": [0, 4, 7, 10, 8],
  "maj7♯5": [0, 4, 8, 11],
  "maj7♯11": [0, 4, 7, 11, 6],
  "5": [0, 7],
  "6/9": [0, 4, 7, 9, 2],
  "m7♭9": [0, 3, 7, 10, 1],
  "9sus4": [0, 5, 7, 10, 2],
  "maj7♭5": [0, 4, 6, 11],
  "m7♯5": [0, 3, 8, 10],
  "7♯11": [0, 4, 7, 10, 6],
  "maj9♯11": [0, 4, 7, 11, 2, 6],
  "9♯11": [0, 4, 7, 10, 2, 6],
  "13♭9": [0, 4, 7, 10, 1, 9],
  "13♯9": [0, 4, 7, 10, 3, 9],
  "7♭9♯11": [0, 4, 7, 10, 1, 6],
  "7♯9♯11": [0, 4, 7, 10, 3, 6],
  add4: [0, 4, 5, 7],
  "add♯11": [0, 4, 7, 6],
  madd11: [0, 3, 5, 7],
  maj7add13: [0, 4, 7, 11, 9],
  "sus♯4": [0, 6, 7],
  "7♭5♭9": [0, 4, 6, 10, 1],
  "7♭5♯9": [0, 4, 6, 10, 3],
  "maj7♭9": [0, 4, 7, 11, 1],
  "dim(maj7)": [0, 3, 6, 11],
  "aug(maj7)": [0, 4, 8, 11],
  aug7: [0, 4, 8, 10],
  "m(maj9)": [0, 3, 7, 11, 2],
  "maj13♯11": [0, 4, 7, 11, 2, 6, 9],
};

export const CHORD_LIBRARY_GROUPS: readonly ChordGroup[] = [
  { title: "Triades", keys: ["M", "m", "dim", "aug", "sus2", "sus4"] },
  {
    title: "Septième de dominante / majeure / mineure",
    keys: ["7", "maj7", "m7", "m7♭5", "dim7", "7sus4", "maj7sus2", "maj7sus4"],
  },
  { title: "Sixtes", keys: ["6", "m6", "mM7"] },
  {
    title: "Neuvièmes et extensions",
    keys: [
      "9",
      "maj9",
      "m9",
      "add9",
      "madd9",
      "11",
      "maj11",
      "m11",
      "13",
      "maj13",
      "m13",
    ],
  },
  {
    title: "Altérations et jazz",
    keys: [
      "7♭5",
      "7♯5",
      "7♭9",
      "7♯9",
      "7♭13",
      "maj7♯5",
      "maj7♯11",
      "m7♭9",
      "7♯11",
      "maj9♯11",
      "9♯11",
      "13♭9",
      "13♯9",
      "7♭9♯11",
      "7♯9♯11",
      "7♭5♭9",
      "7♭5♯9",
      "maj7♭9",
    ],
  },
  {
    title: "Sus / add / extensions diverses",
    keys: ["9sus4", "add4", "add♯11", "madd11", "maj7add13", "sus♯4"],
  },
  {
    title: "Accords augmentés / diminués étendus",
    keys: ["dim(maj7)", "aug(maj7)", "aug7", "maj7♭5", "m7♯5", "m(maj9)"],
  },
  { title: "Autres", keys: ["5", "6/9", "maj13♯11"] },
];

export const CHORD_SELECT_PRIORITY = [
  "M",
  "m",
  "7",
  "maj7",
  "M7",
  "m7",
  "dim",
  "aug",
  "sus2",
  "sus4",
  "dim7",
  "m7♭5",
  "7sus4",
  "maj7sus2",
  "maj7sus4",
  "6",
  "m6",
  "mM7",
  "9",
  "maj9",
  "m9",
  "add9",
  "madd9",
  "11",
  "maj11",
  "m11",
  "13",
  "maj13",
  "m13",
  "5",
  "6/9",
];

export function orderedChordKeys(): string[] {
  const all = Object.keys(CHORDS);
  const prioritized = CHORD_SELECT_PRIORITY.filter((k) => all.includes(k));
  const used = new Set(prioritized);
  const rest = all.filter((k) => !used.has(k)).sort();
  return [...prioritized, ...rest];
}

export function chordSelectLabel(key: string): string {
  switch (key) {
    case "maj7":
      return "maj7 — 7ème majeure (Δ7, M7)";
    case "M7":
      return "M7 — 7ème majeure (= maj7)";
    case "7":
      return "7 — dominante (7ème mineure)";
    case "m7":
      return "m7 — 7ème mineure";
    case "M":
      return "M — majeur (triade)";
    case "m":
      return "m — mineur (triade)";
    default:
      return key;
  }
}
