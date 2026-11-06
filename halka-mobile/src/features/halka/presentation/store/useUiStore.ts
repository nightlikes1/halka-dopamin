// Kalıcı olmayan arayüz durumu: küçültülmüş kartlar, çalan ortam sesi, halka nabzı
import { create } from 'zustand';
import type { AmbientType } from '@features/halka/domain/entities/Audio';
import type { WidgetId } from '@features/halka/domain/entities/WidgetId';

interface UiStoreState {
  readonly collapsed: Partial<Record<WidgetId, boolean>>;
  readonly currentAmbient: AmbientType | null;
  readonly ringPulseKey: number;
  toggleCollapsed(id: WidgetId): void;
  setCurrentAmbient(type: AmbientType | null): void;
  pulseRing(): void;
}

export const useUiStore = create<UiStoreState>()((set) => ({
  collapsed: {},
  currentAmbient: null,
  ringPulseKey: 0,
  toggleCollapsed: (id) =>
    set((state) => ({ collapsed: { ...state.collapsed, [id]: !state.collapsed[id] } })),
  setCurrentAmbient: (type) => set({ currentAmbient: type }),
  pulseRing: () => set((state) => ({ ringPulseKey: state.ringPulseKey + 1 })),
}));
