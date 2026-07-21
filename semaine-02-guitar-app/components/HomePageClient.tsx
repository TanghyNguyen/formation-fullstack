"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  ChordProgression,
  ChordProgressionsResponse,
  ChordRecommendation,
  HarmonizedChord,
  ScaleHarmonizationResponse,
  ScaleInfo,
} from "@/lib/guitar-api";
import {
  fetchChordProgressions,
  fetchScaleHarmonization,
  fetchScaleNotes,
} from "@/lib/guitar-api";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { DegreeStyles } from "@/lib/music-types";
import FretBoard from "@/components/FretBoard";
import HomeSectionNav from "@/components/HomeSectionNav";
import SubmitButton from "@/components/SubmitButton";
import { createPreset, deletePreset } from "@/app/actions/presets";
import {
  CHORD_COUNT_OPTIONS,
  getGammesPrefsSnapshot,
  getServerGammesPrefsSnapshot,
  subscribeGammesPrefs,
  writeGammesPrefs,
} from "@/lib/gammes-prefs";
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
} from "@/lib/locale";
import { savePlaybackProgression } from "@/lib/progression-playback";

type ScalePreset = {
  id: string;
  name: string;
  rootPc: number;
  scaleOrChord: string;
  type: string;
};

type ProgressionPreset = ScalePreset & {
  description: string | null;
  chords: unknown;
};

function parsePresetChords(chords: unknown): ChordRecommendation[] {
  if (!Array.isArray(chords)) return [];
  return chords.filter(
    (chord): chord is ChordRecommendation =>
      !!chord &&
      typeof chord === "object" &&
      typeof (chord as ChordRecommendation).root_pc === "number" &&
      typeof (chord as ChordRecommendation).chord_type === "string",
  );
}

