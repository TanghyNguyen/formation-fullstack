"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChordRecommendation } from "@/lib/guitar-api";
import {
  chordGainFromVolume,
  clickGainFromVolume,
  ensureAudioReady,
  playChord,
  playClick,
} from "@/lib/chord-audio";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { PlaybackProgression } from "@/lib/progression-playback";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import {
  getLocaleSnapshot,
  subscribeLocale,
} from "@/lib/locale";
import {
  getPlaybackPrefsSnapshot,
  getServerPlaybackPrefsSnapshot,
  subscribePlaybackPrefs,
  writePlaybackPrefs,
} from "@/lib/playback-prefs";

type ProgressionPlayerProps = {
  progression: PlaybackProgression;
  chordLabels: Record<string, string>;
  intervalsByType: Record<string, number[]>;
  onChordChange: (chord: ChordRecommendation) => void;
  onExit: () => void;
  locale?: Locale;
};

export default function ProgressionPlayer({
  progression,
  chordLabels,
  intervalsByType,
  onChordChange,
  onExit,
  locale: localeProp,
}: ProgressionPlayerProps) {
  const liveLocale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => localeProp ?? "fr",
  );
  const locale = liveLocale || localeProp || "fr";
  const prefs = useSyncExternalStore(
    subscribePlaybackPrefs,
    getPlaybackPrefsSnapshot,
    getServerPlaybackPrefsSnapshot,
  );
  const {
    bpm,
    beatsPerChord,
    loop,
    metronome,
    chordVolume,
    clickVolume,
  } = prefs;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(1); // 1-based for display
  const [bpmDraft, setBpmDraft] = useState(() =>
    String(getServerPlaybackPrefsSnapshot().bpm),
  );
  const [beatsDraft, setBeatsDraft] = useState(() =>
    String(getServerPlaybackPrefsSnapshot().beatsPerChord),
  );
  // 1-based: chord attack = beat 1 (accented); interval advances 2..N only.
  const beatRef = useRef(1);
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const prefsRef = useRef(prefs);
  const onChordChangeRef = useRef(onChordChange);
  const intervalsRef = useRef(intervalsByType);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    setBpmDraft(String(bpm));
  }, [bpm]);

  useEffect(() => {
    setBeatsDraft(String(beatsPerChord));
  }, [beatsPerChord]);

  // If beats/chord shrinks mid-play, clamp display + ref so counter stays valid.
  useEffect(() => {
    if (beatRef.current > beatsPerChord) {
      beatRef.current = beatsPerChord;
      setBeat(beatsPerChord);
    }
  }, [beatsPerChord]);

  useEffect(() => {
    onChordChangeRef.current = onChordChange;
  }, [onChordChange]);

  useEffect(() => {
    intervalsRef.current = intervalsByType;
  }, [intervalsByType]);

  const chords = progression.chords;
  const current = chords[index] ?? chords[0];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Chord attack plays accented beat 1 with the chord; interval only fires weak beats 2..N (no double-accent on 1).
  function applyChord(nextIndex: number, withSound: boolean) {
    const chord = chords[nextIndex];
    if (!chord) return;
    setIndex(nextIndex);
    indexRef.current = nextIndex;
    beatRef.current = 1;
    setBeat(1);
    onChordChangeRef.current(chord);
    if (withSound) {
      const intervals = intervalsRef.current[chord.chord_type] ?? [0, 4, 7];
      const currentPrefs = prefsRef.current;
      playChord(chord.root_pc, intervals, {
        gain: chordGainFromVolume(currentPrefs.chordVolume),
      });
      if (currentPrefs.metronome) {
        playClick({
          gain: clickGainFromVolume(currentPrefs.clickVolume),
          accent: true,
        });
      }
    }
  }

  async function handlePlay() {
    const ready = await ensureAudioReady();
    if (!ready) return;
    setPlaying(true);
    playingRef.current = true;
    applyChord(indexRef.current, true);
  }

  function handlePause() {
    setPlaying(false);
    playingRef.current = false;
  }

  function handlePrev() {
    const next = Math.max(0, indexRef.current - 1);
    applyChord(next, true);
  }

  function handleNext() {
    let next = indexRef.current + 1;
    if (next >= chords.length) {
      if (loop) next = 0;
      else {
        handlePause();
        return;
      }
    }
    applyChord(next, true);
  }

  useEffect(() => {
    if (!playing) return;
    const msPerBeat = (60_000 / bpm) | 0;
    const id = window.setInterval(() => {
      if (!playingRef.current) return;
      beatRef.current += 1;
      if (beatRef.current > beatsPerChord) {
        let next = indexRef.current + 1;
        if (next >= chords.length) {
          if (loop) {
            next = 0;
          } else {
            setPlaying(false);
            playingRef.current = false;
            return;
          }
        }
        applyChord(next, true);
        return;
      }
      const currentPrefs = prefsRef.current;
      if (currentPrefs.metronome) {
        playClick({
          gain: clickGainFromVolume(currentPrefs.clickVolume),
          accent: false,
        });
      }
      setBeat(beatRef.current);
    }, msPerBeat);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer driven by playing/bpm/beats/loop; volumes via prefsRef
  }, [playing, bpm, beatsPerChord, loop, metronome, chords.length]);

  // Sync first chord to Accords view when player mounts
  useEffect(() => {
    if (current) {
      onChordChange(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="mb-6 rounded-lg py-4 px-4"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--accent)" }}
          >
            {t(locale, "player.title", { name: progression.name })}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {t(locale, "player.chordOf", {
              current: index + 1,
              total: chords.length,
            })}
            {current ? (
              <>
                {" "}
                ·{" "}
                <strong style={{ color: "var(--text)" }}>
                  {NOTE_NAMES_SHARP[current.root_pc]}{" "}
                  {chordLabels[current.chord_type] ?? current.chord_type}
                </strong>
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold px-3 py-1.5 rounded-md"
          style={{
            color: "var(--muted)",
            border: "1px solid var(--border-strong)",
          }}
        >
          {t(locale, "player.exit")}
        </button>
      </div>

      <ol className="flex flex-wrap gap-2 list-none mb-4">
        {chords.map((chord, i) => (
          <li key={`${chord.root_pc}-${chord.chord_type}-${i}`}>
            <button
              type="button"
              onClick={() => {
                applyChord(i, true);
              }}
              className="text-sm px-3 py-1.5 rounded-md"
              style={{
                background:
                  i === index ? "var(--accent)" : "var(--wood-dark)",
                color: i === index ? "#1a1208" : "var(--text)",
                border: "1px solid var(--border)",
                fontWeight: i === index ? 700 : 500,
              }}
            >
              {NOTE_NAMES_SHARP[chord.root_pc]}{" "}
              {chordLabels[chord.chord_type] ?? chord.chord_type}
            </button>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={() => (playing ? handlePause() : void handlePlay())}
          className="text-sm font-semibold px-4 py-2 rounded-md"
          style={{
            background: "var(--accent)",
            color: "#1a1208",
          }}
        >
          {playing ? t(locale, "player.pause") : t(locale, "player.play")}
        </button>
        <button
          type="button"
          onClick={handlePrev}
          className="text-sm font-semibold px-3 py-2 rounded-md"
          style={{
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
          }}
        >
          {t(locale, "player.prev")}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-sm font-semibold px-3 py-2 rounded-md"
          style={{
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
          }}
        >
          {t(locale, "player.next")}
        </button>

        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          {t(locale, "player.bpm")}
          <input
            type="number"
            min={40}
            max={200}
            value={bpmDraft}
            onChange={(e) => setBpmDraft(e.target.value)}
            onBlur={() => {
              const next = Math.min(
                200,
                Math.max(40, Number.parseInt(bpmDraft, 10) || 80),
              );
              writePlaybackPrefs({ ...prefs, bpm: next });
              setBpmDraft(String(next));
            }}
            className="rounded-md px-3 py-2 text-sm w-20"
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
            }}
          />
        </label>

        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          {t(locale, "player.beats")}
          <input
            type="number"
            min={1}
            max={16}
            value={beatsDraft}
            onChange={(e) => setBeatsDraft(e.target.value)}
            onBlur={() => {
              const next = Math.min(
                16,
                Math.max(1, Number.parseInt(beatsDraft, 10) || 4),
              );
              writePlaybackPrefs({ ...prefs, beatsPerChord: next });
              setBeatsDraft(String(next));
            }}
            className="rounded-md px-3 py-2 text-sm w-20"
            style={{
              background: "var(--wood-dark)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
            }}
          />
        </label>

        <label
          className="flex flex-row items-center gap-2 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) =>
              writePlaybackPrefs({ ...prefs, loop: e.target.checked })
            }
          />
          {t(locale, "player.loop")}
        </label>

        <label
          className="flex flex-row items-center gap-2 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <input
            type="checkbox"
            checked={metronome}
            onChange={(e) =>
              writePlaybackPrefs({ ...prefs, metronome: e.target.checked })
            }
          />
          {t(locale, "player.metronome")}
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label
          className="flex flex-col gap-1 text-sm min-w-[10rem]"
          style={{ color: "var(--muted)" }}
        >
          {t(locale, "player.chordVolume")}
          <input
            type="range"
            min={0}
            max={100}
            value={chordVolume}
            onChange={(e) =>
              writePlaybackPrefs({
                ...prefs,
                chordVolume: Number.parseInt(e.target.value, 10),
              })
            }
          />
        </label>

        <label
          className="flex flex-col gap-1 text-sm min-w-[10rem]"
          style={{ color: "var(--muted)" }}
        >
          {t(locale, "player.clickVolume")}
          <input
            type="range"
            min={0}
            max={100}
            value={clickVolume}
            onChange={(e) =>
              writePlaybackPrefs({
                ...prefs,
                clickVolume: Number.parseInt(e.target.value, 10),
              })
            }
          />
        </label>
      </div>

      {playing ? (
        <div
          className="flex gap-2 mt-3"
          aria-label={t(locale, "player.beatCounter")}
        >
          {Array.from({ length: beatsPerChord }, (_, i) => {
            const n = i + 1;
            const active = beat === n;
            return (
              <span
                key={n}
                className="text-sm font-semibold min-w-6 text-center"
                style={{
                  color: active ? "var(--accent)" : "var(--muted)",
                  opacity: active ? 1 : 0.55,
                }}
              >
                {n}
              </span>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
