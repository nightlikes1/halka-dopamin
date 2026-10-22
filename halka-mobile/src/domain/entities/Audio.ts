// Ses efektleri ve ortam sesleri

export type SoundEffect =
  'click' | 'waterDrop' | 'chime' | 'success' | 'delete' | 'chainPulse' | 'focusZoom' | 'focusExit';

export const AMBIENT_TYPES = ['rain', 'focus', 'drone'] as const;
export type AmbientType = (typeof AMBIENT_TYPES)[number];

export interface AmbientOption {
  readonly id: AmbientType;
  readonly icon: string;
  readonly label: string;
  readonly longLabel: string;
}

export const AMBIENT_OPTIONS: readonly AmbientOption[] = [
  { id: 'rain', icon: '🌧️', label: 'Yağmur', longLabel: 'Yağmur Sesi' },
  { id: 'focus', icon: '🧠', label: 'Pembe Gürültü', longLabel: 'Pembe Gürültü' },
  { id: 'drone', icon: '🌌', label: 'Derin Uzay', longLabel: 'Derin Uzay' },
];
