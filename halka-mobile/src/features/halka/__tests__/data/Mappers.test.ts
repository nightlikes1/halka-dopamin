// DTO <-> Entity mapper testleri
import {
  layoutMapper,
  moodMapper,
  pomodoroMapper,
  profileMapper,
  streakMapper,
} from '@features/halka/data/mappers';
import {
  DEFAULT_POMODORO_DURATIONS,
  type Pomodoro,
} from '@features/halka/domain/entities/Pomodoro';

describe('profileMapper', () => {
  it('eski kayıttaki görünüm alanını okumaz ama kayıt biçiminde korur', () => {
    const profile = profileMapper.toEntity({
      name: 'Ada',
      title: '',
      viewMode: 'grid',
      soundEnabled: true,
      lastActiveDate: '2026-10-14',
    });

    expect(profile).not.toHaveProperty('viewMode');
    expect(profile.name).toBe('Ada');
    expect(profileMapper.toDto(profile).viewMode).toBe('cockpit');
  });
});

describe('layoutMapper', () => {
  it('geçersiz ve tekrarlı eklenti kimliklerini ayıklar', () => {
    expect(
      layoutMapper.toEntity({ activeWidgetIds: ['water', 'bilinmeyen', 'water', 'tasks'] }),
    ).toEqual(['water', 'tasks']);
  });
});

describe('pomodoroMapper', () => {
  it('gidiş-dönüş dönüşümünde veri kaybı olmaz', () => {
    const entity: Pomodoro = {
      mode: 'longBreak',
      durations: DEFAULT_POMODORO_DURATIONS,
      remainingSeconds: 321,
      endsAt: 1_760_000_000_000,
      completedSessions: 4,
    };

    expect(pomodoroMapper.toEntity(pomodoroMapper.toDto(entity))).toEqual(entity);
  });

  it('bozuk süreleri varsayılanlarla düzeltir', () => {
    const entity = pomodoroMapper.toEntity({
      mode: 'garip',
      workMinutes: 0,
      shortBreakMinutes: -1,
      longBreakMinutes: 20,
      remainingSeconds: -5,
      endsAtMs: null,
      completedSessions: 1.6,
    });

    expect(entity).toMatchObject({
      mode: 'work',
      durations: { work: 25, shortBreak: 5, longBreak: 20 },
      remainingSeconds: 0,
      completedSessions: 2,
    });
  });
});

describe('moodMapper', () => {
  it('enerji seviyesini 1-10 aralığına sıkıştırır', () => {
    expect(
      moodMapper.toEntity({ todayMood: 'great', energyLevel: 42, reflection: '' }),
    ).toMatchObject({ energyLevel: 10 });
  });
});

describe('streakMapper', () => {
  it('tarihleri doğrular, sıralar ve tekrarları atar', () => {
    const streak = streakMapper.toEntity({
      habitName: 'Spor',
      bestStreak: 3,
      checkedDates: ['2026-10-13', 'dün', '2026-10-12', '2026-10-13'],
    });

    expect(streak.checkedDates).toEqual(['2026-10-12', '2026-10-13']);
  });
});
