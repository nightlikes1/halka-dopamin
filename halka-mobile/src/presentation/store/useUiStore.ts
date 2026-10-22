// Kalıcı olmayan arayüz durumu: küçültülmüş kartlar, çalan ortam sesi, halka nabzı
import { create } from 'zustand';
import type { AmbientType } from '@domain/entities/Audio';
import type { WidgetId } from '@domain/entities/WidgetId';

interface UiStoreState {
  readonly collapsed: Partial<Record<WidgetId, boolean>>;
  readonly allCollapsed: boolean;
  readonly currentAmbient: AmbientType | null;
  readonly ringPulseKey: number;
  toggleCollapsed(id: WidgetId): void;
  setAllCollapsed(ids: readonly WidgetId[], collapsed: boolean): void;
  setCurrentAmbient(type: AmbientType | null): void;
  pulseRing(): void;
}

export const useUiStore = create<UiStoreState>()((set) => ({
  collapsed: {},
  allCollapsed: false,
  currentAmbient: null,
  ringPulseKey: 0,
  toggleCollapsed: (id) =>
    set((state) => ({ collapsed: { ...state.collapsed, [id]: !state.collapsed[id] } })),
  setAllCollapsed: (ids, collapsed) =>
    set({
      allCollapsed: collapsed,
      collapsed: Object.fromEntries(ids.map((id) => [id, collapsed])),
    }),
  setCurrentAmbient: (type) => set({ currentAmbient: type }),
  pulseRing: () => set((state) => ({ ringPulseKey: state.ringPulseKey + 1 })),
}));
