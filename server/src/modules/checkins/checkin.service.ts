// Check-in iş kuralları: tarih penceresi ve alışkanlık-cevap uyumu
import { addDays, localTodayBounds, type Clock } from '../../core/dates.js';
import { badRequest } from '../../core/errors.js';
import type { HabitRepository } from '../habits/habit.repository.js';
import type { CheckInRepository } from './checkin.repository.js';
import { STATUSES_BY_KIND, type CheckInDto, type SaveCheckInInput } from './checkins.schemas.js';

export class CheckInService {
  constructor(
    private readonly habits: HabitRepository,
    private readonly checkIns: CheckInRepository,
    private readonly clock: Clock,
  ) {}

  async save(userId: string, date: string, input: SaveCheckInInput): Promise<CheckInDto> {
    // "Bugün veya dün" kuralının kesin hali istemcide (yerel saat) uygulanır;
    // sunucu saat dilimi farkını tolere eden geniş bir pencereyle korur
    const { earliest, latest } = localTodayBounds(this.clock.now());
    if (date < addDays(earliest, -1) || date > latest) {
      throw badRequest('Check-in yalnızca bugün ve dün için yapılabilir.');
    }

    const kinds = await this.habits.findKinds(
      userId,
      input.entries.map((entry) => entry.habitId),
    );
    for (const entry of input.entries) {
      const kind = kinds.get(entry.habitId);
      if (!kind) throw badRequest('Alışkanlık bulunamadı.');
      if (!STATUSES_BY_KIND[kind].includes(entry.status)) {
        throw badRequest('Alışkanlık türü ile cevap uyumsuz.');
      }
    }

    return this.checkIns.save(userId, date, input);
  }
}
