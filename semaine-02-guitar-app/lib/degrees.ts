import type { ChordDegree } from "@/lib/music-types";

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

/** Miroir local de `degrees.chord_degree` côté API (calcul O(1)). */
export function chordDegree(pc: number, rootPc: number): ChordDegree {
  const interval = (pc - rootPc + 12) % 12;
  return DEGREE_BY_INTERVAL[interval];
}

export function legendDegreesFromIntervals(
  intervals: readonly number[],
): ChordDegree[] {
  return [...new Set(intervals.map((i) => chordDegree(i, 0)))];
}
