// Merkezdeki günlük özet (Life Briefing)

export interface BriefingMetric {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly pct: number;
}

export interface DailyBriefing {
  readonly greeting: string; // "Günaydın"
  readonly userName: string;
  readonly dateText: string;
  readonly activeCount: number;
  readonly summaryText: string;
  readonly metrics: readonly BriefingMetric[];
}
