// Manuel DI container: tüm bağımlılıklar burada tek noktada kurulur (composition root)
import { resolveApiBaseUrl } from '@core/api/apiConfig';
import { createHttpClient } from '@core/api/httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HttpAuthRepository } from '@features/auth/data/HttpAuthRepository';
import {
  BrowserKeyValueStore,
  SecureSessionStorage,
} from '@features/auth/data/SecureSessionStorage';
import {
  ForgotPasswordUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
  RestoreSessionUseCase,
} from '@features/auth/domain/usecases/AuthUseCases';
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
import { createDefaultStorageDto } from '@features/halka/data/mappers';
import { createRepositories } from '@features/halka/data/repositories';
import { ExpoAudioService } from '@features/halka/data/services/ExpoAudioService';
import { ExpoClipboardService } from '@features/halka/data/services/ExpoClipboardService';
import { SystemClock } from '@core/utils/clock';
import { HalkaLocalDataSource, type KeyValueStorage } from '@features/halka/data/storage';
import type { Clock } from '@core/utils/clock';
import type { AudioPort, ClipboardPort } from '@features/halka/domain/ports';
import {
  InitializeAppUseCase,
  LoadSnapshotUseCase,
  RunDailyResetUseCase,
} from '@features/halka/domain/usecases/AppUseCases';
import {
  PlaySoundEffectUseCase,
  StopAmbientUseCase,
  ToggleAmbientUseCase,
} from '@features/halka/domain/usecases/AudioUseCases';
import {
  ToggleBigOneUseCase,
  UpdateBigOneGoalUseCase,
} from '@features/halka/domain/usecases/BigOneUseCases';
import { GenerateDailyBriefingUseCase } from '@features/halka/domain/usecases/BriefingUseCases';
import {
  AddExpenseUseCase,
  DeleteExpenseUseCase,
} from '@features/halka/domain/usecases/BudgetUseCases';
import {
  AddWidgetUseCase,
  GetWidgetCatalogUseCase,
  RemoveWidgetUseCase,
} from '@features/halka/domain/usecases/LayoutUseCases';
import {
  SetEnergyLevelUseCase,
  SetMoodUseCase,
  SetReflectionUseCase,
} from '@features/halka/domain/usecases/MoodUseCases';
import {
  ClearNoteUseCase,
  CopyNoteUseCase,
  UpdateNoteUseCase,
} from '@features/halka/domain/usecases/NotesUseCases';
import {
  ChangePomodoroModeUseCase,
  CompletePomodoroSessionUseCase,
  PausePomodoroUseCase,
  ResetPomodoroUseCase,
  StartPomodoroUseCase,
} from '@features/halka/domain/usecases/PomodoroUseCases';
import {
  ChangeViewModeUseCase,
  ToggleSoundUseCase,
  UpdateUserNameUseCase,
} from '@features/halka/domain/usecases/ProfileUseCases';
import { CheckInStreakUseCase } from '@features/halka/domain/usecases/StreakUseCases';
import {
  AddTaskUseCase,
  DeleteTaskUseCase,
  ToggleTaskUseCase,
} from '@features/halka/domain/usecases/TasksUseCases';
import { AddWaterUseCase, ResetWaterUseCase } from '@features/halka/domain/usecases/WaterUseCases';

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
  const storage = overrides.storage ?? AsyncStorage;
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
