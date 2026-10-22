// Animasyon sabitleri: ortak yumuşatma eğrisi ve süreler (ms).
// "Hareketi azalt" açıksa bileşenler animasyonu atlayıp son duruma geçer (useReducedMotion).
import { Easing } from 'react-native-reanimated';

export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1);

export const durations = {
  press: 120,
  colorChange: 250,
  enter: 500,
  ringFill: 1400,
  levelFill: 1600,
  floatUp: 1100,
  tick: 1000,
} as const;

// Ekran açılışında sırayla belirme gecikmeleri
export const staggers = {
  summary: 100,
  list: 200,
  button: 400,
  innerRing: 250,
  waterBar: 500,
  levelPill: 1200,
  xpBar: 300,
  badgeStep: 100,
} as const;

// Basılı butonun küçülme oranı
export const PRESS_SCALE = 0.92;
// Aşağıdan yükselerek belirme mesafesi (px)
export const ENTER_OFFSET = 14;
