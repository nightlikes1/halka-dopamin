// Halka panosunun cihazdaki verisi: anahtar, JSON şeması, ayrıştırma ve okuma/yazma
import { z } from 'zod';

// Kalıcı depolama sabitleri
export const STORAGE_KEY = 'halka_life_os_data_v2';
export const STORAGE_SCHEMA_VERSION = 2;

// Kalıcı depolamadaki JSON şeması (DTO) — zod ile çalışma anında doğrulanır
export const profileDtoSchema = z.object({
  name: z.string(),
  title: z.string(),
  viewMode: z.string(),
  soundEnabled: z.boolean(),
  lastActiveDate: z.string(),
});

export const layoutDtoSchema = z.object({
  activeWidgetIds: z.array(z.string()),
});

export const waterDtoSchema = z.object({
  current: z.number(),
  target: z.number(),
});

export const pomodoroDtoSchema = z.object({
  mode: z.string(),
  workMinutes: z.number(),
  shortBreakMinutes: z.number(),
  longBreakMinutes: z.number(),
  remainingSeconds: z.number(),
  endsAtMs: z.number().nullable(),
  completedSessions: z.number(),
});

export const taskDtoSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  priority: z.string(),
});

export const tasksDtoSchema = z.object({
  items: z.array(taskDtoSchema),
});

export const streakDtoSchema = z.object({
  habitName: z.string(),
  bestStreak: z.number(),
  checkedDates: z.array(z.string()),
});

export const notesDtoSchema = z.object({
  content: z.string(),
});

export const moodDtoSchema = z.object({
  todayMood: z.string(),
  energyLevel: z.number(),
  reflection: z.string(),
});

export const bigOneDtoSchema = z.object({
  goal: z.string(),
  isCompleted: z.boolean(),
  category: z.string(),
});

export const expenseDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  createdAt: z.string(),
});

export const budgetDtoSchema = z.object({
  limit: z.number(),
  expenses: z.array(expenseDtoSchema),
});

export type ProfileDto = z.infer<typeof profileDtoSchema>;
export type LayoutDto = z.infer<typeof layoutDtoSchema>;
export type WaterDto = z.infer<typeof waterDtoSchema>;
export type PomodoroDto = z.infer<typeof pomodoroDtoSchema>;
export type TaskDto = z.infer<typeof taskDtoSchema>;
export type TasksDto = z.infer<typeof tasksDtoSchema>;
export type StreakDto = z.infer<typeof streakDtoSchema>;
export type NotesDto = z.infer<typeof notesDtoSchema>;
export type MoodDto = z.infer<typeof moodDtoSchema>;
export type BigOneDto = z.infer<typeof bigOneDtoSchema>;
export type ExpenseDto = z.infer<typeof expenseDtoSchema>;
export type BudgetDto = z.infer<typeof budgetDtoSchema>;

export interface HalkaStorageDto {
  schemaVersion: number;
  profile: ProfileDto;
  layout: LayoutDto;
  water: WaterDto;
  pomodoro: PomodoroDto;
  tasks: TasksDto;
  streak: StreakDto;
  notes: NotesDto;
  mood: MoodDto;
  bigOne: BigOneDto;
  budget: BudgetDto;
}

export type HalkaSliceKey = Exclude<keyof HalkaStorageDto, 'schemaVersion'>;

// Ham JSON'u DTO'ya çevirir; bozuk/eksik bölümler varsayılanla doldurulur
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseStorageDto(raw: unknown, fallback: HalkaStorageDto): HalkaStorageDto {
  if (!isRecord(raw)) return fallback;
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    profile: pick(profileDtoSchema, raw.profile, fallback.profile),
    layout: pick(layoutDtoSchema, raw.layout, fallback.layout),
    water: pick(waterDtoSchema, raw.water, fallback.water),
    pomodoro: pick(pomodoroDtoSchema, raw.pomodoro, fallback.pomodoro),
    tasks: pick(tasksDtoSchema, raw.tasks, fallback.tasks),
    streak: pick(streakDtoSchema, raw.streak, fallback.streak),
    notes: pick(notesDtoSchema, raw.notes, fallback.notes),
    mood: pick(moodDtoSchema, raw.mood, fallback.mood),
    bigOne: pick(bigOneDtoSchema, raw.bigOne, fallback.bigOne),
    budget: pick(budgetDtoSchema, raw.budget, fallback.budget),
  };
}

// Anahtar-değer depolama soyutlaması (AsyncStorage veya testte bellek içi)
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Tüm uygulama verisini tek JSON anahtarında tutan yerel veri kaynağı.
// Bellek içi önbellek + sıralı yazma kuyruğu ile yarış durumları önlenir.
export class HalkaLocalDataSource {
  private cache: HalkaStorageDto | null = null;
  private loading: Promise<HalkaStorageDto> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly createDefault: () => HalkaStorageDto,
  ) {}

  // Depolama hatasında hata fırlatır (repository yakalar)
  async read(): Promise<HalkaStorageDto> {
    if (this.cache) return this.cache;
    if (!this.loading) {
      this.loading = this.load().finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  // Değişikliği önbelleğe uygular ve sıraya alıp diske yazar
  async update(mutate: (current: HalkaStorageDto) => HalkaStorageDto): Promise<void> {
    // İlk yüklemeyi bekle; mutasyon await sonrası EN GÜNCEL önbelleğe senkron uygulanır,
    // böylece eşzamanlı güncellemeler birbirinin değişikliğini ezmez
    const loaded = await this.read();
    const next = mutate(this.cache ?? loaded);
    this.cache = next;
    const serialized = JSON.stringify(next);
    // Önceki yazma hatası sonraki yazmaları engellemesin
    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(() => this.storage.setItem(STORAGE_KEY, serialized));
    await this.writeQueue;
  }

  private async load(): Promise<HalkaStorageDto> {
    const fallback = this.createDefault();
    const text = await this.storage.getItem(STORAGE_KEY);
    let dto = fallback;
    if (text !== null) {
      try {
        const raw: unknown = JSON.parse(text);
        dto = parseStorageDto(raw, fallback);
      } catch {
        // Bozuk JSON: varsayılanlarla devam edilir, ilk yazmada düzelir
        dto = fallback;
      }
    }
    this.cache = dto;
    return dto;
  }
}
