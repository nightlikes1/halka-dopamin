// 4 sn geri alınabilen işlem: bildirim gösterilir; süre dolunca (ya da yeni işlem gelince) "commit"
// çalışır, "Geri al"a basılırsa "undo" çalışır.
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UndoAction {
  readonly message: string;
  readonly undo: () => void;
  readonly commit?: () => void;
}

export function useUndo(durationMs: number) {
  const [current, setCurrent] = useState<UndoAction | null>(null);
  const pending = useRef<UndoAction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const action = pending.current;
    pending.current = null;
    setCurrent(null);
    action?.commit?.();
  }, []);

  const show = useCallback(
    (action: UndoAction) => {
      settle();
      pending.current = action;
      setCurrent(action);
      timer.current = setTimeout(settle, durationMs);
    },
    [durationMs, settle],
  );

  const undo = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const action = pending.current;
    pending.current = null;
    setCurrent(null);
    action?.undo();
  }, []);

  // Ekrandan çıkılınca bekleyen işlem uygulanır
  useEffect(() => settle, [settle]);

  return { current, show, undo };
}
