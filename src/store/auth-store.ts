import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import type { TokenPair, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setSession: (user: User, tokens: Pick<TokenPair, "access_token" | "refresh_token">) => void;
  setTokens: (tokens: Pick<TokenPair, "access_token" | "refresh_token">) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

/**
 * JWT access + refresh tokens persisted in localStorage.
 * Hydration is manual (see Providers) to avoid SSR/client mismatches.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setSession: (user, tokens) =>
        set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
      setTokens: (tokens) =>
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.accessToken && s.user);
