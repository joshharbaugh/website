// Web Audio API sound cues for the fishing game.
// AudioContext is lazy-initialized — call initAudio() on the first user gesture
// (click or keydown) to satisfy browser autoplay policy. Subsequent sounds
// triggered from the RAF loop will work because the context is already running.

let ctx: AudioContext | null = null;

export function initAudio(): void {
  if (typeof window === "undefined") return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  return ctx;
}

function osc(
  frequency: number,
  endFrequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay: number
): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const oscillator = c.createOscillator();
  const gain = c.createGain();
  oscillator.connect(gain);
  gain.connect(c.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, t);
  if (endFrequency !== frequency)
    oscillator.frequency.linearRampToValueAtTime(endFrequency, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  oscillator.start(t);
  oscillator.stop(t + duration + 0.01);
}

function filteredNoise(
  duration: number,
  cutoff: number,
  volume: number,
  delay: number
): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const samples = Math.ceil(c.sampleRate * duration);
  const buf = c.createBuffer(1, samples, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = cutoff;
  filter.Q.value = 1.5;
  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t);
  src.stop(t + duration + 0.01);
}

// ─── Cues ─────────────────────────────────────────────────────────────────────

// Bobber hits the water — noise burst + descending plop
export function playSplash(): void {
  filteredNoise(0.18, 700, 0.25, 0);
  osc(200, 80, 0.18, "sine", 0.18, 0);
}

// Fish bites — two urgent ascending beeps
export function playBite(): void {
  osc(650, 650, 0.08, "square", 0.08, 0);
  osc(980, 980, 0.1, "square", 0.08, 0.12);
}

// Successful catch — C major arpeggio (C5 E5 G5 C6)
export function playCatch(): void {
  [523, 659, 784, 1047].forEach((freq, i) =>
    osc(freq, freq, 0.13, "square", 0.11, i * 0.09)
  );
}

// Missed bite — sad descending tone
export function playMiss(): void {
  osc(380, 150, 0.45, "sine", 0.15, 0);
}
