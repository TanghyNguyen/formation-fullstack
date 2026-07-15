"use client";

import { pitchClassAt } from "@/lib/tuning";
import { noteName } from "@/lib/notes";
import type { CagedPosition, ChordType, DegreeStyles } from "@/lib/music-types";
import { chordDegree } from "@/lib/degrees";

type ChordDiagramProps = {
  chordFrets: readonly number[];
  rootPc: number;
  useFlats: boolean;
  chordType: ChordType;
  cagedPos: CagedPosition;
  degreeStyles: DegreeStyles;
};

export default function ChordDiagram({
  chordFrets,
  rootPc,
  useFlats,
  chordType,
  cagedPos,
  degreeStyles,
}: ChordDiagramProps) {
  const W = 150;
  const pad = 30;
  const strGap = (W - 2 * pad) / 5;
  const fretH = 30;
  const topY = 38;
  const mc = "#8a847a";
  const tc = "#e8e4dc";

  const played = chordFrets.filter((f) => f > 0);
  const minF = played.length ? Math.min(...played) : 1;
  const maxF = played.length ? Math.max(...played) : 4;
  const startFret = maxF <= 4 ? 1 : Math.max(1, minF);
  const numFrets = maxF <= 4 ? 4 : Math.max(4, maxF - startFret + 1);
  const H = topY + numFrets * fretH + 20;

  const chordName =
    noteName(rootPc, useFlats) + (chordType === "M" ? "" : chordType);

  const pf = chordFrets.filter((f) => f >= 0);
  const loFret = pf.length ? Math.min(...pf) : 0;
  const hiFret = pf.length ? Math.max(...pf) : 0;

  const hasOpen = chordFrets.some((f) => f === 0);
  const barreF = hasOpen ? -1 : Math.min(...chordFrets.filter((f) => f >= 0));
  const barreStrings = chordFrets
    .map((f, si) => (f === barreF ? si : -1))
    .filter((si) => si >= 0);
  const allPlayed = chordFrets
    .map((f, si) => (f >= 0 ? si : -1))
    .filter((si) => si >= 0);
  const showBarre =
    !hasOpen &&
    barreStrings.length >= 2 &&
    barreF >= startFret &&
    barreF < startFret + numFrets;

  const leftPad = startFret > 1 ? 14 : 0;

  return (
    <div
      className="shrink-0 flex flex-col items-center gap-2 rounded-lg py-4 px-4"
      style={{
        background: "var(--panel)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-xl font-bold"
        style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
      >
        {chordName}
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        Forme {cagedPos}
      </div>
      <svg
        viewBox={`${-leftPad} 0 ${W + leftPad} ${H}`}
        width={W}
        height={H}
        className="block"
      >
        <rect
          x={-leftPad}
          y="0"
          width={W + leftPad}
          height={H}
          fill="#2a1f17"
          rx="6"
        />

        {startFret > 1 && (
          <text
            x={pad - 12}
            y={topY + fretH / 2 + 4}
            fill={mc}
            fontSize={10}
            fontFamily="var(--font-mono)"
            textAnchor="end"
          >
            {startFret}fr
          </text>
        )}

        {startFret === 1 && (
          <line
            x1={pad}
            y1={topY}
            x2={pad + 5 * strGap}
            y2={topY}
            stroke={tc}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}

        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={pad}
            y1={topY + i * fretH}
            x2={pad + 5 * strGap}
            y2={topY + i * fretH}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        ))}

        {Array.from({ length: 6 }).map((_, s) => (
          <line
            key={`str-${s}`}
            x1={pad + s * strGap}
            y1={topY}
            x2={pad + s * strGap}
            y2={topY + numFrets * fretH}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.3 - s * 0.08}
          />
        ))}

        {showBarre && (
          <rect
            x={pad + Math.min(...allPlayed) * strGap - 4}
            y={topY + (barreF - startFret) * fretH + fretH / 2 - 7}
            width={
              (Math.max(...allPlayed) - Math.min(...allPlayed)) * strGap + 8
            }
            height={14}
            rx={7}
            fill="rgba(255,255,255,0.35)"
          />
        )}

        {chordFrets.map((f, s) => {
          const x = pad + s * strGap;

          if (f === -1) {
            return (
              <text
                key={s}
                x={x}
                y={topY - 10}
                fill={mc}
                fontSize={13}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                ✕
              </text>
            );
          }

          if (f === 0) {
            return (
              <g key={s}>
                <circle
                  cx={x}
                  cy={topY - 11}
                  r={5}
                  fill="none"
                  stroke={tc}
                  strokeWidth={1.5}
                />
                <text
                  x={x}
                  y={topY - 8}
                  fill={tc}
                  fontSize={6}
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {noteName(pitchClassAt(s, 0), useFlats)}
                </text>
              </g>
            );
          }

          if (f < startFret || f >= startFret + numFrets) return null;

          const y = topY + (f - startFret) * fretH + fretH / 2;
          const pc = pitchClassAt(s, f);
          const degree = chordDegree(pc, rootPc);

          return (
            <g key={s}>
              <circle cx={x} cy={y} r={9} fill={degreeStyles[degree].color} />
              <text
                x={x}
                y={y + 3.5}
                fill={"#0d1a2d"}
                fontSize={8}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {noteName(pc, useFlats)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-center" style={{ color: "var(--muted)" }}>
        {loFret === hiFret ? (
          <>
            Frette <strong style={{ color: "var(--text)" }}>{loFret}</strong>
          </>
        ) : (
          <>
            Frettes <strong style={{ color: "var(--text)" }}>{loFret}</strong> –{" "}
            <strong style={{ color: "var(--text)" }}>{hiFret}</strong>
          </>
        )}
      </div>
    </div>
  );
}
