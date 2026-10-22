// Yeni güne geçişte sıfırlanan günlük sayaçlar
import type { BigOne } from '@domain/entities/BigOne';
import type { Budget } from '@domain/entities/Budget';
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { Water } from '@domain/entities/Water';

export const resetWaterForNewDay = (water: Water): Water => ({ ...water, current: 0 });

export const resetBudgetForNewDay = (budget: Budget): Budget => ({ ...budget, expenses: [] });

// Hedef metni korunur, sadece tamamlanma durumu sıfırlanır
export const resetBigOneForNewDay = (bigOne: BigOne): BigOne => ({ ...bigOne, isCompleted: false });

// Çalışan sayaç bozulmaz, sadece günlük seans sayısı sıfırlanır
export const resetPomodoroForNewDay = (pomodoro: Pomodoro): Pomodoro => ({
  ...pomodoro,
  completedSessions: 0,
});
