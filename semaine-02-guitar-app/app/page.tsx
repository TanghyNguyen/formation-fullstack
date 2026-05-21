"use client";
import { useState } from "react";
import { SCALES, SCALE_LABELS, pitchClassesFromRoot } from "@/lib/scales";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import FretBoard from "@/components/FretBoard";

export default function HomePage() {
  const [rootPc, setRootPc] = useState(0); // C par défaut
  const [currentScale, setCurrentScale] = useState("major");
  const [useFlats, setUseFlats] = useState(false);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const highlightSet = pitchClassesFromRoot(rootPc, SCALES[currentScale]);
  return (
    <main className="max-w-4xl mx-auto min-h-screen py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Guitar App
      </h1>
      <div className="flex gap-2 py-4 px-2 border rounded-md items-center mb-4">
        <select
          name="root"
          id="root"
          className="p-2 rounded-md border-gray-300"
          onChange={(e) => setRootPc(parseInt(e.target.value, 10))}
        >
          {NOTE_NAMES_SHARP.map((note, index) => (
            <option key={index} value={index}>
              {note}
            </option>
          ))}
        </select>
        <select
          name="scale"
          id="scale"
          onChange={(e) => setCurrentScale(e.target.value)}
        >
          {Object.keys(SCALES).map((scale) => (
            <option key={scale} value={scale}>
              {SCALE_LABELS[scale] ?? scale}
            </option>
          ))}
        </select>
        <input
          type="checkbox"
          name="useFlats"
          id="useFlats"
          onChange={(e) => setUseFlats(e.target.checked)}
        />
      </div>
      <FretBoard
        highlightSet={highlightSet}
        rootPc={rootPc}
        useFlats={useFlats}
        onCellClick={(pc, note) => setLastNote(note)}
      />
      {lastNote && (
        <p className="mt-4 text-sm text-gray-600">Note : {lastNote}</p>
      )}
    </main>
  );
}
