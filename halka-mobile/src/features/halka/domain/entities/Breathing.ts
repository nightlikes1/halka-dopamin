// Kutu nefesi (4-4-4-4) fazları

export type BreathingPhaseId = 'inhale' | 'hold' | 'exhale' | 'rest';

export interface BreathingPhase {
  readonly id: BreathingPhaseId;
  readonly label: string;
  readonly durationMs: number;
}

export const BREATHING_PHASE_MS = 4000;

export const BREATHING_PHASES: readonly BreathingPhase[] = [
  { id: 'inhale', label: 'Nefes Al (4s)', durationMs: BREATHING_PHASE_MS },
  { id: 'hold', label: 'Tut (4s)', durationMs: BREATHING_PHASE_MS },
  { id: 'exhale', label: 'Nefes Ver (4s)', durationMs: BREATHING_PHASE_MS },
  { id: 'rest', label: 'Dinlen (4s)', durationMs: BREATHING_PHASE_MS },
];

export const BREATHING_IDLE_LABEL = 'Hazır';
export const BREATHING_GUIDE_TEXT = '4s Nefes Al • 4s Tut • 4s Ver • 4s Dinlen';
