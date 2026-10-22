// Su takibi

export interface Water {
  readonly current: number; // ml
  readonly target: number; // ml
}

export interface WaterProgress {
  readonly pct: number;
  readonly remaining: number;
  readonly isGoalReached: boolean;
}

export const WATER_DEFAULT_TARGET = 2500;
export const WATER_QUICK_AMOUNTS = [100, 250, 500] as const;
export const WATER_FOCUSED_AMOUNTS = [100, 250, 500, 750] as const;
export const WATER_MAX_SINGLE_AMOUNT = 2000;

export function getWaterProgress(water: Water): WaterProgress {
  const target = water.target > 0 ? water.target : WATER_DEFAULT_TARGET;
  const pct = Math.min(100, Math.round((water.current / target) * 100));
  return {
    pct,
    remaining: Math.max(0, target - water.current),
    isGoalReached: pct >= 100,
  };
}
