"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { ChordProgression, ChordProgressionsResponse, ScaleInfo } from "@/lib/guitar-api";
import { fetchChordProgressions, fetchScaleNotes } from "@/lib/guitar-api";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { DegreeStyles } from "@/lib/music-types";
import FretBoard from "@/components/FretBoard";
import SubmitButton from "@/components/SubmitButton";
import { createPreset, deletePreset } from "@/app/actions/presets";

export default function HomePageClient({
  isLoggedIn,
  presets,
  scales,
  degreeStyles,
  chordLabels,
}: {
  isLoggedIn: boolean;
  presets: {
    id: string;
    name: string;
    rootPc: number;
    scaleOrChord: string;
    type: string;
  }[];
  scales: ScaleInfo[];
  degreeStyles: DegreeStyles;
  chordLabels: Record<string, string>;
}) {
  const scaleLabels = Object.fromEntries(
    scales.map((scale) => [scale.key, scale.label]),
  );
  const scaleIntervals = Object.fromEntries(
    scales.map((scale) => [scale.key, scale.intervals]),
  );
  const [rootPc, setRootPc] = useState(0);
  const [currentScale, setCurrentScale] = useState(scales[0]?.key ?? "major");
  const [useFlats, setUseFlats] = useState(false);
  const [highlightSet, setHighlightSet] = useState<Set<number>>(new Set());
  const [showDegrees, setShowDegrees] = useState(true);
  const [isDeleting, startDelete] = useTransition();
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [progressionsNotice, setProgressionsNotice] = useState<string | null>(
    null,
  );
  const [progressionsError, setProgressionsError] = useState<string | null>(
    null,
  );
  const [progressionsLoadedKey, setProgressionsLoadedKey] = useState<
    string | null
  >(null);
  const progressionsKey = `${currentScale}-${rootPc}`;
  const progressionsLoading = progressionsLoadedKey !== progressionsKey;

  useEffect(() => {
    let cancelled = false;

    fetchScaleNotes(currentScale, rootPc)
      .then((pitchClasses) => {
        if (!cancelled) {
          setHighlightSet(new Set(pitchClasses));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHighlightSet(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentScale, rootPc]);

  useEffect(() => {
    let cancelled = false;
    const scaleAtRequest = currentScale;
    const rootAtRequest = rootPc;
    const keyAtRequest = progressionsKey;

    fetchChordProgressions(scaleAtRequest, rootAtRequest)
      .then((data: ChordProgressionsResponse) => {
        if (cancelled) return;
        if (
          data.scale_key !== scaleAtRequest ||
          data.root_pc !== rootAtRequest
        ) {
          return;
        }
        setProgressions(data.progressions);
        setProgressionsError(null);
        if (data.source === "rules") {
          setProgressionsNotice(
            data.ai_error?.includes("QUOTA")
              ? "Quota IA épuisé — progressions de secours affichées. Passe à Ollama (local) ou Groq (gratuit)."
              : "IA indisponible — progressions de secours affichées.",
          );
        } else {
          setProgressionsNotice(
            data.source === "ollama"
              ? `Généré par Ollama (${data.model ?? "local"}) — gratuit, sans quota.`
              : data.source === "groq"
                ? `Généré par Groq (${data.model ?? "cloud"}) — IA gratuite en production.`
                : data.cached
                  ? "Progression en cache (même gamme / fondamentale)."
                  : null,
          );
        }
        setProgressionsLoadedKey(keyAtRequest);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setProgressions([]);
        const message =
          error instanceof Error ? error.message : "Erreur inconnue";
        if (message.includes("503")) {
          setProgressionsError(
            "Clé IA non configurée sur l'API (GROQ_API_KEY ou OPENAI_API_KEY).",
          );
        } else if (
          message.includes("GROQ_API_KEY") ||
          message.includes("placeholder") ||
          message.includes("invalid") ||
          message.includes("OPENAI_API_KEY")
        ) {
          setProgressionsError(
            "Clé IA manquante ou invalide — configure GROQ_API_KEY sur Railway (voir DEPLOY-GROQ.md).",
          );
        } else {
          setProgressionsError(
            "Impossible de charger les progressions IA pour le moment.",
          );
        }
        setProgressionsLoadedKey(keyAtRequest);
      });

    return () => {
      cancelled = true;
    };
  }, [currentScale, rootPc, progressionsKey]);

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
            {scales.map((scale) => (
              <option key={scale.key} value={scale.key}>
                {scale.label}
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
            <SubmitButton
              className="text-sm font-semibold px-3 py-2 rounded-md"
              style={{
                color: "var(--accent)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Sauvegarder
            </SubmitButton>
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
        scaleIntervals={scaleIntervals[currentScale] ?? []}
        degreeStyles={degreeStyles}
      />
      <section
        className="mt-8 rounded-lg py-4 px-4"
        style={{
          background: "var(--panel)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: "var(--accent)" }}
        >
          Progressions d&apos;accords (IA)
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Suggestions pour{" "}
          <strong style={{ color: "var(--text)" }}>
            {NOTE_NAMES_SHARP[rootPc]} {scaleLabels[currentScale] ?? currentScale}
          </strong>
          .
        </p>
        {progressionsLoading && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Génération en cours…
          </p>
        )}
        {progressionsNotice && (
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
            {progressionsNotice}
          </p>
        )}
        {progressionsError && (
          <p className="text-sm" style={{ color: "var(--root)" }}>
            {progressionsError}
          </p>
        )}
        {!progressionsLoading &&
          !progressionsError &&
          progressions.length > 0 &&
          progressions.map((progression) => (
            <article key={progression.name} className="mb-4 last:mb-0">
              <h3
                className="font-semibold mb-1"
                style={{ color: "var(--text)" }}
              >
                {progression.name}
              </h3>
              <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
                {progression.description}
              </p>
              <ol className="flex flex-wrap gap-2 list-none">
                {progression.chords.map((chord, index) => (
                  <li key={`${progression.name}-${index}`}>
                    <Link
                      href={`/chords?root_pc=${chord.root_pc}&chord_type=${encodeURIComponent(chord.chord_type)}`}
                      className="text-sm px-3 py-2 rounded-md inline-block transition-opacity hover:opacity-90"
                      style={{
                        background: "var(--wood-dark)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--text)",
                        cursor: "pointer",
                      }}
                      title="Voir cet accord sur le manche CAGED"
                    >
                      {NOTE_NAMES_SHARP[chord.root_pc]}{" "}
                      {chordLabels[chord.chord_type] ?? chord.chord_type}
                      {chord.roman ? (
                        <span className="opacity-70"> ({chord.roman})</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
      </section>
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
                  {scaleLabels[preset.scaleOrChord] ?? preset.scaleOrChord}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    if (!confirm(`Supprimer « ${preset.name} » ?`)) return;
                    startDelete(async () => {
                      await deletePreset(preset.id);
                    });
                  }}
                  className="shrink-0 text-sm font-semibold px-3 py-2 rounded-md"
                  style={{
                    color: "var(--root)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    opacity: isDeleting ? 0.6 : 1,
                    cursor: isDeleting ? "wait" : undefined,
                  }}
                  aria-label={`Supprimer ${preset.name}`}
                >
                  {isDeleting ? "…" : "Supprimer"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
