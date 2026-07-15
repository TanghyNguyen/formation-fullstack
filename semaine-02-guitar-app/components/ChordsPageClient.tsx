"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { ChordLibraryGroup, ChordTypeInfo } from "@/lib/guitar-api";
import { fetchChordFrets } from "@/lib/guitar-api";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { CagedPosition, ChordType, DegreeStyles } from "@/lib/music-types";
import CagedFretboard from "@/components/CagedFretboard";
import ChordDiagram from "@/components/ChordDiagram";
import SubmitButton from "@/components/SubmitButton";
import { createPreset, deletePreset } from "@/app/actions/presets";

const CAGED: readonly CagedPosition[] = ["C", "A", "G", "E", "D"];

export default function ChordsPageClient({
  isLoggedIn,
  presets,
  chordTypes,
  libraryGroups,
  degreeStyles,
}: {
  isLoggedIn: boolean;
  presets: {
    id: string;
    name: string;
    rootPc: number;
    scaleOrChord: string;
    type: string;
    cagedPos: string | null;
  }[];
  chordTypes: ChordTypeInfo[];
  libraryGroups: ChordLibraryGroup[];
  degreeStyles: DegreeStyles;
}) {
  const chordLabels = Object.fromEntries(
    chordTypes.map((chord) => [chord.key, chord.label]),
  );
  const intervalsByType = Object.fromEntries(
    chordTypes.map((chord) => [chord.key, chord.intervals]),
  );
  const positionsByType = Object.fromEntries(
    chordTypes.map((chord) => [chord.key, chord.positions]),
  );

  const [rootPc, setRootPc] = useState(0);
  const [chordType, setChordType] = useState<ChordType>(
    (chordTypes[0]?.key as ChordType) ?? "M",
  );
  const [cagedPos, setCagedPos] = useState<CagedPosition>("E");
  const [useFlats, setUseFlats] = useState(false);
  const [chordFrets, setChordFrets] = useState<number[] | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const searchParams = useSearchParams();

  function firstAvailablePosition(type: string): CagedPosition {
    const positions = positionsByType[type] ?? [];
    return (positions.find((p) => CAGED.includes(p as CagedPosition)) ??
      "E") as CagedPosition;
  }

  function handleChordTypeChange(next: ChordType) {
    setChordType(next);
    const positions = positionsByType[next] ?? [];
    if (!positions.includes(cagedPos)) {
      setCagedPos(firstAvailablePosition(next));
    }
  }

  function loadPreset(preset: (typeof presets)[number]) {
    const nextType = preset.scaleOrChord as ChordType;
    setRootPc(preset.rootPc);
    setChordType(nextType);
    const savedPos = preset.cagedPos as CagedPosition | null;
    const positions = positionsByType[nextType] ?? [];
    if (savedPos && positions.includes(savedPos)) {
      setCagedPos(savedPos);
    } else {
      setCagedPos(firstAvailablePosition(nextType));
    }
  }

  useEffect(() => {
    const rootParam = searchParams.get("root_pc");
    const typeParam = searchParams.get("chord_type");

    if (rootParam !== null) {
      const pc = Number.parseInt(rootParam, 10);
      if (!Number.isNaN(pc) && pc >= 0 && pc <= 11) {
        setRootPc(pc);
      }
    }

    if (typeParam && intervalsByType[typeParam]) {
      const nextType = typeParam as ChordType;
      setChordType(nextType);
      const positions = positionsByType[nextType] ?? [];
      setCagedPos((current) =>
        positions.includes(current)
          ? current
          : firstAvailablePosition(nextType),
      );
    }
  }, [searchParams, intervalsByType, positionsByType]);

  useEffect(() => {
    let cancelled = false;

    fetchChordFrets(chordType, cagedPos, rootPc)
      .then((frets) => {
        if (!cancelled) {
          setChordFrets(frets);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChordFrets(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chordType, cagedPos, rootPc]);

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
          Type d&apos;accord
          <select
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            className="rounded-md px-3 py-2 text-sm"
            value={chordType}
            onChange={(e) => handleChordTypeChange(e.target.value as ChordType)}
          >
            {chordTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
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
            checked={useFlats}
            onChange={(e) => setUseFlats(e.target.checked)}
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
                placeholder="Ex: Am7 en Do"
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  background: "var(--wood-dark)",
                  color: "var(--text)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </label>
            <input type="hidden" name="rootPc" value={rootPc} />
            <input type="hidden" name="scaleOrChord" value={chordType} />
            <input type="hidden" name="cagedPos" value={cagedPos} />
            <input type="hidden" name="type" value="chord" />
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
      <div
        className="flex rounded-[10px] overflow-hidden border mb-6 w-full"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {CAGED.map((pos) => {
          const isAvailable = (positionsByType[chordType] ?? []).includes(pos);
          return (
            <button
              key={pos}
              disabled={!isAvailable}
              onClick={() => setCagedPos(pos)}
              className="flex-1 py-2.5 font-mono font-semibold text-base transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background:
                  pos === cagedPos ? "var(--accent)" : "var(--wood-dark)",
                color: pos === cagedPos ? "#1a1208" : "var(--muted)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {pos}
              <span className="block text-[0.6rem] font-normal opacity-70 font-sans mt-px">
                forme
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {chordFrets ? (
          <>
            <div className="w-full overflow-x-auto lg:flex-1 lg:min-w-0">
              <CagedFretboard
                chordFrets={chordFrets}
                rootPc={rootPc}
                useFlats={useFlats}
                chordIntervals={intervalsByType[chordType] ?? []}
                degreeStyles={degreeStyles}
              />
            </div>
            <ChordDiagram
              chordFrets={chordFrets}
              rootPc={rootPc}
              useFlats={useFlats}
              chordType={chordType}
              cagedPos={cagedPos}
              degreeStyles={degreeStyles}
            />
          </>
        ) : (
          <p style={{ color: "var(--muted)" }}>
            Forme indisponible pour cet accord.
          </p>
        )}
      </div>
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
                  onClick={() => loadPreset(preset)}
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
                  {chordLabels[preset.scaleOrChord] ?? preset.scaleOrChord}
                  {preset.cagedPos ? ` — forme ${preset.cagedPos}` : ""}
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
      <div
        className="rounded-lg py-4 px-4 mt-6 flex flex-col gap-4"
        style={{
          background: "var(--panel)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2>Bibliothèque d&apos;accords</h2>
        {libraryGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <div className="flex flex-wrap gap-2">
              {group.keys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleChordTypeChange(key as ChordType)}
                  className="rounded-md px-3 py-2 text-sm flex flex-col gap-1"
                  style={{
                    background: "var(--wood-dark)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <span>{key}</span>
                  <span>{(intervalsByType[key] ?? []).join(", ")}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
