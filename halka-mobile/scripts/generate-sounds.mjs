// Web sürümündeki (src/js/audio.js) Web Audio sentezini çevrimdışı taklit ederek
// assets/sounds altına WAV dosyaları üretir. Bağımlılık gerektirmez.
// Kullanım: npm run generate:sounds
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
const EFFECT_RATE = 44100;
const AMBIENT_RATE = 22050;
// Web'deki kazançlar telefon hoparlörü için çok düşük; oranlar korunarak yükseltilir
const EFFECT_BOOST = 4;
const AMBIENT_SECONDS = 10;
const LOOP_CROSSFADE_SECONDS = 0.5;
const AMBIENT_TARGET_RMS = 0.08;

// --- Otomasyon eğrileri (AudioParam benzeri) ---
// points: [{ t, v, type: 'set' | 'exp' | 'linear' }]
function automation(points) {
  return (t) => {
    let value = points[0].v;
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (t < p.t) {
        const prev = points[i - 1];
        if (!prev || p.type === 'set') return value;
        const ratio = (t - prev.t) / (p.t - prev.t);
        if (p.type === 'exp') return prev.v * Math.pow(p.v / prev.v, ratio);
        return prev.v + (p.v - prev.v) * ratio;
      }
      value = p.v;
    }
    return value;
  };
}

// --- Osilatör dalga biçimleri ---
const waves = {
  sine: (phase) => Math.sin(2 * Math.PI * phase),
  triangle: (phase) => 1 - 4 * Math.abs(Math.round(phase - 0.25) - (phase - 0.25)),
  sawtooth: (phase) => 2 * (phase - Math.floor(phase + 0.5)),
};

// Tek bir osilatör + kazanç zarfını tampona ekler
function renderVoice(buffer, rate, { start, duration, type, freq, gain }) {
  let phase = 0;
  const startIndex = Math.floor(start * rate);
  const length = Math.floor(duration * rate);
  for (let i = 0; i < length && startIndex + i < buffer.length; i += 1) {
    const t = i / rate;
    phase += freq(t) / rate;
    phase -= Math.floor(phase);
    buffer[startIndex + i] += waves[type](phase) * gain(t);
  }
}

function effect(totalSeconds, voices) {
  const buffer = new Float32Array(Math.ceil(totalSeconds * EFFECT_RATE));
  voices.forEach((voice) => renderVoice(buffer, EFFECT_RATE, voice));
  // Sonda tık sesini önlemek için kısa sönümleme
  const fade = Math.floor(0.004 * EFFECT_RATE);
  for (let i = 0; i < fade; i += 1) buffer[buffer.length - 1 - i] *= i / fade;
  for (let i = 0; i < buffer.length; i += 1) buffer[i] *= EFFECT_BOOST;
  return { rate: EFFECT_RATE, samples: buffer };
}

const expGain = (from, to, duration) =>
  automation([
    { t: 0, v: from, type: 'set' },
    { t: duration, v: to, type: 'exp' },
  ]);
const expFreq = (from, to, duration) =>
  automation([
    { t: 0, v: from, type: 'set' },
    { t: duration, v: to, type: 'exp' },
  ]);
const constant = (v) => () => v;

