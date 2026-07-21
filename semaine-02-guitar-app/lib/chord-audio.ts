/** A4 = 440 Hz; MIDI note 69. */
function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Root pitch class 0=C … 11=B → MIDI around octave 3–4 (guitar-ish). */
function rootMidi(rootPc: number): number {
  // C3 = 48; keep chords in a comfortable mid range
  return 48 + ((rootPc % 12) + 12) % 12;
}

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedContext) {
    sharedContext = new Ctx();
  }
  return sharedContext;
}

export function chordGainFromVolume(volume0to100: number): number {
  const v = Math.min(100, Math.max(0, volume0to100));
  return (v / 100) * 0.25;
}

export function clickGainFromVolume(volume0to100: number): number {
  const v = Math.min(100, Math.max(0, volume0to100));
  return (v / 100) * 0.12;
}

export async function ensureAudioReady(): Promise<boolean> {
  const ctx = getContext();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === "running";
}

/**
 * Play a chord from root pitch class + semitone intervals (0 = root).
 * Soft triangle tones with a short strum delay.
 */
export function playChord(
  rootPc: number,
  intervals: readonly number[],
  options?: { durationSec?: number; gain?: number },
): void {
  const ctx = getContext();
  if (!ctx || intervals.length === 0) return;

  const duration = options?.durationSec ?? 1.4;
  const baseGain = options?.gain ?? 0.12;
  // exponentialRamp rejects ≤0; volume 0 must be silent without throwing.
  if (baseGain <= 0) return;
  const now = ctx.currentTime;
  const root = rootMidi(rootPc);

  intervals.forEach((interval, index) => {
    const midi = root + interval;
    const freq = midiToFreq(midi);
    const start = now + index * 0.035;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(baseGain, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  });
}

/** Soft metronome click; accent = lower pitch, ×1.5 gain. */
export function playClick(options?: { gain?: number; accent?: boolean }): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const accent = options?.accent === true;
  const base = options?.gain ?? 0.06;
  const level = accent ? base * 1.5 : base;
  const freq = accent ? 660 : 1000;
  if (level <= 0) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(level, 0.0001), now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}
