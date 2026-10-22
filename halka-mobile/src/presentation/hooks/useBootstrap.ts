// Açılışta veriyi yükler; uygulama öne geldiğinde ve dakikada bir gün değişimini kontrol eder
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore } from '@presentation/store/useHalkaStore';

const DAY_CHECK_INTERVAL_MS = 60_000;

export function useBootstrap(): { retry: () => void } {
  const { app } = useDI();
  const setLoading = useHalkaStore((s) => s.setLoading);
  const setSnapshot = useHalkaStore((s) => s.setSnapshot);
  const setError = useHalkaStore((s) => s.setError);

  const load = useCallback(async () => {
    setLoading();
    const result = await app.initialize.execute();
    if (result.ok) setSnapshot(result.value);
    else setError(result.error.message);
  }, [app, setLoading, setSnapshot, setError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const checkNewDay = async () => {
      const reset = await app.runDailyReset.execute();
      if (!reset.ok || !reset.value) return;
      const snapshot = await app.loadSnapshot.execute();
      if (snapshot.ok) setSnapshot(snapshot.value);
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkNewDay();
    });
    const timer = setInterval(() => void checkNewDay(), DAY_CHECK_INTERVAL_MS);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [app, setSnapshot]);

  return { retry: () => void load() };
}
