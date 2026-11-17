// Gelişim: cihazda tutulan günlük özet (Halka eklentilerinin gün sonu değerleri)
export interface DailyLog {
  readonly date: string; // YYYY-MM-DD
  readonly waterMl: number;
  readonly waterTargetMl: number;
  readonly tasksDone: number;
  readonly tasksTotal: number;
  readonly focusSessions: number;
}

export type DailyLogValues = Omit<DailyLog, 'date'>;

// Günlük özetin saklandığı gün sayısı (sunucu aralığıyla aynı)
export const DAILY_LOG_DAYS = 62;
