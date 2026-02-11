import { create } from 'zustand';

export type AuthState = 'loading' | 'authenticated' | 'guest' | 'unauthenticated';

interface AuthStore {
  state: AuthState;
  userId: string | null;
  setAuthState: (state: AuthState) => void;
  setUserId: (userId: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  state: 'loading',
  userId: null,
  setAuthState: (state) => set({ state }),
  setUserId: (userId) => set({ userId }),
  reset: () => set({ state: 'unauthenticated', userId: null }),
}));
