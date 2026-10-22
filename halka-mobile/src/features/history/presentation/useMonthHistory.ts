// Geçmiş ekranı ViewModel'i: ay gezinme, gün seçimi, not kaydet/sil
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { toIsoDate } from '@core/utils/date';
import { monthOf, shiftMonth, type MonthRef } from '@features/history/domain/calendar';
import type { MonthHistory } from '@features/history/domain/usecases/HistoryUseCases';
import { useDI } from '@presentation/providers/DIProvider';

type HistoryState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'ready'; readonly data: MonthHistory };

export function useMonthHistory(initialDate?: string) {
  const { history, clock } = useDI();
  const start = initialDate ?? toIsoDate(clock.now());
  const [month, setMonth] = useState<MonthRef>(() => monthOf(start));
  const [selectedDate, setSelectedDate] = useState(start);
  const [state, setState] = useState<HistoryState>({ kind: 'loading' });

  const load = useCallback(async () => {
    const result = await history.month.execute(month);
    setState(
      result.ok
        ? { kind: 'ready', data: result.value }
        : { kind: 'error', message: result.error.message },
    );
  }, [history, month]);

  // Ekrana her dönüşte (ör. check-in sonrası) tazele
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const goToMonth = useCallback((delta: number) => {
    setState({ kind: 'loading' });
    setMonth((current) => shiftMonth(current, delta));
  }, []);

  // Başarılıysa null, değilse hata mesajı
  const saveNote = useCallback(
    async (date: string, text: string): Promise<string | null> => {
      const result = await history.saveNote.execute(date, text);
      if (!result.ok) return result.error.message;
      await load();
      return null;
    },
    [history, load],
  );

  const deleteNote = useCallback(
    async (date: string): Promise<string | null> => {
      const result = await history.deleteNote.execute(date);
      if (!result.ok) return result.error.message;
      await load();
      return null;
    },
    [history, load],
  );

  const selectedDay =
    state.kind === 'ready'
      ? (state.data.days.find((day) => day.date === selectedDate) ?? null)
      : null;

  return {
    month,
    state,
    selectedDate,
    selectedDay,
    selectDate: setSelectedDate,
    goToMonth,
    saveNote,
    deleteNote,
    reload: load,
  };
}
