// Check-in ekranı ViewModel'i: mevcut kaydı yükler (düzenleme modu), taslağı tutar, kaydeder
import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeDailyBalance, isTroubledDay } from '@features/checkin/domain/balance';
import type { DayRating, HabitCheck } from '@features/checkin/domain/entities';
import type { CheckInSession } from '@features/checkin/domain/usecases/CheckInUseCases';
import type { HabitEntryStatus } from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import { useDI } from '@presentation/providers/DIProvider';

type Answers = Readonly<Record<string, HabitEntryStatus>>;

export type SessionState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'ready'; readonly session: CheckInSession };

export function useCheckInSession(date: string) {
  const { checkIn, history } = useDI();
  const { habits, reload: reloadHabits } = useHabits();
  const [state, setState] = useState<SessionState>({ kind: 'loading' });
  const [rating, setRating] = useState<DayRating | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [note, setNote] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSession = useCallback(
    () =>
      Promise.all([
        checkIn.open.execute(date),
        history.getNote.execute(date),
        checkIn.entries.execute(date),
        reloadHabits(),
      ]),
    [checkIn, history, date, reloadHabits],
  );

  type Loaded = Awaited<ReturnType<typeof fetchSession>>;

  const apply = useCallback(([session, existingNote, marked]: Loaded) => {
    if (!session.ok) {
      setState({ kind: 'error', message: session.error.message });
      return;
    }
    // Düzenleme modu: önceki cevaplarla doldur; check-in yoksa gün içi işaretlerle
    const existing = session.value.existing;
    const prefill = existing?.entries ?? (marked.ok ? marked.value.entries : []);
    setRating(existing?.rating ?? null);
    setAnswers(Object.fromEntries(prefill.map((entry) => [entry.habitId, entry.status])));
    const noteText = existingNote.ok ? (existingNote.value?.text ?? '') : '';
    setNote(noteText);
    setInitialNote(noteText);
    setState({ kind: 'ready', session: session.value });
  }, []);

  useEffect(() => {
    // Ekran kapandıktan sonra gelen cevap uygulanmaz
    let cancelled = false;
    void fetchSession().then((loaded) => {
      if (!cancelled) apply(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSession, apply]);

  const reload = useCallback(() => {
    setState({ kind: 'loading' });
    void fetchSession().then(apply);
  }, [fetchSession, apply]);

  const setAnswer = useCallback((habitId: string, status: HabitEntryStatus | undefined) => {
    setAnswers((current) => {
      const next = { ...current };
      if (status) next[habitId] = status;
      else delete next[habitId];
      return next;
    });
  }, []);

  // Yalnızca hâlâ aktif alışkanlıkların cevapları gönderilir
  const entries = useMemo<HabitCheck[]>(
    () =>
      habits.flatMap((habit) => {
        const status = answers[habit.id];
        return status ? [{ habitId: habit.id, status }] : [];
      }),
    [habits, answers],
  );

  const preview = useMemo(() => {
    const input = { rating: rating ?? 3, entries };
    return {
      balance: rating ? computeDailyBalance(input) : null,
      troubled: isTroubledDay({ rating: rating ?? 5, entries }),
    };
  }, [rating, entries]);

  // Başarılıysa null, değilse gösterilecek hata mesajı
  const save = useCallback(async (): Promise<string | null> => {
    if (rating === null) return null;
    setSaving(true);
    try {
      const saved = await checkIn.save.execute(date, { rating, entries }, habits);
      if (!saved.ok) return saved.error.message;

      const trimmed = note.trim();
      if (trimmed !== initialNote.trim()) {
        const noteResult = trimmed
          ? await history.saveNote.execute(date, trimmed)
          : await history.deleteNote.execute(date);
        if (!noteResult.ok) return noteResult.error.message;
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [checkIn, history, date, rating, entries, habits, note, initialNote]);

  return {
    state,
    habits,
    rating,
    setRating,
    answers,
    setAnswer,
    note,
    setNote,
    preview,
    saving,
    save,
    reload,
  };
}
