import { OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH } from "@/lib/tuning";

export type CagedShape = {
  off: readonly number[];
  rs: number;
  ro: number;
};

export type ChordType =
  | "M"
  | "m"
  | "7"
  | "m7"
  | "maj7"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4";

export type CagedPosition = "C" | "A" | "G" | "E" | "D";

export const SHAPES: Partial<
  Record<ChordType, Partial<Record<CagedPosition, CagedShape>>>
> = {
  M: {
    C: { off: [-1, 3, 2, 0, 1, 0], rs: 1, ro: 3 },
    A: { off: [-1, 0, 2, 2, 2, 0], rs: 1, ro: 0 },
    G: { off: [3, 2, 0, 0, 0, 3], rs: 0, ro: 3 },
    E: { off: [0, 2, 2, 1, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 3, 2], rs: 2, ro: 0 },
  },
  m: {
    C: { off: [-1, 3, 1, 0, 1, -1], rs: 1, ro: 3 },
    A: { off: [-1, 0, 2, 2, 1, 0], rs: 1, ro: 0 },
    G: { off: [3, 1, 0, 0, -1, 3], rs: 0, ro: 3 },
    E: { off: [0, 2, 2, 0, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 3, 1], rs: 2, ro: 0 },
  },
  "7": {
    C: { off: [-1, 3, 2, 3, 1, 0], rs: 1, ro: 3 },
    A: { off: [-1, 0, 2, 0, 2, 0], rs: 1, ro: 0 },
    G: { off: [3, 2, 0, 0, 0, 1], rs: 0, ro: 3 },
    E: { off: [0, 2, 0, 1, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 1, 2], rs: 2, ro: 0 },
  },
  m7: {
    C: { off: [-1, 3, 1, 3, 1, -1], rs: 1, ro: 3 },
    A: { off: [-1, 0, 2, 0, 1, 0], rs: 1, ro: 0 },
    G: { off: [3, 1, 0, 0, -1, 1], rs: 0, ro: 3 },
    E: { off: [0, 2, 0, 0, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 1, 1], rs: 2, ro: 0 },
  },
  maj7: {
    C: { off: [-1, 3, 2, 0, 0, 0], rs: 1, ro: 3 },
    A: { off: [-1, 0, 2, 1, 2, 0], rs: 1, ro: 0 },
    G: { off: [3, 2, 0, 0, 0, 2], rs: 0, ro: 3 },
    E: { off: [0, 2, 1, 1, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 2, 2], rs: 2, ro: 0 },
  },
  dim: {
    A: { off: [-1, 0, 1, 2, 1, 0], rs: 1, ro: 0 },
    E: { off: [0, 1, 2, 0, 0, -1], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 1, 3, 1], rs: 2, ro: 0 },
  },
  aug: {
    A: { off: [-1, 0, 3, 2, 2, -1], rs: 1, ro: 0 },
    E: { off: [0, 3, 2, 1, 0, -1], rs: 0, ro: 0 },
  },
  sus2: {
    A: { off: [-1, 0, 2, 2, 0, 0], rs: 1, ro: 0 },
    E: { off: [0, 2, 4, 4, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 3, 0], rs: 2, ro: 0 },
  },
  sus4: {
    A: { off: [-1, 0, 2, 2, 3, 0], rs: 1, ro: 0 },
    E: { off: [0, 2, 2, 2, 0, 0], rs: 0, ro: 0 },
    D: { off: [-1, -1, 0, 2, 3, 3], rs: 2, ro: 0 },
  },
};

export function computeFrets(tpc: number, shape: CagedShape): number[] {
  const tf = (tpc - OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH[shape.rs] + 12) % 12;
  let base = tf - shape.ro;
  if (base < 0) base += 12;
  return shape.off.map((o) => (o === -1 ? -1 : base + o));
}

export const CHORD_ORDER: readonly ChordType[] = [
  "M",
  "m",
  "7",
  "m7",
  "maj7",
  "dim",
  "aug",
  "sus2",
  "sus4",
];

export const CHORD_LABELS: Record<ChordType, string> = {
  M: "Majeur",
  m: "Mineur",
  "7": "7 (dom.)",
  m7: "m7",
  maj7: "maj7 (Δ7)",
  dim: "Diminué",
  aug: "Augmenté",
  sus2: "sus2",
  sus4: "sus4",
};

export const CAGED: readonly CagedPosition[] = ["C", "A", "G", "E", "D"];

export const CHORD_INTERVALS: Record<ChordType, readonly number[]> = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

export const LIBRARY_GROUPS: readonly {
  title: string;
  keys: readonly ChordType[];
}[] = [
  { title: "Triades", keys: ["M", "m", "dim", "aug", "sus2", "sus4"] },
  { title: "Septièmes", keys: ["7", "maj7", "m7"] },
];

export type ChordDegree =
  | "1"
  | "b2"
  | "2"
  | "b3"
  | "3"
  | "4"
  | "b5"
  | "5"
  | "b6"
  | "6"
  | "b7"
  | "7";

const DEGREE_BY_INTERVAL: readonly ChordDegree[] = [
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7",
];

export function chordDegree(pc: number, rootPc: number): ChordDegree {
  const interval = (pc - rootPc + 12) % 12;
  return DEGREE_BY_INTERVAL[interval];
}

const ROOT_COLOR = "#ff6b4a";
const THIRD_COLOR = "#6bcb77";
const FOURTH_COLOR = "#4d96ff";
const FIFTH_COLOR = "#e8c84b";
const SEVENTH_COLOR = "#b57bff";
const SOFT_COLOR = "#9a948a";

export const DEGREE_STYLES: Record<
  ChordDegree,
  { color: string; label: string }
> = {
  "1": { color: ROOT_COLOR, label: "Tonique" },
  b2: { color: SOFT_COLOR, label: "Seconde mineure" },
  "2": { color: SOFT_COLOR, label: "Seconde majeure" },
  b3: { color: THIRD_COLOR, label: "Tierce mineure" },
  "3": { color: THIRD_COLOR, label: "Tierce majeure" },
  "4": { color: FOURTH_COLOR, label: "Quarte juste" },
  b5: { color: SOFT_COLOR, label: "Triton" },
  "5": { color: FIFTH_COLOR, label: "Quinte juste" },
  b6: { color: SOFT_COLOR, label: "Sixte mineure" },
  "6": { color: SOFT_COLOR, label: "Sixte majeure" },
  b7: { color: SEVENTH_COLOR, label: "Septième mineure" },
  "7": { color: SEVENTH_COLOR, label: "Septième majeure" },
};
