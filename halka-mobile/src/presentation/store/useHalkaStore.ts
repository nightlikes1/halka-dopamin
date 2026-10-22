// Kalıcı verinin ekrandaki kopyası (Zustand). Yalnızca use case sonuçlarıyla güncellenir.
import { create } from 'zustand';
import { toIsoDate } from '@core/utils/date';
import { createDefaultSnapshot } from '@domain/entities/defaults';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';

export type LoadStatus = 'loading' | 'ready' | 'error';

interface HalkaStoreState {
  readonly status: LoadStatus;
  readonly errorMessage: string | null;
  readonly snapshot: HalkaSnapshot;
  setLoading(): void;
  setSnapshot(snapshot: HalkaSnapshot): void;
  setError(message: string): void;
  patch<K extends keyof HalkaSnapshot>(key: K, value: HalkaSnapshot[K]): void;
}

export const useHalkaStore = create<HalkaStoreState>()((set) => ({
  status: 'loading',
  errorMessage: null,
  snapshot: createDefaultSnapshot(toIsoDate(new Date())),
  setLoading: () => set({ status: 'loading', errorMessage: null }),
  setSnapshot: (snapshot) => set({ snapshot, status: 'ready', errorMessage: null }),
  setError: (message) => set({ status: 'error', errorMessage: message }),
  patch: (key, value) => set((state) => ({ snapshot: { ...state.snapshot, [key]: value } })),
}));

// Tek bir bölümü seçmek için kısa yol
export function useSnapshotSlice<K extends keyof HalkaSnapshot>(key: K): HalkaSnapshot[K] {
  return useHalkaStore((state) => state.snapshot[key]);
}
