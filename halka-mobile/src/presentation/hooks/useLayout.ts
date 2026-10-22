// Halka düzeni: aktif eklentiler, katalog, ekleme/çıkarma
import { useCallback, useMemo } from 'react';
import type { WidgetId } from '@domain/entities/WidgetId';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { useUiStore } from '@presentation/store/useUiStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useLayout() {
  const activeIds = useSnapshotSlice('activeWidgetIds');
  const patch = useHalkaStore((s) => s.patch);
  const pulseRing = useUiStore((s) => s.pulseRing);
  const setCurrentAmbient = useUiStore((s) => s.setCurrentAmbient);
  const { layout } = useDI();
  const play = useSoundEffect();

  const catalog = useMemo(() => layout.getCatalog.execute(activeIds), [layout, activeIds]);

  const addWidget = useCallback(
    async (id: WidgetId): Promise<boolean> =>
      handleResult(await layout.addWidget.execute(id), (ids) => {
        patch('activeWidgetIds', ids);
        play('success');
        pulseRing();
      }),
    [layout, patch, play, pulseRing],
  );

  const removeWidget = useCallback(
    async (id: WidgetId): Promise<boolean> =>
      handleResult(await layout.removeWidget.execute(id), (ids) => {
        patch('activeWidgetIds', ids);
        play('delete');
        pulseRing();
        if (id === 'ambient') setCurrentAmbient(null);
      }),
    [layout, patch, play, pulseRing, setCurrentAmbient],
  );

  return { activeIds, catalog, addWidget, removeWidget };
}
