"use client";
import {
  NUM_STRINGS,
  pitchClassAt,
  guitarStringNumberFromSi,
} from "@/lib/tuning";
import { noteName } from "@/lib/notes";
import FretCell from "./FretCell";
import { chordDegree, DEGREE_STYLES } from "@/lib/caged";
import { SCALES } from "@/lib/scales";

type FretBoardProps = {
  highlightSet: Set<number>;
  rootPc: number;
  useFlats: boolean;
  onCellClick: (pc: number) => void;
  showDegrees: boolean;
  currentScale: string;
};

const NUM_FRETS = 16;

export default function FretBoard({
  highlightSet,
  rootPc,
  useFlats,
  onCellClick,
  showDegrees,
  currentScale,
}: FretBoardProps) {
  const strings = Array.from(
    { length: NUM_STRINGS },
    (_, i) => NUM_STRINGS - 1 - i,
  );
  const frets = Array.from({ length: NUM_FRETS + 1 }, (_, i) => i);
  const degrees = [
    ...new Set(SCALES[currentScale].map((i) => chordDegree(i, 0))),
  ];

  return (
    <div className="w-full pb-2">
      <div
        style={{
          background:
            "linear-gradient(180deg, var(--wood) 0%, var(--wood-dark) 100%)",
          borderRadius: "10px",
          padding: "0.65rem 0.75rem",
          boxShadow:
            "inset 0 2px 16px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.35)",
        }}
        className="flex flex-col gap-1 w-full"
      >
        <div
          className="grid gap-[3px] items-center mb-1"
          style={{
            gridTemplateColumns: `2.5rem repeat(${NUM_FRETS + 1}, minmax(2.65rem, 1fr))`,
          }}
        >
          <span className="invisible">.</span>
          {frets.map((fret) => (
            <span
              key={fret}
              className="text-xs flex items-center justify-center font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {fret}
            </span>
          ))}
        </div>
        {strings.map((si) => (
          <div
            key={si}
            className="grid gap-[3px] items-center"
            style={{
              gridTemplateColumns: `2.5rem repeat(${NUM_FRETS + 1}, minmax(2.65rem, 1fr))`,
            }}
          >
            <span
              className="h-full text-xs font-bold flex items-center justify-center rounded"
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                color: "var(--accent)",
              }}
            >
              {guitarStringNumberFromSi(si)}
            </span>
            {frets.map((fret) => {
              const pc = pitchClassAt(si, fret);
              const degree = highlightSet.has(pc)
                ? chordDegree(pc, rootPc)
                : null;
              return (
                <FretCell
                  key={fret}
                  note={noteName(pc, useFlats)}
                  isHighlighted={highlightSet.has(pc)}
                  isRoot={pc === rootPc}
                  onCellClick={() => onCellClick(pc)}
                  showDegrees={showDegrees}
                  degree={degree}
                />
              );
            })}
          </div>
        ))}
      </div>
      {showDegrees && (
        <div
          className="flex flex-wrap gap-4 justify-center mt-3 text-sm"
          style={{ color: "var(--muted)" }}
        >
          {degrees.map((deg) => (
            <div key={deg} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: DEGREE_STYLES[deg].color }}
              />
              {DEGREE_STYLES[deg].label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
