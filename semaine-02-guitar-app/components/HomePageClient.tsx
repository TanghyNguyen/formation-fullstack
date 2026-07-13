"use client";
import { useState } from "react";
import { SCALES, SCALE_LABELS, pitchClassesFromRoot } from "@/lib/scales";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import FretBoard from "@/components/FretBoard";
import { createPreset, deletePreset } from "@/app/actions/presets";

export default function HomePageClient({
  isLoggedIn,
  presets,
}: {
  isLoggedIn: boolean;
  presets: {
    id: string;
    name: string;
    rootPc: number;
    scaleOrChord: string;
    type: string;
  }[];
}) {
  const [rootPc, setRootPc] = useState(0); // C par défaut
  const [currentScale, setCurrentScale] = useState("major");
  const [useFlats, setUseFlats] = useState(false);
  const highlightSet = pitchClassesFromRoot(rootPc, SCALES[currentScale]);
  const [showDegrees, setShowDegrees] = useState(true);
  return (
    <main className="w-full max-w-5xl mx-auto min-h-screen py-10 px-4">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
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
          className="flex flex-col gap-1 text-sm w-full sm:w-auto"
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
          className="flex flex-col gap-1 text-sm w-full sm:w-auto"
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
          className="flex flex-row items-center gap-2 text-sm w-full sm:w-auto"
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
            onChange={(e) => setUseFlats(e.target.checked)}
            checked={useFlats}
          />
        </label>
        <label
          className="flex flex-row items-center gap-2 text-sm w-full sm:w-auto"
          style={{ color: "var(--muted)" }}
        >
          Degrés
          <input
            type="checkbox"
            checked={showDegrees}
            onChange={(e) => setShowDegrees(e.target.checked)}
          />
        </label>
        {isLoggedIn ? (
          <form
            action={createPreset}
            className="flex gap-2 items-end w-full sm:w-auto"
          >
            <label
              className="flex flex-col gap-1 text-sm"
              style={{ color: "var(--muted)" }}
            >
              Nom du preset
              <input
                name="name"
                required
                placeholder="Ex: Blues en La"
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  background: "var(--wood-dark)",
                  color: "var(--text)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </label>
            <input type="hidden" name="rootPc" value={rootPc} />
            <input type="hidden" name="scaleOrChord" value={currentScale} />
            <input type="hidden" name="type" value="scale" />
            <button
              type="submit"
              className="text-sm font-semibold px-3 py-2 rounded-md"
              style={{
                color: "var(--accent)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Sauvegarder
            </button>
          </form>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Connecte-toi pour sauvegarder un preset.
          </p>
        )}
      </div>
      <FretBoard
        highlightSet={highlightSet}
        rootPc={rootPc}
        useFlats={useFlats}
        onCellClick={(pc) => setRootPc(pc)}
        showDegrees={showDegrees}
        currentScale={currentScale}
      />
      {isLoggedIn && presets.length > 0 && (
        <section className="mt-8">
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Mes presets
          </h2>
          <ul className="flex flex-col gap-2">
            {presets.map((preset) => (
              <li key={preset.id} className="flex gap-2 items-stretch">
                <button
                  type="button"
                  onClick={() => {
                    setRootPc(preset.rootPc);
                    setCurrentScale(preset.scaleOrChord);
                  }}
                  className="flex-1 text-left text-sm px-3 py-2 rounded-md"
                  style={{
                    background: "var(--wood-dark)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text)",
                  }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {preset.name}
                  </span>
                  {" — "}
                  {NOTE_NAMES_SHARP[preset.rootPc]}{" "}
                  {SCALE_LABELS[preset.scaleOrChord] ?? preset.scaleOrChord}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Supprimer « ${preset.name} » ?`)) return;
                    await deletePreset(preset.id);
                  }}
                  className="shrink-0 text-sm font-semibold px-3 py-2 rounded-md"
                  style={{
                    color: "var(--root)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  aria-label={`Supprimer ${preset.name}`}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
