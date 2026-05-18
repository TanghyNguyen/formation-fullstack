export const OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH: readonly number[] = [
  4, 9, 2, 7, 11, 4,
];
export const STRING_TUNING_NAMES_LOW_TO_HIGH: readonly string[] = [
  "E",
  "A",
  "D",
  "G",
  "B",
  "e",
];
export const NUM_STRINGS = 6;

export function pitchClassAt(si: number, fret: number): number {
  return (OPEN_STRING_PITCH_CLASSES_LOW_TO_HIGH[si] + fret) % 12;
}

export function guitarStringNumberFromSi(si: number): number {
  return NUM_STRINGS - si;
}
