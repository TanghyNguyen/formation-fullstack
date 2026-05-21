"use client";
import {
  NUM_STRINGS,
  pitchClassAt,
  guitarStringNumberFromSi,
} from "@/lib/tuning";
import { noteName } from "@/lib/notes";
import FretCell from "./FretCell";

type FretBoardProps = {
  highlightSet: Set<number>;
  rootPc: number;
  useFlats: boolean;
  onCellClick: (pc: number, note: string) => void;
};

const NUM_FRETS = 16;

export default function FretBoard({
  highlightSet,
  rootPc,
  useFlats,
  onCellClick,
}: FretBoardProps) {
  const strings = Array.from(
    { length: NUM_STRINGS },
    (_, i) => NUM_STRINGS - 1 - i,
  );
  const frets = Array.from({ length: NUM_FRETS + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-1">
      {strings.map((si) => (
        <div key={si} className="flex gap-1 items-center">
          <span className="w-6 text-xs text-gray-400">
            {guitarStringNumberFromSi(si)}
          </span>
          {frets.map((fret) => {
            const pc = pitchClassAt(si, fret);
            return (
              <FretCell
                key={fret}
                note={noteName(pc, useFlats)}
                isHighlighted={highlightSet.has(pc)}
                isRoot={pc === rootPc}
                onClick={() => onCellClick(pc, noteName(pc, useFlats))}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
