"use client";

import {
  NUM_STRINGS,
  pitchClassAt,
  guitarStringNumberFromSi,
} from "@/lib/tuning";
import { noteName } from "@/lib/notes";
import { chordDegree, legendDegreesFromIntervals } from "@/lib/degrees";
import type { DegreeStyles } from "@/lib/music-types";

const NUM_FRETS = 16;

type CagedFretboardProps = {
  chordFrets: readonly number[];
  rootPc: number;
  useFlats: boolean;
  chordIntervals: readonly number[];
  degreeStyles: DegreeStyles;
};

export default function CagedFretboard({
  chordFrets,
  rootPc,
  useFlats,
  chordIntervals,
  degreeStyles,
}: CagedFretboardProps) {
  const strings = Array.from(
    { length: NUM_STRINGS },
    (_, i) => NUM_STRINGS - 1 - i,
  );
  const frets = Array.from({ length: NUM_FRETS + 1 }, (_, i) => i);
  const degrees = legendDegreesFromIntervals(chordIntervals);

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
        className="overflow-x-auto flex flex-col gap-1"
      >
        <div
          className="grid gap-1 items-center"
          style={{
            gridTemplateColumns: `2.5rem repeat(${NUM_FRETS + 1}, minmax(2.65rem, 1fr))`,
          }}
        >
          <span className="invisible">.</span>
          {frets.map((fret) => (
            <span
              key={fret}
              className="text-xs flex items-center justify-center font-semibold rounded-full min-w-6 h-6 px-1.5 mx-auto"
              style={{
                background: "var(--string-label-bg)",
                color: "var(--string-label-fg)",
              }}
            >
              {fret}
            </span>
          ))}
        </div>

        {strings.map((si) => (
          <div
            key={si}
            className="grid gap-1 items-center"
            style={{
              gridTemplateColumns: `2.5rem repeat(${NUM_FRETS + 1}, minmax(2.65rem, 1fr))`,
            }}
          >
            <span
              className="h-full text-xs font-bold flex items-center justify-center rounded"
              style={{
                background: "var(--string-label-bg)",
                color: "var(--string-label-fg)",
              }}
            >
              {guitarStringNumberFromSi(si)}
            </span>
            {frets.map((fret) => {
              const targetFret = chordFrets[si];
              const isMuted = targetFret === -1;
              const isActive = targetFret === fret;
              const pc = pitchClassAt(si, fret);
              const isRoot = isActive && pc === rootPc;
              const degree = isActive ? chordDegree(pc, rootPc) : null;

              return (
                <div
                  key={fret}
                  className="w-full min-h-15 flex items-center justify-center shrink-0 rounded-md text-base font-semibold"
                  style={{
                    background: degree
                      ? degreeStyles[degree].color
                      : "var(--cell-idle)",
                    color: isRoot || isActive ? "var(--note-on)" : "var(--muted)",
                    border: "1px solid var(--border)",
                    opacity: isMuted ? 0.12 : 1,
                    boxShadow: isRoot
                      ? "0 0 0 2px rgba(255,107,74,0.5)"
                      : undefined,
                    borderLeft: fret === 0 ? "3px solid #f0ebe3" : undefined,
                  }}
                >
                  {isActive ? noteName(pc, useFlats) : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        className="flex flex-wrap gap-4 justify-center mt-3 text-sm"
        style={{ color: "var(--muted)" }}
      >
        {degrees.map((deg) => (
          <div key={deg} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: degreeStyles[deg].color }}
            />
            {degreeStyles[deg].label}
          </div>
        ))}
      </div>
    </div>
  );
}
