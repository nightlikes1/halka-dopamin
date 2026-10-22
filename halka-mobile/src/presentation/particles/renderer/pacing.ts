// Kare temposu: yüksek tazeleme hızlı ekranlarda (90/120/144 Hz) simülasyon ve çizim en fazla ~60 fps.
// Fazla kareler atlanır; birikmiş süre korunduğu için 90 Hz'de 3 karenin 2'si çizilir (düzgün 60 fps).
// Saf worklet: mobilde UI thread'de, web'de requestAnimationFrame içinde çalışır.

export const TARGET_FRAME = 1 / 60;
// Bir karenin çizilmesi için biriken sürenin hedefin en az bu oranı olması gerekir
const TOLERANCE = 0.7;

// Tempo durumu: [biriken süre, son çizimden beri geçen süre]
export const PACE_SIZE = 2;

export function createPace(): number[] {
  return [0, 0];
}

// Bu karede çizilecekse son çizimden beri geçen süreyi (sn), atlanacaksa 0 döndürür
export function paceFrame(pace: number[], elapsed: number): number {
  'worklet';
  const accumulated = (pace[0] ?? 0) + elapsed;
  const since = (pace[1] ?? 0) + elapsed;
  if (accumulated < TARGET_FRAME * TOLERANCE) {
    pace[0] = accumulated;
    pace[1] = since;
    return 0;
  }
  // Fazlası bir sonraki kareye taşınır (en fazla bir kare kadar)
  pace[0] = Math.min(TARGET_FRAME, Math.max(0, accumulated - TARGET_FRAME));
  pace[1] = 0;
  return since;
}
