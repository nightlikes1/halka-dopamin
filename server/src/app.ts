// Fastify uygulamasını bağımlılıklarla kurar (testlerde sahte bağımlılıklar verilebilir)
import fastifyCors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config/env.js';
import { systemClock, type Clock } from './core/dates.js';
import { AuthService } from './modules/auth/auth.service.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { NodemailerEmailService, type EmailService } from './modules/auth/email.service.js';
import type { PasswordHasher } from './modules/auth/passwordHasher.js';
import type { PasswordResetTokenRepository } from './modules/auth/passwordResetToken.repository.js';
import type { UserRepository } from './modules/auth/user.repository.js';
import type { CharacterRepository } from './modules/character/character.repository.js';
import { characterRoutes } from './modules/character/character.routes.js';
import type { CheckInRepository } from './modules/checkins/checkin.repository.js';
import { CheckInService } from './modules/checkins/checkin.service.js';
import { checkInRoutes } from './modules/checkins/checkins.routes.js';
import type { DayNoteRepository } from './modules/dayNotes/dayNote.repository.js';
import { dayNoteRoutes } from './modules/dayNotes/dayNotes.routes.js';
import type { HabitEntryRepository } from './modules/habitEntries/habitEntry.repository.js';
import { habitEntryRoutes } from './modules/habitEntries/habitEntries.routes.js';
import type { HabitRepository } from './modules/habits/habit.repository.js';
import { habitRoutes } from './modules/habits/habits.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { registerAuth } from './plugins/auth.js';
import { registerErrorHandler } from './plugins/errorHandler.js';

export interface AppDependencies {
  readonly config: AppConfig;
  readonly userRepository: UserRepository;
  readonly passwordResetTokenRepository: PasswordResetTokenRepository;
  readonly habitRepository: HabitRepository;
  readonly checkInRepository: CheckInRepository;
  readonly habitEntryRepository: HabitEntryRepository;
  readonly dayNoteRepository: DayNoteRepository;
  readonly characterRepository: CharacterRepository;
  readonly passwordHasher: PasswordHasher;
  readonly checkDatabase: () => Promise<boolean>;
  readonly emailService?: EmailService;
  readonly clock?: Clock;
  readonly logger?: boolean;
}

export async function buildApp(deps: AppDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger: deps.logger ?? false, bodyLimit: 100 * 1024 });
  const clock = deps.clock ?? systemClock;

  registerErrorHandler(app);
  // Yalnızca geliştirmede: tarayıcıdaki Expo web önizlemesinin API'ye erişebilmesi için.
  // Mobil uygulama CORS'a ihtiyaç duymaz; üretimde kapalıdır.
  if (!deps.config.isProduction) {
    await app.register(fastifyCors, {
      origin: true,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });
  }
  await registerAuth(app, deps.config);

  const emailService = deps.emailService ?? new NodemailerEmailService(deps.config);
  const authService = new AuthService(
    deps.userRepository,
    deps.passwordHasher,
    {
      sign: (payload) => app.jwt.sign(payload),
    },
    deps.passwordResetTokenRepository,
    emailService,
    deps.config,
  );
  const checkInService = new CheckInService(deps.habitRepository, deps.checkInRepository, clock);

  await app.register(healthRoutes, { checkDatabase: deps.checkDatabase });
  await app.register(authRoutes, { authService, appUrl: deps.config.appUrl });
  await app.register(habitRoutes, { habits: deps.habitRepository, clock });
  await app.register(checkInRoutes, { checkIns: deps.checkInRepository, service: checkInService });
  await app.register(habitEntryRoutes, {
    entries: deps.habitEntryRepository,
    habits: deps.habitRepository,
    clock,
  });
  await app.register(dayNoteRoutes, { notes: deps.dayNoteRepository, clock });
  await app.register(characterRoutes, {
    characters: deps.characterRepository,
    habits: deps.habitRepository,
  });

  return app;
}
