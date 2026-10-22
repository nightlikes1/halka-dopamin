// Testler için bellek içi bağımlılıklar
import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import type { AppConfig } from '../src/config/env.js';
import type { Clock } from '../src/core/dates.js';
import { conflict } from '../src/core/errors.js';
import { BcryptPasswordHasher } from '../src/modules/auth/passwordHasher.js';
import type {
  CreateUserInput,
  UserRecord,
  UserRepository,
} from '../src/modules/auth/user.repository.js';
import type {
  PasswordResetTokenRecord,
  PasswordResetTokenRepository,
} from '../src/modules/auth/passwordResetToken.repository.js';
import type {
  EmailService,
  SendPasswordResetEmailInput,
} from '../src/modules/auth/email.service.js';
import type { CharacterRepository } from '../src/modules/character/character.repository.js';
import type {
  CharacterDto,
  SaveCharacterInput,
} from '../src/modules/character/character.schemas.js';
import type { CheckInRepository } from '../src/modules/checkins/checkin.repository.js';
import type { CheckInDto, SaveCheckInInput } from '../src/modules/checkins/checkins.schemas.js';
import type { HabitEntryRepository } from '../src/modules/habitEntries/habitEntry.repository.js';
import type { HabitEntryDto } from '../src/modules/habitEntries/habitEntries.schemas.js';
import type { HabitEntryStatus } from '../src/modules/checkins/checkins.schemas.js';
import type { DayNoteRepository } from '../src/modules/dayNotes/dayNote.repository.js';
import type { DayNoteDto } from '../src/modules/dayNotes/dayNotes.schemas.js';
import type { HabitRepository } from '../src/modules/habits/habit.repository.js';
import type {
  CreateHabitInput,
  HabitDto,
  HabitKind,
} from '../src/modules/habits/habits.schemas.js';

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<string, UserRecord>();

  async findByEmail(email: string): Promise<UserRecord | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    if (await this.findByEmail(input.email)) throw conflict('Bu e-posta adresi zaten kayıtlı.');
    const user: UserRecord = { id: randomUUID(), ...input };
    this.users.set(user.id, user);
    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, passwordHash });
    }
  }
}

interface StoredHabit extends HabitDto {
  readonly userId: string;
  readonly archived: boolean;
}

export class InMemoryHabitRepository implements HabitRepository {
  readonly habits: StoredHabit[] = [];

  async listActive(userId: string): Promise<HabitDto[]> {
    return this.habits.filter((habit) => habit.userId === userId && !habit.archived);
  }

  async create(userId: string, input: CreateHabitInput): Promise<HabitDto> {
    const habit: StoredHabit = {
      id: randomUUID(),
      userId,
      archived: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.habits.push(habit);
    return habit;
  }

  async archive(userId: string, habitId: string): Promise<boolean> {
    const index = this.habits.findIndex(
      (habit) => habit.id === habitId && habit.userId === userId && !habit.archived,
    );
    const habit = this.habits[index];
    if (!habit) return false;
    this.habits[index] = { ...habit, archived: true };
    return true;
  }

  async findKinds(userId: string, habitIds: readonly string[]): Promise<Map<string, HabitKind>> {
    return new Map(
      this.habits
        .filter((habit) => habit.userId === userId && habitIds.includes(habit.id))
        .map((habit) => [habit.id, habit.kind]),
    );
  }
}

export class InMemoryCheckInRepository implements CheckInRepository {
  readonly rows = new Map<string, CheckInDto>();

  async get(userId: string, date: string): Promise<CheckInDto | null> {
    return this.rows.get(`${userId}|${date}`) ?? null;
  }

  async listRange(userId: string, from: string, to: string): Promise<CheckInDto[]> {
    return [...this.rows.entries()]
      .filter(([key, row]) => key.startsWith(`${userId}|`) && row.date >= from && row.date <= to)
      .map(([, row]) => row);
  }

  async save(userId: string, date: string, input: SaveCheckInInput): Promise<CheckInDto> {
    const existing = this.rows.get(`${userId}|${date}`);
    const now = new Date().toISOString();
    const row: CheckInDto = {
      date,
      rating: input.rating,
      completedAt: existing?.completedAt ?? now,
      updatedAt: now,
      entries: input.entries,
    };
    this.rows.set(`${userId}|${date}`, row);
    return row;
  }
}

export class InMemoryHabitEntryRepository implements HabitEntryRepository {
  readonly rows = new Map<string, HabitEntryDto>();

  constructor(private readonly habits: InMemoryHabitRepository) {}

  private ownerOf(habitId: string): string | undefined {
    return this.habits.habits.find((habit) => habit.id === habitId)?.userId;
  }

  async listRange(userId: string, from: string, to: string): Promise<HabitEntryDto[]> {
    return [...this.rows.values()].filter(
      (row) => this.ownerOf(row.habitId) === userId && row.date >= from && row.date <= to,
    );
  }

  async upsert(habitId: string, date: string, status: HabitEntryStatus): Promise<HabitEntryDto> {
    const row: HabitEntryDto = { habitId, date, status };
    this.rows.set(`${habitId}|${date}`, row);
    return row;
  }

  async remove(userId: string, habitId: string, date: string): Promise<boolean> {
    if (this.ownerOf(habitId) !== userId) return false;
    return this.rows.delete(`${habitId}|${date}`);
  }
}

export class InMemoryDayNoteRepository implements DayNoteRepository {
  readonly rows = new Map<string, DayNoteDto>();

