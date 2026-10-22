// Hızlı not ViewModel'i: yazarken store anında, depolama gecikmeli (debounce) güncellenir
import { useCallback, useEffect, useRef } from 'react';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';
import { confirmAction, showMessage } from '@presentation/utils/dialogs';

const SAVE_DELAY_MS = 400;

export function useNotes() {
  const note = useSnapshotSlice('notes');
  const patch = useHalkaStore((s) => s.patch);
  const { notes: useCases } = useDI();
  const play = useSoundEffect();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const content = pending.current;
    if (content === null) return;
    pending.current = null;
    const result = await useCases.update.execute(content);
    if (!result.ok) showMessage('Not kaydedilemedi', result.error.message);
  }, [useCases]);

  const setContent = useCallback(
    (content: string) => {
      patch('notes', { content });
      pending.current = content;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [patch, flush],
  );

  // Ekrandan çıkarken bekleyen değişikliği kaydet
  useEffect(
    () => () => {
      void flush();
    },
    [flush],
  );

  const copy = useCallback(
    async (): Promise<boolean> =>
      handleResult(await useCases.copy.execute(note.content), () => play('click')),
    [useCases, note.content, play],
  );

  const clear = useCallback(() => {
    confirmAction({
      title: 'Notu temizle',
      message: 'Notu temizlemek istediğinden emin misin?',
      confirmText: 'Temizle',
      cancelText: 'Vazgeç',
      destructive: true,
      onConfirm: () => {
        pending.current = null;
        if (timer.current) clearTimeout(timer.current);
        void useCases.clear.execute().then((result) =>
          handleResult(result, (value) => {
            patch('notes', value);
            play('delete');
          }),
        );
      },
    });
  }, [useCases, patch, play]);

  return { content: note.content, setContent, copy, clear };
}
