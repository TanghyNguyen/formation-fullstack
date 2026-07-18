"use client";

import { useEffect, useRef, useState } from "react";
import type { ChordRecommendation } from "@/lib/guitar-api";
import { ensureAudioReady, playChord, playClick } from "@/lib/chord-audio";
import { NOTE_NAMES_SHARP } from "@/lib/notes";
import type { PlaybackProgression } from "@/lib/progression-playback";

type ProgressionPlayerProps = {
  progression: PlaybackProgression;
  chordLabels: Record<string, string>;
  intervalsByType: Record<string, number[]>;
  onChordChange: (chord: ChordRecommendation) => void;
  onExit: () => void;
};

export default function ProgressionPlayer({
  progression,
  chordLabels,
  intervalsByType,
  onChordChange,
  onExit,
}: ProgressionPlayerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [bpmDraft, setBpmDraft] = useState("80");
  const [beatsDraft, setBeatsDraft] = useState("4");
  const [loop, setLoop] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const beatRef = useRef(0);
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const onChordChangeRef = useRef(onChordChange);
  const intervalsRef = useRef(intervalsByType);

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

  function applyChord(nextIndex: number, withSound: boolean) {
    const chord = chords[nextIndex];
    if (!chord) return;
    setIndex(nextIndex);
    indexRef.current = nextIndex;
    onChordChangeRef.current(chord);
    if (withSound) {
      const intervals = intervalsRef.current[chord.chord_type] ?? [0, 4, 7];
      playChord(chord.root_pc, intervals);
    }
  }

  async function handlePlay() {
    const ready = await ensureAudioReady();
    if (!ready) return;
    beatRef.current = 0;
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
    beatRef.current = 0;
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
    beatRef.current = 0;
    applyChord(next, true);
  }

  useEffect(() => {
    if (!playing) return;
    const msPerBeat = (60_000 / bpm) | 0;
    const id = window.setInterval(() => {
      if (!playingRef.current) return;
      beatRef.current += 1;
      if (metronome) {
        playClick();
      }
      if (beatRef.current >= beatsPerChord) {
        beatRef.current = 0;
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
      }
    }, msPerBeat);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer driven by playing/bpm/beats/loop
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
            Lecture — {progression.name}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Accord {index + 1}/{chords.length}
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
          Quitter la lecture
        </button>
      </div>

      <ol className="flex flex-wrap gap-2 list-none mb-4">
        {chords.map((chord, i) => (
          <li key={`${chord.root_pc}-${chord.chord_type}-${i}`}>
            <button
              type="button"
              onClick={() => {
                beatRef.current = 0;
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
          {playing ? "Pause" : "Lecture"}
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
          Précédent
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
          Suivant
        </button>

        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--muted)" }}
        >
          BPM
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
              setBpm(next);
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
          Temps / accord
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
              setBeatsPerChord(next);
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
            onChange={(e) => setLoop(e.target.checked)}
          />
          Boucle
        </label>

        <label
          className="flex flex-row items-center gap-2 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <input
            type="checkbox"
            checked={metronome}
            onChange={(e) => setMetronome(e.target.checked)}
          />
          Métronome
        </label>
      </div>
    </section>
  );
}