  async listRange(userId: string, from: string, to: string): Promise<DayNoteDto[]> {
    return [...this.rows.entries()]
      .filter(([key, row]) => key.startsWith(`${userId}|`) && row.date >= from && row.date <= to)
      .map(([, row]) => row);
  }

  async upsert(userId: string, date: string, text: string): Promise<DayNoteDto> {
    const existing = this.rows.get(`${userId}|${date}`);
    const now = new Date().toISOString();
    const row: DayNoteDto = { date, text, createdAt: existing?.createdAt ?? now, updatedAt: now };
    this.rows.set(`${userId}|${date}`, row);
    return row;
  }

  async delete(userId: string, date: string): Promise<boolean> {
    return this.rows.delete(`${userId}|${date}`);
  }
}

export class InMemoryCharacterRepository implements CharacterRepository {
  readonly rows = new Map<string, CharacterDto>();

  async get(userId: string): Promise<CharacterDto | null> {
    return this.rows.get(userId) ?? null;
  }

  async save(userId: string, input: SaveCharacterInput): Promise<CharacterDto> {
    const existing = this.rows.get(userId);
    const ownIds = new Set(existing?.traits.map((trait) => trait.id) ?? []);
    const row: CharacterDto = {
      id: existing?.id ?? randomUUID(),
      identity: input.identity,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      avatar: input.avatar === undefined ? (existing?.avatar ?? null) : input.avatar,
      look: input.look === undefined ? (existing?.look ?? null) : input.look,
      dicebear: input.dicebear === undefined ? (existing?.dicebear ?? null) : input.dicebear,
      traits: input.traits.map((trait, order) => ({
        id: trait.id && ownIds.has(trait.id) ? trait.id : randomUUID(),
        name: trait.name,
        order,
        habitIds: trait.habitIds,
      })),
    };
    this.rows.set(userId, row);
    return row;
  }

  async delete(userId: string): Promise<boolean> {
    return this.rows.delete(userId);
  }
}

export class InMemoryPasswordResetTokenRepository implements PasswordResetTokenRepository {
  readonly tokens: PasswordResetTokenRecord[] = [];

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord> {
    const record: PasswordResetTokenRecord = {
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.tokens.push(record);
    return record;
  }

  async findValidToken(tokenHash: string, now: Date): Promise<PasswordResetTokenRecord | null> {
    return (
      this.tokens.find(
        (t) => t.tokenHash === tokenHash && t.usedAt === null && t.expiresAt > now,
      ) ?? null
    );
  }

  async markAsUsed(id: string, usedAt: Date): Promise<void> {
    const token = this.tokens.find((t) => t.id === id);
    if (token) {
      (token as { usedAt: Date | null }).usedAt = usedAt;
    }
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    for (const token of this.tokens) {
      if (token.userId === userId && token.usedAt === null) {
        (token as { usedAt: Date | null }).usedAt = new Date();
      }
    }
  }
}

export class InMemoryEmailService implements EmailService {
  readonly sentEmails: SendPasswordResetEmailInput[] = [];

  async sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void> {
    this.sentEmails.push(input);
  }
}

export const fixedClock = (iso: string): Clock => ({ now: () => new Date(iso) });

// bcrypt maliyeti testlerde düşük tutulur
export const fastHasher = new BcryptPasswordHasher(4);

export const testConfig: AppConfig = {
  databaseUrl: 'postgresql://test:test@localhost:5432/test',
  jwtSecret: 'test-secret-test-secret-test-secret-1234',
  jwtExpiresIn: '1h',
  host: '127.0.0.1',
  port: 0,
  isProduction: false,
  appUrl: 'http://localhost:8080',
  smtpPort: 587,
  smtpFrom: 'Halka <noreply@halka.app>',
  smtpSecure: false,
};

export interface TestContext {
  readonly app: FastifyInstance;
  readonly users: InMemoryUserRepository;
  readonly habits: InMemoryHabitRepository;
  readonly checkIns: InMemoryCheckInRepository;
  readonly habitEntries: InMemoryHabitEntryRepository;
  readonly notes: InMemoryDayNoteRepository;
  readonly characters: InMemoryCharacterRepository;
  readonly resetTokens: InMemoryPasswordResetTokenRepository;
  readonly emailService: InMemoryEmailService;
}

export async function createTestApp(
  options: { clock?: Clock; checkDatabase?: () => Promise<boolean> } = {},
): Promise<TestContext> {
  const users = new InMemoryUserRepository();
  const resetTokens = new InMemoryPasswordResetTokenRepository();
  const emailService = new InMemoryEmailService();
  const habits = new InMemoryHabitRepository();
  const checkIns = new InMemoryCheckInRepository();
  const habitEntries = new InMemoryHabitEntryRepository(habits);
  const notes = new InMemoryDayNoteRepository();
  const characters = new InMemoryCharacterRepository();
  const app = await buildApp({
    config: testConfig,
    userRepository: users,
    passwordResetTokenRepository: resetTokens,
    emailService,
    habitRepository: habits,
    checkInRepository: checkIns,
    habitEntryRepository: habitEntries,
    dayNoteRepository: notes,
    characterRepository: characters,
    passwordHasher: fastHasher,
    checkDatabase: options.checkDatabase ?? (async () => true),
    clock: options.clock,
  });
  return { app, users, habits, checkIns, habitEntries, notes, characters, resetTokens, emailService };
}

// Kayıt olup Authorization başlığını döndürür
export async function registerAndAuth(
  app: FastifyInstance,
  email = 'ada@ornek.com',
): Promise<{ authorization: string }> {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password: 'gizli-sifre' },
  });
  const { token } = response.json<{ token: string }>();
  return { authorization: `Bearer ${token}` };
}