const EFFECTS = {
  click: () =>
    effect(0.04, [
      { start: 0, duration: 0.04, type: 'sine', freq: expFreq(800, 300, 0.04), gain: expGain(0.08, 0.001, 0.04) },
    ]),
  waterDrop: () =>
    effect(0.12, [
      { start: 0, duration: 0.12, type: 'sine', freq: expFreq(450, 950, 0.08), gain: expGain(0.15, 0.001, 0.12) },
    ]),
  chime: () =>
    effect(
      0.84,
      [523.25, 659.25, 783.99, 1046.5].map((f, idx) => ({
        start: idx * 0.08,
        duration: 0.6,
        type: 'triangle',
        freq: constant(f),
        gain: expGain(0.12, 0.0001, 0.6),
      })),
    ),
  success: () =>
    effect(
      0.58,
      [440, 554.37, 659.25, 880].map((f, idx) => ({
        start: idx * 0.06,
        duration: 0.4,
        type: 'sine',
        freq: constant(f),
        gain: expGain(0.1, 0.001, 0.4),
      })),
    ),
  delete: () =>
    effect(0.15, [
      { start: 0, duration: 0.15, type: 'sawtooth', freq: expFreq(320, 110, 0.15), gain: expGain(0.08, 0.001, 0.15) },
    ]),
  chainPulse: () =>
    effect(0.25, [
      { start: 0, duration: 0.25, type: 'sine', freq: constant(1200), gain: expGain(0.05, 0.001, 0.25) },
      { start: 0, duration: 0.25, type: 'triangle', freq: constant(1207), gain: expGain(0.05, 0.001, 0.25) },
    ]),
  focusZoom: () =>
    effect(0.38, [
      {
        start: 0,
        duration: 0.38,
        type: 'sine',
        freq: expFreq(220, 880, 0.35),
        gain: automation([
          { t: 0, v: 0.02, type: 'set' },
          { t: 0.15, v: 0.12, type: 'linear' },
          { t: 0.38, v: 0.001, type: 'exp' },
        ]),
      },
    ]),
  focusExit: () =>
    effect(0.25, [
      { start: 0, duration: 0.25, type: 'sine', freq: expFreq(680, 260, 0.25), gain: expGain(0.08, 0.001, 0.25) },
    ]),
};

// --- Ortam sesleri: gürültü + biquad filtre + kesintisiz döngü ---
function biquad(type, freq, q, rate) {
  const w0 = (2 * Math.PI * freq) / rate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos = Math.cos(w0);
  let b0, b1, b2;
  if (type === 'lowpass') {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else {
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  }
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

function noiseGenerator(type) {
  if (type === 'rain') {
    let b0 = 0, b1 = 0, b2 = 0;
    return () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      return (b0 + b1 + b2) * 0.15;
    };
  }
  if (type === 'focus') {
    let lastOut = 0;
    return () => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      return lastOut * 1.2;
    };
  }
  return () => (Math.random() * 2 - 1) * 0.05;
}

function ambient(type) {
  const rate = AMBIENT_RATE;
  const total = Math.floor((AMBIENT_SECONDS + LOOP_CROSSFADE_SECONDS) * rate);
  const next = noiseGenerator(type);
  const filter = type === 'rain' ? biquad('lowpass', 800, 0.707, rate) : biquad('bandpass', 400, 1, rate);
  const raw = new Float32Array(total);
  // Filtre ısınması için ilk saniyeyi at
  for (let i = 0; i < rate; i += 1) filter(next());
  for (let i = 0; i < total; i += 1) raw[i] = filter(next());

  // Son kısmı başa harmanlayarak kesintisiz döngü oluştur
  const length = Math.floor(AMBIENT_SECONDS * rate);
  const fade = Math.floor(LOOP_CROSSFADE_SECONDS * rate);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) out[i] = raw[i];
  for (let i = 0; i < fade; i += 1) {
    const mix = i / fade;
    out[i] = raw[i] * mix + raw[length + i] * (1 - mix);
  }

  // Ses seviyesini hedef RMS'e normalize et
  let sum = 0;
  for (let i = 0; i < length; i += 1) sum += out[i] * out[i];
  const rms = Math.sqrt(sum / length) || 1;
  const gain = AMBIENT_TARGET_RMS / rms;
  for (let i = 0; i < length; i += 1) out[i] = Math.max(-0.95, Math.min(0.95, out[i] * gain));
  return { rate, samples: out };
}

// --- 16-bit PCM mono WAV yazıcı ---
function toWav({ rate, samples }) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, render] of Object.entries(EFFECTS)) {
  writeFileSync(join(OUT_DIR, `${name}.wav`), toWav(render()));
  console.log(`✓ ${name}.wav`);
}
for (const type of ['rain', 'focus', 'drone']) {
  writeFileSync(join(OUT_DIR, `ambient-${type}.wav`), toWav(ambient(type)));
  console.log(`✓ ambient-${type}.wav`);
}
