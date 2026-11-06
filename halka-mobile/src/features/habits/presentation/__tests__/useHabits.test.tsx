import { act, renderHook } from '@testing-library/react-native';
import { NetworkFailure } from '@core/errors/Failure';
import { err, ok, type Result } from '@core/result/Result';
import type { Habit } from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';

const saved: Habit = {
  id: 'h1',
  kind: 'build',
  title: 'Kitap oku',
  target: { type: 'daily' },
  createdAt: '2026-11-06T10:00:00.000Z',
};

const mockCreate = jest.fn<Promise<Result<Habit>>, [unknown]>();
const mockList = jest.fn<Promise<Result<readonly Habit[]>>, []>();

jest.mock('@presentation/providers/DIProvider', () => ({
  useDI: () => ({
    habits: {
      list: { execute: () => mockList() },
      create: { execute: (input: unknown) => mockCreate(input) },
      archive: { execute: jest.fn() },
    },
  }),
}));

const mockShowMessage = jest.fn();
jest.mock('@presentation/utils/dialogs', () => ({
  showMessage: (...args: unknown[]) => mockShowMessage(...args),
}));

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useHabits ekleme', () => {
  beforeEach(async () => {
    mockShowMessage.mockClear();
    mockList.mockResolvedValue(ok([]));
    const { result } = await renderHook(() => useHabits());
    await act(() => result.current.reload());
  });

  it('sunucu cevabını beklemeden listede gösterir, cevap gelince gerçek kayda çevirir', async () => {
    const server = deferred<Result<Habit>>();
    mockCreate.mockReturnValue(server.promise);
    const { result } = await renderHook(() => useHabits());

    let adding: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      adding = result.current.createHabit({ kind: 'build', title: 'Kitap oku' });
    });
    expect(result.current.allHabits.map((h) => h.title)).toEqual(['Kitap oku']);
    // Check-in ve karakter geçici kaydı görmez
    expect(result.current.habits).toEqual([]);

    await act(async () => {
      server.resolve(ok(saved));
      await adding;
    });
    expect(result.current.allHabits).toEqual([saved]);
    expect(result.current.pendingHabits).toEqual([]);
  });

  it('sunucu hata verirse geçici kaydı kaldırır ve uyarır', async () => {
    mockCreate.mockResolvedValue(err(new NetworkFailure('Bağlantı yok')));
    const { result } = await renderHook(() => useHabits());

    await act(async () => {
      await result.current.createHabit({ kind: 'build', title: 'Kitap oku' });
    });

    expect(result.current.allHabits).toEqual([]);
    expect(mockShowMessage).toHaveBeenCalledTimes(1);
  });

  it('ekleme sırasında başlamış yenilemenin eski listesi yeni kaydı silmez', async () => {
    const staleList = deferred<Result<readonly Habit[]>>();
    mockList.mockReturnValue(staleList.promise);
    mockCreate.mockResolvedValue(ok(saved));
    const { result } = await renderHook(() => useHabits());

    let reloading: Promise<void> = Promise.resolve();
    await act(async () => {
      reloading = result.current.reload();
    });
    await act(async () => {
      await result.current.createHabit({ kind: 'build', title: 'Kitap oku' });
    });
    await act(async () => {
      staleList.resolve(ok([]));
      await reloading;
    });

    expect(result.current.allHabits).toEqual([saved]);
    expect(result.current.status).toBe('ready');
  });
});