export default function HomePageClient({
  isLoggedIn,
  presets,
  progressionPresets,
  scales,
  degreeStyles,
  chordLabels,
}: {
  isLoggedIn: boolean;
  presets: ScalePreset[];
  progressionPresets: ProgressionPreset[];
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
  const router = useRouter();
  const fallbackScale = scales[0]?.key ?? "major";
  const validScaleKeys = useMemo(
    () => scales.map((scale) => scale.key),
    [scales],
  );
  const prefs = useSyncExternalStore(
    subscribeGammesPrefs,
    () => getGammesPrefsSnapshot(fallbackScale, validScaleKeys),
    () => getServerGammesPrefsSnapshot(fallbackScale),
  );
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );
  const { rootPc, currentScale, useFlats, showDegrees, chordCount } = prefs;

  function setRootPc(next: number) {
    writeGammesPrefs({ ...prefs, rootPc: next });
  }
  function setCurrentScale(next: string) {
    writeGammesPrefs({ ...prefs, currentScale: next });
  }
  function setUseFlats(next: boolean) {
    writeGammesPrefs({ ...prefs, useFlats: next });
  }
  function setShowDegrees(next: boolean) {
    writeGammesPrefs({ ...prefs, showDegrees: next });
  }
  function setChordCount(next: number) {
    writeGammesPrefs({ ...prefs, chordCount: next });
  }

  const [highlightSet, setHighlightSet] = useState<Set<number>>(new Set());
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
  const [refreshToken, setRefreshToken] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [harmonization, setHarmonization] =
    useState<ScaleHarmonizationResponse | null>(null);
  const [harmonizationError, setHarmonizationError] = useState<string | null>(
    null,
  );
  const progressionsKey = `${currentScale}-${rootPc}-${chordCount}`;
  const isInitialLoad =
    progressionsLoadedKey !== progressionsKey && !isRefreshing;
  const progressionsBusy = isInitialLoad || isRefreshing;
  const latestProgressionsKey = useRef(progressionsKey);
  const forceRefreshRef = useRef(false);

  useEffect(() => {
    latestProgressionsKey.current = progressionsKey;
  }, [progressionsKey]);

  useEffect(() => {
    let cancelled = false;

    fetchScaleHarmonization(currentScale, rootPc)
      .then((data) => {
        if (!cancelled) {
          setHarmonization(data);
          setHarmonizationError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHarmonization(null);
          setHarmonizationError(
            "Impossible de charger l’harmonisation diatonique.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentScale, rootPc]);

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
    const keyAtRequest = progressionsKey;
    const forceRefresh = forceRefreshRef.current;
    forceRefreshRef.current = false;

    // Skip auto-fetch when a saved progression was just restored for this key
    if (!forceRefresh && progressionsLoadedKey === keyAtRequest) {
      return;
    }

    fetchChordProgressions(currentScale, rootPc, {
      forceRefresh,
      chordCount,
    })
      .then((data: ChordProgressionsResponse) => {
        if (cancelled) return;
        // Ignore les réponses obsolètes (changement rapide de fondamentale/gamme)
        if (latestProgressionsKey.current !== keyAtRequest) return;
        if (
          `${data.scale_key}-${data.root_pc}-${chordCount}` !== keyAtRequest
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
        if (latestProgressionsKey.current !== keyAtRequest) return;
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
      })
      .finally(() => {
        if (!cancelled && latestProgressionsKey.current === keyAtRequest) {
          setIsRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentScale,
    rootPc,
    chordCount,
    progressionsKey,
    progressionsLoadedKey,
    refreshToken,
  ]);

  function handleRefreshProgressions() {
    if (progressionsBusy) return;
    forceRefreshRef.current = true;
    setIsRefreshing(true);
    setRefreshToken((token) => token + 1);
  }

  function loadProgressionPreset(preset: ProgressionPreset) {
    const chords = parsePresetChords(preset.chords);
    writeGammesPrefs({
      ...prefs,
      rootPc: preset.rootPc,
      currentScale: preset.scaleOrChord,
    });
    const key = `${preset.scaleOrChord}-${preset.rootPc}-${prefs.chordCount}`;
    setProgressions([
      {
        name: preset.name,
        description: preset.description ?? "",
        chords,
      },
    ]);
    setProgressionsLoadedKey(key);
    setProgressionsNotice(null);
    setProgressionsError(null);
    setIsRefreshing(false);
  }

  function startPlayback(name: string, chords: ChordRecommendation[]) {
    if (chords.length === 0) return;
    savePlaybackProgression({ name, chords });
    router.push("/chords");
  }

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
              border: "1px solid var(--border-strong)",
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
              border: "1px solid var(--border-strong)",
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
                  border: "1px solid var(--border-strong)",
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
      <div id="fretboard">
        <FretBoard
          highlightSet={highlightSet}
          rootPc={rootPc}
          useFlats={useFlats}
          onCellClick={(pc) => setRootPc(pc)}
          showDegrees={showDegrees}
          scaleIntervals={scaleIntervals[currentScale] ?? []}
          degreeStyles={degreeStyles}
        />
      </div>
      <HomeSectionNav
        locale={locale}
        showMyProgressions={isLoggedIn && progressionPresets.length > 0}
        showMyPresets={isLoggedIn && presets.length > 0}
      />
      <section
        id="harmonization"
        className="mt-8 rounded-lg py-4 px-4"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: "var(--accent)" }}
        >
          Harmonisation
          {harmonization?.mode === "adapted"
            ? " adaptée"
            : " diatonique"}
        </h2>
        <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
          {harmonization?.mode === "adapted"
            ? "Gamme à moins de 7 notes : accords et progressions adaptés automatiquement."
            : "Règles théoriques (empilement de tierces) — distinct des suggestions IA ci-dessous."}
        </p>
        {harmonizationError && (
          <p className="text-sm" style={{ color: "var(--root)" }}>
            {harmonizationError}
          </p>
        )}
        {harmonization && (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              {harmonization.explanation}
            </p>
            {harmonization.available && harmonization.chords.length > 0 && (
              <>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  {harmonization.mode === "adapted"
                    ? "Accords compatibles"
                    : "Les 7 accords diatoniques"}
                </h3>
                <ul className="flex flex-col gap-2 mb-6 list-none">
                  {harmonization.chords.map((chord: HarmonizedChord) => (
                    <li key={chord.degree}>
                      <Link
                        href={`/chords?root_pc=${chord.root_pc}&chord_type=${encodeURIComponent(chord.chord_type)}`}
                        className="block rounded-md px-3 py-2 transition-opacity hover:opacity-90"
                        style={{
                          background: "var(--wood-dark)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                        title="Voir cet accord sur le manche CAGED"
                      >
                        <span className="font-semibold">
                          {chord.roman} — {NOTE_NAMES_SHARP[chord.root_pc]}{" "}
                          {chordLabels[chord.chord_type] ?? chord.quality_label}
                        </span>
                        <span
                          className="block text-sm mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {chord.explanation}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Progressions courantes
                </h3>
                <div className="flex flex-col gap-3">
                  {harmonization.progressions.map((progression) => (
                    <article key={progression.name}>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        {progression.name}
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--muted)" }}
                      >
                        {progression.description}
                      </p>
                      <ol className="flex flex-wrap gap-2 list-none mb-2">
                        {progression.chords.map((chord, index) => (
                          <li key={`${progression.name}-${index}`}>
                            <Link
                              href={`/chords?root_pc=${chord.root_pc}&chord_type=${encodeURIComponent(chord.chord_type)}`}
                              className="text-sm px-3 py-2 rounded-md inline-block transition-opacity hover:opacity-90"
                              style={{
                                background: "var(--wood-dark)",
                                border: "1px solid var(--border)",
                                color: "var(--text)",
                              }}
                              title="Voir cet accord sur le manche CAGED"
                            >
                              {NOTE_NAMES_SHARP[chord.root_pc]}{" "}
                              {chordLabels[chord.chord_type] ??
                                chord.chord_type}
                              {chord.roman ? (
                                <span className="opacity-70">
                                  {" "}
                                  ({chord.roman})
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ol>
                      <div className="flex flex-wrap gap-2 items-end mb-2">
                        <button
                          type="button"
                          onClick={() =>
                            startPlayback(
                              progression.name,
                              progression.chords,
                            )
                          }
                          className="text-sm font-semibold px-3 py-2 rounded-md"
                          style={{
                            background: "var(--accent)",
                            color: "#1a1208",
                          }}
                        >
                          Lire
                        </button>
                      </div>
                      {isLoggedIn ? (
                        <form
                          action={createPreset}
                          className="flex flex-wrap gap-2 items-end"
                        >
                          <label
                            className="flex flex-col gap-1 text-sm"
                            style={{ color: "var(--muted)" }}
                          >
                            Nom de la progression
                            <input
                              name="name"
                              required
                              defaultValue={progression.name}
                              placeholder="Ex: I–V–vi–IV"
                              className="rounded-md px-3 py-2 text-sm"
                              style={{
                                background: "var(--wood-dark)",
                                color: "var(--text)",
                                border: "1px solid var(--border-strong)",
                              }}
                            />
                          </label>
                          <input type="hidden" name="rootPc" value={rootPc} />
                          <input
                            type="hidden"
                            name="scaleOrChord"
                            value={currentScale}
                          />
                          <input type="hidden" name="type" value="progression" />
                          <input
                            type="hidden"
                            name="description"
                            value={progression.description}
                          />
                          <input
                            type="hidden"
                            name="chords"
                            value={JSON.stringify(progression.chords)}
                          />
                          <SubmitButton
                            className="text-sm font-semibold px-3 py-2 rounded-md"
                            style={{
                              color: "var(--accent)",
                              border: "1px solid var(--border-strong)",
                            }}
                          >
                            Enregistrer
                          </SubmitButton>
                        </form>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          Connecte-toi pour enregistrer cette progression.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
      <section
        id="ai-progressions"
        className="mt-8 rounded-lg py-4 px-4"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3 mb-1">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--accent)" }}
          >
            Progressions d&apos;accords (IA)
          </h2>
          <div className="flex flex-wrap items-end gap-2">
            <label
              className="flex flex-col gap-1 text-sm"
              style={{ color: "var(--muted)" }}
            >
              Accords
              <select
                value={chordCount}
                disabled={progressionsBusy}
                onChange={(e) =>
                  setChordCount(parseInt(e.target.value, 10))
                }
                className="rounded-md px-3 py-1.5 text-sm"
                style={{
                  background: "var(--wood-dark)",
                  color: "var(--text)",
                  border: "1px solid var(--border-strong)",
                  opacity: progressionsBusy ? 0.5 : 1,
                }}
              >
                {CHORD_COUNT_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleRefreshProgressions}
              disabled={progressionsBusy}
              className="text-sm font-semibold px-3 py-1.5 rounded-md shrink-0"
              style={{
                color: "var(--accent)",
                border: "1px solid var(--border-strong)",
                opacity: progressionsBusy ? 0.5 : 1,
                cursor: progressionsBusy ? "wait" : "pointer",
              }}
            >
              {isRefreshing ? "Rafraîchissement…" : "Rafraîchir"}
            </button>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Suggestions créatives (IA) pour{" "}
          <strong style={{ color: "var(--text)" }}>
            {NOTE_NAMES_SHARP[rootPc]} {scaleLabels[currentScale] ?? currentScale}
          </strong>
          — {chordCount} accords par progression, en complément de
          l’harmonisation ci-dessus.
        </p>
        {progressionsBusy && (
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
            {isRefreshing
              ? "Nouvelles progressions en cours…"
              : "Génération en cours…"}
          </p>
        )}
        {progressionsNotice && !isRefreshing && (
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
            {progressionsNotice}
          </p>
        )}
        {progressionsError && (
          <p className="text-sm" style={{ color: "var(--root)" }}>
            {progressionsError}
          </p>
        )}
        {!isInitialLoad &&
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
              <ol className="flex flex-wrap gap-2 list-none mb-3">
                {progression.chords.map((chord, index) => (
                  <li key={`${progression.name}-${index}`}>
                    <Link
                      href={`/chords?root_pc=${chord.root_pc}&chord_type=${encodeURIComponent(chord.chord_type)}`}
                      className="text-sm px-3 py-2 rounded-md inline-block transition-opacity hover:opacity-90"
                      style={{
                        background: "var(--wood-dark)",
                        border: "1px solid var(--border)",
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
              <div className="flex flex-wrap gap-2 items-end mb-2">
                <button
                  type="button"
                  onClick={() =>
                    startPlayback(progression.name, progression.chords)
                  }
                  className="text-sm font-semibold px-3 py-2 rounded-md"
                  style={{
                    background: "var(--accent)",
                    color: "#1a1208",
                  }}
                >
                  Lire
                </button>
              </div>
              {isLoggedIn ? (
                <form
                  action={createPreset}
                  className="flex flex-wrap gap-2 items-end"
                >
                  <label
                    className="flex flex-col gap-1 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    Nom de la progression
                    <input
                      name="name"
                      required
                      placeholder="Ex: Pop en Do"
                      className="rounded-md px-3 py-2 text-sm"
                      style={{
                        background: "var(--wood-dark)",
                        color: "var(--text)",
                        border: "1px solid var(--border-strong)",
                      }}
                    />
                  </label>
                  <input type="hidden" name="rootPc" value={rootPc} />
                  <input
                    type="hidden"
                    name="scaleOrChord"
                    value={currentScale}
                  />
                  <input type="hidden" name="type" value="progression" />
                  <input
                    type="hidden"
                    name="description"
                    value={progression.description}
                  />
                  <input
                    type="hidden"
                    name="chords"
                    value={JSON.stringify(progression.chords)}
                  />
                  <SubmitButton
                    className="text-sm font-semibold px-3 py-2 rounded-md"
                    style={{
                      color: "var(--accent)",
                      border: "1px solid var(--border-strong)",
                    }}
                  >
                    Enregistrer
                  </SubmitButton>
                </form>
              ) : (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Connecte-toi pour enregistrer cette progression.
                </p>
              )}
            </article>
          ))}
      </section>
      {isLoggedIn && progressionPresets.length > 0 && (
        <section id="my-progressions" className="mt-8">
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Mes progressions
          </h2>
          <ul className="flex flex-col gap-2">
            {progressionPresets.map((preset) => {
              const chords = parsePresetChords(preset.chords);
              return (
                <li key={preset.id} className="flex gap-2 items-stretch">
                  <button
                    type="button"
                    onClick={() => loadProgressionPreset(preset)}
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
                    {scaleLabels[preset.scaleOrChord] ?? preset.scaleOrChord}
                    {chords.length > 0 && (
                      <span
                        className="block mt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {chords
                          .map(
                            (chord) =>
                              `${NOTE_NAMES_SHARP[chord.root_pc]} ${chordLabels[chord.chord_type] ?? chord.chord_type}`,
                          )
                          .join(" → ")}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={chords.length === 0}
                    onClick={() => startPlayback(preset.name, chords)}
                    className="shrink-0 text-sm font-semibold px-3 py-2 rounded-md"
                    style={{
                      background: "var(--accent)",
                      color: "#1a1208",
                      opacity: chords.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Lire
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
              );
            })}
          </ul>
        </section>
      )}
      {isLoggedIn && presets.length > 0 && (
        <section id="my-presets" className="mt-8">
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
                    writeGammesPrefs({
                      ...prefs,
                      rootPc: preset.rootPc,
                      currentScale: preset.scaleOrChord,
                    });
                  }}
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
    </main>
  );
}
