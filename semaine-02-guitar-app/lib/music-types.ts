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

export type DegreeStyle = {
  color: string;
  label: string;
};

export type DegreeStyles = Record<string, DegreeStyle>;
