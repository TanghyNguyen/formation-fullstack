"use client";
import { useState } from "react";
import { SCALES, SCALE_LABELS, pitchClassesFromRoot } from "@/lib/scales";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import FretBoard from "@/components/FretBoard";

export default function HomePage() {
  const [rootPc, setRootPc] = useState(0); // C par défaut
  const [currentScale, setCurrentScale] = useState("major");
  const [useFlats, setUseFlats] = useState(false);
  const highlightSet = pitchClassesFromRoot(rootPc, SCALES[currentScale]);
  const [showDegrees, setShowDegrees] = useState(false);
  return (
    <main className="w-full max-w-5xl mx-auto min-h-screen py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-200 dark:text-gray-100">
        Guitar App
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
          Gamme
          <select
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            className="rounded-md px-3 py-2 text-sm"
            onChange={(e) => setCurrentScale(e.target.value)}
            value={currentScale}
          >
            {Object.keys(SCALES).map((scale) => (
              <option key={scale} value={scale}>
                {SCALE_LABELS[scale] ?? scale}
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
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            className="rounded-md px-3 py-8 text-sm"
            onChange={(e) => setUseFlats(e.target.checked)}
            checked={useFlats}
          />
        </label>
        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          Degrés
          <input
            type="checkbox"
            checked={showDegrees}
            onChange={(e) => setShowDegrees(e.target.checked)}
          />
        </label>
      </div>
      <FretBoard
        highlightSet={highlightSet}
        rootPc={rootPc}
        useFlats={useFlats}
        onCellClick={(pc) => setRootPc(pc)}
        showDegrees={showDegrees}
        currentScale={currentScale}
      />
    </main>
  );
}
