"use client";

import {
  NUM_STRINGS,
  pitchClassAt,
  guitarStringNumberFromSi,
} from "@/lib/tuning";
import { noteName } from "@/lib/notes";

const NUM_FRETS = 16;

type CagedFretboardProps = {
  chordFrets: readonly number[];
  rootPc: number;
  useFlats: boolean;
};

export default function CagedFretboard({
  chordFrets,
  rootPc,
  useFlats,
}: CagedFretboardProps) {
  const strings = Array.from(
    { length: NUM_STRINGS },
    (_, i) => NUM_STRINGS - 1 - i,
  );
  const frets = Array.from({ length: NUM_FRETS + 1 }, (_, i) => i);

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
        {/* En-tête numéros de frettes */}
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

        {/* Lignes de cordes */}
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
              const targetFret = chordFrets[si];
              const isMuted = targetFret === -1;
              const isActive = targetFret === fret;
              const pc = pitchClassAt(si, fret);
              const isRoot = isActive && pc === rootPc;

              return (
                <div
                  key={fret}
                  className="w-full min-h-15 flex items-center justify-center shrink-0 rounded text-base font-semibold"
                  style={{
                    background: isRoot
                      ? "var(--root)"
                      : isActive
                        ? "var(--chord)"
                        : "rgba(20, 16, 12, 0.55)",
                    color: isRoot || isActive ? "#0d1a2d" : "var(--muted)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: isMuted ? 0.12 : 1,
                    boxShadow: isRoot
                      ? "0 0 0 2px rgba(255,107,74,0.5)"
                      : undefined,
                  }}
                >
                  {isActive ? noteName(pc, useFlats) : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
