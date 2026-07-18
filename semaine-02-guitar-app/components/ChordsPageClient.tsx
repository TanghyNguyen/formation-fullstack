"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import type {
  ChordLibraryGroup,
  ChordRecommendation,
  ChordTypeInfo,
} from "@/lib/guitar-api";
import { fetchChordFrets } from "@/lib/guitar-api";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { CagedPosition, ChordType, DegreeStyles } from "@/lib/music-types";
import CagedFretboard from "@/components/CagedFretboard";
import ChordDiagram from "@/components/ChordDiagram";
import ProgressionPlayer from "@/components/ProgressionPlayer";
import SubmitButton from "@/components/SubmitButton";
import { createPreset, deletePreset } from "@/app/actions/presets";
import {
  getAccordsPrefsSnapshot,
  getServerAccordsPrefsSnapshot,
  subscribeAccordsPrefs,
  writeAccordsPrefs,
  type AccordsPrefs,
} from "@/lib/accords-prefs";
import {
  clearPlaybackProgression,
  loadPlaybackProgression,
  type PlaybackProgression,
} from "@/lib/progression-playback";

const CAGED: readonly CagedPosition[] = ["C", "A", "G", "E", "D"];

function firstAvailablePosition(
  type: string,
  positionsByType: Record<string, string[]>,
): CagedPosition {
  const positions = positionsByType[type] ?? [];
  return (positions.find((p) => CAGED.includes(p as CagedPosition)) ??
    "E") as CagedPosition;
}

