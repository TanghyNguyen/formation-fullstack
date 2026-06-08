"use client";

import { useState } from "react";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import {
  CHORD_ORDER,
  CHORD_LABELS,
  CAGED,
  SHAPES,
  computeFrets,
  type ChordType,
  type CagedPosition,
} from "@/lib/caged";
import CagedFretboard from "@/components/CagedFretboard";

export default function ChordsPage() {
  const [rootPc, setRootPc] = useState(0);
  const [chordType, setChordType] = useState<ChordType>("M");
  const [cagedPos, setCagedPos] = useState<CagedPosition>("E");
  const [useFlats, setUseFlats] = useState(false);

  const shape = SHAPES[chordType]?.[cagedPos];
  const chordFrets = shape ? computeFrets(rootPc, shape) : null;

  return (
    <main className="w-full max-w-5xl mx-auto min-h-screen py-10 px-4">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        Accords — CAGED
      </h1>
      <div
        className="flex flex-wrap gap-4 py-4 px-4 rounded-lg items-end mb-6"
        style={{
          background: "var(--panel)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          Fondamentale
          <select
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            className="rounded-md px-3 py-2 text-sm"
            onChange={(e) => setRootPc(parseInt(e.target.value, 10))}
            value={rootPc}
          >
            {NOTE_NAMES_SHARP.map((note, index) => (
              <option key={index} value={index}>
                {note}
              </option>
            ))}
          </select>
        </label>
        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          Type d&apos;accord
          <select
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            className="rounded-md px-3 py-2 text-sm"
            value={chordType}
            onChange={(e) => setChordType(e.target.value as ChordType)}
          >
            {CHORD_ORDER.map((type) => (
              <option key={type} value={type}>
                {CHORD_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          Bémols
          <input
            type="checkbox"
            checked={useFlats}
            onChange={(e) => setUseFlats(e.target.checked)}
          />
        </label>
        <div className="flex gap-1 mb-6">
          {CAGED.map((pos) => {
            const isAvailable = Boolean(SHAPES[chordType]?.[pos]);
            return (
              <button
                key={pos}
                disabled={!isAvailable}
                onClick={() => setCagedPos(pos)}
                className="flex-1 py-2 rounded font-bold text-sm transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                  background:
                    pos === cagedPos ? "var(--accent)" : "var(--wood-dark)",
                  color: pos === cagedPos ? "#1a1208" : "var(--muted)",
                }}
              >
                {pos}
              </button>
            );
          })}
        </div>
      </div>
      {chordFrets ? (
        <CagedFretboard
          chordFrets={chordFrets}
          rootPc={rootPc}
          useFlats={useFlats}
        />
      ) : (
        <p style={{ color: "var(--muted)" }}>
          Forme indisponible pour cet accord.
        </p>
      )}
    </main>
  );
}
