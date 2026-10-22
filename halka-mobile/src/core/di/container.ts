// Manuel DI container: tüm bağımlılıklar burada tek noktada kurulur (composition root)
import { resolveApiBaseUrl } from '@core/api/apiConfig';
import { createHttpClient } from '@core/api/httpClient';
import { Platform } from 'react-native';
import { BrowserKeyValueStore } from '@features/auth/data/BrowserKeyValueStore';
import { HttpAuthRepository } from '@features/auth/data/HttpAuthRepository';
import { SecureSessionStorage } from '@features/auth/data/SecureSessionStorage';
import { ForgotPasswordUseCase } from '@features/auth/domain/usecases/ForgotPasswordUseCase';
import { LoginUseCase } from '@features/auth/domain/usecases/LoginUseCase';
import { LogoutUseCase } from '@features/auth/domain/usecases/LogoutUseCase';
import { RegisterUseCase } from '@features/auth/domain/usecases/RegisterUseCase';
import { ResetPasswordUseCase } from '@features/auth/domain/usecases/ResetPasswordUseCase';
import { RestoreSessionUseCase } from '@features/auth/domain/usecases/RestoreSessionUseCase';
import { HttpCharacterRepository } from '@features/character/data/HttpCharacterRepository';
import {
  DeleteCharacterUseCase,
  GetCharacterOverviewUseCase,
  SaveCharacterUseCase,
} from '@features/character/domain/usecases/CharacterUseCases';
import { HttpCheckInRepository } from '@features/checkin/data/HttpCheckInRepository';
import { HttpHabitEntryRepository } from '@features/checkin/data/HttpHabitEntryRepository';
import {
  GetCheckInOverviewUseCase,
  OpenCheckInUseCase,
  SaveCheckInUseCase,
} from '@features/checkin/domain/usecases/CheckInUseCases';
import {
  GetHabitEntriesUseCase,
  MarkHabitUseCase,
} from '@features/checkin/domain/usecases/HabitEntryUseCases';
import { HttpHabitRepository } from '@features/habits/data/HttpHabitRepository';
import {
  ArchiveHabitUseCase,
  CreateHabitUseCase,
  ListHabitsUseCase,
} from '@features/habits/domain/usecases/HabitUseCases';
import { HttpDayNoteRepository } from '@features/history/data/HttpDayNoteRepository';
import {
  DeleteDayNoteUseCase,
  GetDayNoteUseCase,
  GetMonthHistoryUseCase,
  SaveDayNoteUseCase,
} from '@features/history/domain/usecases/HistoryUseCases';
import { AsyncStorageKeyValueStorage } from '@data/datasources/AsyncStorageKeyValueStorage';
import { createDefaultStorageDto } from '@data/datasources/createDefaultStorageDto';
import { HalkaLocalDataSource } from '@data/datasources/HalkaLocalDataSource';
import type { KeyValueStorage } from '@data/datasources/KeyValueStorage';
import { createRepositories } from '@data/repositories/repositories';
import { ExpoAudioService } from '@data/services/ExpoAudioService';
import { ExpoClipboardService } from '@data/services/ExpoClipboardService';
import { SystemClock } from '@data/services/SystemClock';
import type { AudioPort } from '@domain/ports/AudioPort';
import type { ClipboardPort } from '@domain/ports/ClipboardPort';
import type { Clock } from '@domain/ports/Clock';
import { InitializeAppUseCase } from '@domain/usecases/app/InitializeAppUseCase';
import { LoadSnapshotUseCase } from '@domain/usecases/app/LoadSnapshotUseCase';
import { RunDailyResetUseCase } from '@domain/usecases/app/RunDailyResetUseCase';
import { PlaySoundEffectUseCase } from '@domain/usecases/audio/PlaySoundEffectUseCase';
import { StopAmbientUseCase } from '@domain/usecases/audio/StopAmbientUseCase';
import { ToggleAmbientUseCase } from '@domain/usecases/audio/ToggleAmbientUseCase';
import { ToggleBigOneUseCase } from '@domain/usecases/bigOne/ToggleBigOneUseCase';
import { UpdateBigOneGoalUseCase } from '@domain/usecases/bigOne/UpdateBigOneGoalUseCase';
import { GenerateDailyBriefingUseCase } from '@domain/usecases/briefing/GenerateDailyBriefingUseCase';
import { AddExpenseUseCase } from '@domain/usecases/budget/AddExpenseUseCase';
import { DeleteExpenseUseCase } from '@domain/usecases/budget/DeleteExpenseUseCase';
import { AddWidgetUseCase } from '@domain/usecases/layout/AddWidgetUseCase';
import { GetWidgetCatalogUseCase } from '@domain/usecases/layout/GetWidgetCatalogUseCase';
import { RemoveWidgetUseCase } from '@domain/usecases/layout/RemoveWidgetUseCase';
import { SetEnergyLevelUseCase } from '@domain/usecases/mood/SetEnergyLevelUseCase';
import { SetMoodUseCase } from '@domain/usecases/mood/SetMoodUseCase';
import { SetReflectionUseCase } from '@domain/usecases/mood/SetReflectionUseCase';
import { ClearNoteUseCase } from '@domain/usecases/notes/ClearNoteUseCase';
import { CopyNoteUseCase } from '@domain/usecases/notes/CopyNoteUseCase';
import { UpdateNoteUseCase } from '@domain/usecases/notes/UpdateNoteUseCase';
import { ChangePomodoroModeUseCase } from '@domain/usecases/pomodoro/ChangePomodoroModeUseCase';
import { CompletePomodoroSessionUseCase } from '@domain/usecases/pomodoro/CompletePomodoroSessionUseCase';
import { PausePomodoroUseCase } from '@domain/usecases/pomodoro/PausePomodoroUseCase';
import { ResetPomodoroUseCase } from '@domain/usecases/pomodoro/ResetPomodoroUseCase';
import { StartPomodoroUseCase } from '@domain/usecases/pomodoro/StartPomodoroUseCase';
import { ChangeViewModeUseCase } from '@domain/usecases/profile/ChangeViewModeUseCase';
import { ToggleSoundUseCase } from '@domain/usecases/profile/ToggleSoundUseCase';
import { UpdateUserNameUseCase } from '@domain/usecases/profile/UpdateUserNameUseCase';
import { CheckInStreakUseCase } from '@domain/usecases/streak/CheckInStreakUseCase';
import { AddTaskUseCase } from '@domain/usecases/tasks/AddTaskUseCase';
import { DeleteTaskUseCase } from '@domain/usecases/tasks/DeleteTaskUseCase';
import { ToggleTaskUseCase } from '@domain/usecases/tasks/ToggleTaskUseCase';
import { AddWaterUseCase } from '@domain/usecases/water/AddWaterUseCase';
import { ResetWaterUseCase } from '@domain/usecases/water/ResetWaterUseCase';

