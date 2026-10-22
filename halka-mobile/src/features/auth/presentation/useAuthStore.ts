// Oturum durumu (Zustand)
import { create } from 'zustand';
import type { AuthSession } from '@features/auth/domain/entities';

export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthStoreState {
  readonly status: AuthStatus;
  readonly session: AuthSession | null;
  setSession(session: AuthSession | null): void;
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  status: 'restoring',
  session: null,
  setSession: (session) => set({ session, status: session ? 'signedIn' : 'signedOut' }),
}));