function chordParamsFromSearch(
  searchParams: URLSearchParams,
  intervalsByType: Record<string, number[]>,
  positionsByType: Record<string, string[]>,
  defaultType: ChordType,
) {
  const rootParam = searchParams.get("root_pc");
  const typeParam = searchParams.get("chord_type");
  if (rootParam === null && typeParam === null) {
    return null;
  }

  let rootPc = 0;
  if (rootParam !== null) {
    const pc = Number.parseInt(rootParam, 10);
    if (!Number.isNaN(pc) && pc >= 0 && pc <= 11) {
      rootPc = pc;
    }
  }

  const chordType =
    typeParam && intervalsByType[typeParam]
      ? (typeParam as ChordType)
      : defaultType;
  const cagedPos = firstAvailablePosition(chordType, positionsByType);

  return {
    key: `${rootParam ?? ""}-${typeParam ?? ""}`,
    rootPc,
    chordType,
    cagedPos,
  };
}

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
  const defaultChordType = (chordTypes[0]?.key as ChordType) ?? "M";
  const validChordTypes = useMemo(
    () => chordTypes.map((chord) => chord.key),
    [chordTypes],
  );
  const searchParams = useSearchParams();

  const urlParams = useMemo(
    () =>
      chordParamsFromSearch(
        searchParams,
        intervalsByType,
        positionsByType,
        defaultChordType,
      ),
    [searchParams, intervalsByType, positionsByType, defaultChordType],
  );

  const storedPrefs = useSyncExternalStore(
    subscribeAccordsPrefs,
    () =>
      getAccordsPrefsSnapshot(
        defaultChordType,
        validChordTypes,
        positionsByType,
      ),
    () => getServerAccordsPrefsSnapshot(defaultChordType),
  );

  const [syncedUrlKey, setSyncedUrlKey] = useState<string | null>(null);
  const [urlOverride, setUrlOverride] = useState<AccordsPrefs | null>(null);

  if (urlParams && urlParams.key !== syncedUrlKey) {
    setSyncedUrlKey(urlParams.key);
    setUrlOverride({
      rootPc: urlParams.rootPc,
      chordType: urlParams.chordType,
      cagedPos: urlParams.cagedPos,
      useFlats: storedPrefs.useFlats,
    });
  } else if (!urlParams && syncedUrlKey !== null) {
    setSyncedUrlKey(null);
    setUrlOverride(null);
  }

  useEffect(() => {
    if (!urlParams) return;
    writeAccordsPrefs({
      rootPc: urlParams.rootPc,
      chordType: urlParams.chordType,
      cagedPos: urlParams.cagedPos,
      useFlats: storedPrefs.useFlats,
    });
    // Persist deep-links once per URL key; avoid looping on object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when URL chord target changes
  }, [urlParams?.key]);

  const prefs = urlOverride ?? storedPrefs;
  const { rootPc, chordType, cagedPos, useFlats } = prefs;

  function updatePrefs(patch: Partial<AccordsPrefs>) {
    const next = { ...prefs, ...patch };
    setUrlOverride(null);
    writeAccordsPrefs(next);
  }

  const [chordFrets, setChordFrets] = useState<number[] | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [playback, setPlayback] = useState<PlaybackProgression | null>(null);

  useEffect(() => {
    setPlayback(loadPlaybackProgression());
  }, []);

  function handleChordTypeChange(next: ChordType) {
    const positions = positionsByType[next] ?? [];
    updatePrefs({
      chordType: next,
      cagedPos: positions.includes(cagedPos)
        ? cagedPos
        : firstAvailablePosition(next, positionsByType),
    });
  }

  function handlePlaybackChord(chord: ChordRecommendation) {
    const nextType = intervalsByType[chord.chord_type]
      ? (chord.chord_type as ChordType)
      : defaultChordType;
    const positions = positionsByType[nextType] ?? [];
    updatePrefs({
      rootPc: chord.root_pc,
      chordType: nextType,
      cagedPos: positions.includes(cagedPos)
        ? cagedPos
        : firstAvailablePosition(nextType, positionsByType),
    });
  }

  function handleExitPlayback() {
    clearPlaybackProgression();
    setPlayback(null);
  }

  function loadPreset(preset: (typeof presets)[number]) {
    const nextType = preset.scaleOrChord as ChordType;
    const savedPos = preset.cagedPos as CagedPosition | null;
    const positions = positionsByType[nextType] ?? [];
    updatePrefs({
      rootPc: preset.rootPc,
      chordType: nextType,
      cagedPos:
        savedPos && positions.includes(savedPos)
          ? savedPos
          : firstAvailablePosition(nextType, positionsByType),
    });
  }

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
      {playback && (
        <ProgressionPlayer
          progression={playback}
          chordLabels={chordLabels}
          intervalsByType={intervalsByType}
          onChordChange={handlePlaybackChord}
          onExit={handleExitPlayback}
        />
      )}
      <div
        className="flex flex-wrap gap-4 py-4 px-4 rounded-lg items-end mb-6"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
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
              border: "1px solid var(--border-strong)",
            }}
            className="rounded-md px-3 py-2 text-sm"
            onChange={(e) =>
              updatePrefs({ rootPc: Number.parseInt(e.target.value, 10) })
            }
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
              border: "1px solid var(--border-strong)",
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
            onChange={(e) => updatePrefs({ useFlats: e.target.checked })}
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
                  border: "1px solid var(--border-strong)",
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
                border: "1px solid var(--border-strong)",
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
        style={{ borderColor: "var(--border)" }}
      >
        {CAGED.map((pos) => {
          const isAvailable = (positionsByType[chordType] ?? []).includes(pos);
          return (
            <button
              key={pos}
              type="button"
              disabled={!isAvailable}
              onClick={() => updatePrefs({ cagedPos: pos })}
              className="flex-1 py-2.5 font-mono font-semibold text-base transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background:
                  pos === cagedPos ? "var(--accent)" : "var(--wood-dark)",
                color: pos === cagedPos ? "#1a1208" : "var(--muted)",
                borderRight: "1px solid var(--border)",
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
              chordLabel={chordLabels[chordType] ?? chordType}
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
                    border: "1px solid var(--border)",
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
                    border: "1px solid var(--border-strong)",
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
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--accent)" }}
        >
          Bibliothèque d&apos;accords
        </h2>
        {libraryGroups.map((group) => (
          <div key={group.title}>
            <h3
              className="text-sm font-semibold mb-2 uppercase tracking-wide"
              style={{ color: "var(--muted)" }}
            >
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChordTypeChange(key as ChordType)}
                  className="rounded-md px-3 py-2 text-sm flex flex-col gap-1 text-left"
                  style={{
                    background:
                      key === chordType ? "var(--accent)" : "var(--wood-dark)",
                    color: key === chordType ? "#1a1208" : "var(--text)",
                    border: "1px solid var(--border-strong)",
                  }}
                >
                  <span className="font-semibold">
                    {chordLabels[key] ?? key}
                  </span>
                  <span className="text-xs opacity-70">
                    {(intervalsByType[key] ?? []).join(", ")} semi-tons
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