// Testlerde ya da farklı platformlarda değiştirilebilen dış bağımlılıklar
export interface ContainerDependencies {
  readonly storage: KeyValueStorage;
  readonly audio: AudioPort;
  readonly clipboard: ClipboardPort;
  readonly clock: Clock;
  readonly apiBaseUrl: string;
}

// Sunucu oturumu reddettiğinde (401) çağrılacak dinleyici; presentation katmanı bağlar
type UnauthorizedListener = () => void;

export function createContainer(overrides: Partial<ContainerDependencies> = {}) {
  const clock = overrides.clock ?? new SystemClock();
  const storage = overrides.storage ?? new AsyncStorageKeyValueStorage();
  const audio = overrides.audio ?? new ExpoAudioService();
  const clipboard = overrides.clipboard ?? new ExpoClipboardService();
  const apiBaseUrl = overrides.apiBaseUrl ?? resolveApiBaseUrl();

  // --- Uzak API (kendi Fastify sunucumuz) ---
  let unauthorizedListener: UnauthorizedListener | null = null;
  // Web önizlemesinde SecureStore olmadığından tarayıcı belleği kullanılır
  const sessionStorage = new SecureSessionStorage(
    Platform.OS === 'web' ? new BrowserKeyValueStore() : undefined,
  );
  const http = createHttpClient({
    baseURL: apiBaseUrl,
    getToken: () => sessionStorage.peekToken(),
    onUnauthorized: () => unauthorizedListener?.(),
  });
  const authRepository = new HttpAuthRepository(http);
  const habitRepository = new HttpHabitRepository(http);
  const checkInRepository = new HttpCheckInRepository(http);
  const habitEntryRepository = new HttpHabitEntryRepository(http);
  const dayNoteRepository = new HttpDayNoteRepository(http);
  const characterRepository = new HttpCharacterRepository(http);

  const dataSource = new HalkaLocalDataSource(storage, () => createDefaultStorageDto(clock));
  const repos = createRepositories(dataSource);

  const runDailyReset = new RunDailyResetUseCase(repos, clock);
  const loadSnapshot = new LoadSnapshotUseCase(repos);

  return {
    clock,
    apiBaseUrl,
    auth: {
      login: new LoginUseCase(authRepository, sessionStorage),
      register: new RegisterUseCase(authRepository, sessionStorage),
      restore: new RestoreSessionUseCase(authRepository, sessionStorage),
      logout: new LogoutUseCase(sessionStorage),
      forgotPassword: new ForgotPasswordUseCase(authRepository),
      resetPassword: new ResetPasswordUseCase(authRepository),
      serverHealth: authRepository,
      setUnauthorizedListener: (listener: UnauthorizedListener | null) => {
        unauthorizedListener = listener;
      },
    },
    habits: {
      list: new ListHabitsUseCase(habitRepository),
      create: new CreateHabitUseCase(habitRepository),
      archive: new ArchiveHabitUseCase(habitRepository),
    },
    checkIn: {
      overview: new GetCheckInOverviewUseCase(checkInRepository, clock),
      open: new OpenCheckInUseCase(checkInRepository, clock),
      save: new SaveCheckInUseCase(checkInRepository, clock),
      entries: new GetHabitEntriesUseCase(habitEntryRepository, clock),
      mark: new MarkHabitUseCase(habitEntryRepository, clock),
    },
    history: {
      month: new GetMonthHistoryUseCase(checkInRepository, dayNoteRepository, clock),
      getNote: new GetDayNoteUseCase(dayNoteRepository),
      saveNote: new SaveDayNoteUseCase(dayNoteRepository, clock),
      deleteNote: new DeleteDayNoteUseCase(dayNoteRepository),
    },
    character: {
      overview: new GetCharacterOverviewUseCase(
        characterRepository,
        habitRepository,
        checkInRepository,
        clock,
      ),
      save: new SaveCharacterUseCase(characterRepository),
      delete: new DeleteCharacterUseCase(characterRepository),
    },
    app: {
      initialize: new InitializeAppUseCase(runDailyReset, loadSnapshot, audio),
      runDailyReset,
      loadSnapshot,
    },
    profile: {
      updateName: new UpdateUserNameUseCase(repos.profile),
      changeViewMode: new ChangeViewModeUseCase(repos.profile),
      toggleSound: new ToggleSoundUseCase(repos.profile, audio),
    },
    layout: {
      addWidget: new AddWidgetUseCase(repos.layout),
      removeWidget: new RemoveWidgetUseCase(repos.layout, audio),
      getCatalog: new GetWidgetCatalogUseCase(),
    },
    briefing: {
      generate: new GenerateDailyBriefingUseCase(clock),
    },
    water: {
      add: new AddWaterUseCase(repos.water),
      reset: new ResetWaterUseCase(repos.water),
    },
    pomodoro: {
      start: new StartPomodoroUseCase(repos.pomodoro, clock),
      pause: new PausePomodoroUseCase(repos.pomodoro, clock),
      reset: new ResetPomodoroUseCase(repos.pomodoro),
      changeMode: new ChangePomodoroModeUseCase(repos.pomodoro),
      complete: new CompletePomodoroSessionUseCase(repos.pomodoro, clock),
    },
    tasks: {
      add: new AddTaskUseCase(repos.tasks),
      toggle: new ToggleTaskUseCase(repos.tasks),
      remove: new DeleteTaskUseCase(repos.tasks),
    },
    streak: {
      checkIn: new CheckInStreakUseCase(repos.streak, clock),
    },
    notes: {
      update: new UpdateNoteUseCase(repos.notes),
      clear: new ClearNoteUseCase(repos.notes),
      copy: new CopyNoteUseCase(clipboard),
    },
    mood: {
      setMood: new SetMoodUseCase(repos.mood),
      setEnergy: new SetEnergyLevelUseCase(repos.mood),
      setReflection: new SetReflectionUseCase(repos.mood),
    },
    bigOne: {
      toggle: new ToggleBigOneUseCase(repos.bigOne),
      updateGoal: new UpdateBigOneGoalUseCase(repos.bigOne),
    },
    budget: {
      addExpense: new AddExpenseUseCase(repos.budget, clock),
      deleteExpense: new DeleteExpenseUseCase(repos.budget),
    },
    audio: {
      playEffect: new PlaySoundEffectUseCase(audio),
      toggleAmbient: new ToggleAmbientUseCase(audio),
      stopAmbient: new StopAmbientUseCase(audio),
    },
  };
}

export type AppContainer = ReturnType<typeof createContainer>;
