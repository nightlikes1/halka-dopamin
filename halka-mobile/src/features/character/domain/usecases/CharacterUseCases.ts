// Potansiyel Karakterim use case'leri
import { ok, type AsyncResult } from '@core/result/Result';
import { addDays } from '@core/utils/date';
import { todayOf, type Clock } from '@domain/ports/Clock';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import type { Character, CharacterDraft, Trait } from '@features/character/domain/entities';
import type { CharacterRepository } from '@features/character/domain/ports';
import {
  averageOf,
  displayedProximity,
  PROXIMITY_WINDOW_DAYS,
  proximitySeries,
  traitDayStatus,
  traitSeries,
  withKnownHabits,
  type DayValue,
  type TraitDayStatus,
} from '@features/character/domain/proximity';
import { normalizeCharacterDraft } from '@features/character/domain/rules';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';
import type { HabitRepository } from '@features/habits/domain/ports';

// Detay ekranındaki en uzun trend
export const TREND_DAYS = 30;

export interface TraitSummary {
  readonly trait: Trait;
  readonly habits: readonly Habit[];
  readonly weekAverage: number | null; // son 7 gün, 0-100
  readonly today: TraitDayStatus;
  readonly trend: readonly DayValue[]; // son 30 gün
}

export interface CharacterOverview {
  readonly today: string;
  readonly character: Character | null;
  readonly habits: readonly Habit[];
  readonly proximity: number | null; // son 7 gün ortalaması
  readonly week: readonly DayValue[];
  readonly traits: readonly TraitSummary[];
  // Bugünkü alışkanlık cevapları (detay ekranı için)
  readonly todayStatuses: Readonly<Record<string, HabitEntryStatus>>;
}

export class GetCharacterOverviewUseCase {
  constructor(
    private readonly characters: CharacterRepository,
    private readonly habits: HabitRepository,
    private readonly checkIns: CheckInRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): AsyncResult<CharacterOverview> {
    const today = todayOf(this.clock);
    const [character, habits] = await Promise.all([
      this.characters.get(),
      this.habits.listActive(),
    ]);
    if (!character.ok) return character;
    if (!habits.ok) return habits;
    if (!character.value) {
      return ok({
        today,
        character: null,
        habits: habits.value,
        proximity: null,
        week: [],
        traits: [],
        todayStatuses: {},
      });
    }

    const checkIns = await this.checkIns.listRange(addDays(today, -(TREND_DAYS - 1)), today);
    if (!checkIns.ok) return checkIns;

    const habitById = new Map(habits.value.map((habit) => [habit.id, habit]));
    const known = new Set(habitById.keys());
    const traits = character.value.traits.map((trait) => withKnownHabits(trait, known));
    const todayCheckIn = checkIns.value.find((checkIn) => checkIn.date === today);
    const week = proximitySeries(traits, checkIns.value, today, PROXIMITY_WINDOW_DAYS);

    return ok({
      today,
      character: character.value,
      habits: habits.value,
      proximity: displayedProximity(week),
      week,
      todayStatuses: Object.fromEntries(
        (todayCheckIn?.entries ?? []).map((entry) => [entry.habitId, entry.status]),
      ),
      traits: traits.map((trait) => {
        const trend = traitSeries(trait, checkIns.value, today, TREND_DAYS);
        return {
          trait,
          habits: trait.habitIds.flatMap((id) => habitById.get(id) ?? []),
          weekAverage: averageOf(trend.slice(-PROXIMITY_WINDOW_DAYS).map((day) => day.value)),
          today: traitDayStatus(trait.habitIds, todayCheckIn),
          trend,
        };
      }),
    });
  }
}

export class SaveCharacterUseCase {
  constructor(private readonly characters: CharacterRepository) {}

  async execute(draft: CharacterDraft): AsyncResult<Character> {
    const normalized = normalizeCharacterDraft(draft);
    if (!normalized.ok) return normalized;
    return this.characters.save(normalized.value);
  }
}

export class DeleteCharacterUseCase {
  constructor(private readonly characters: CharacterRepository) {}

  execute(): AsyncResult<void> {
    return this.characters.delete();
  }
}
