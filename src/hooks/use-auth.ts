"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { homeForUser, safeNext } from "@/lib/auth";
import type { AuthResult } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setSession = useAuthStore((s) => s.setSession);

  /** Persist the session then route to the right home (or `next`). */
  const completeAuth = useCallback(
    (result: AuthResult, next?: string | null) => {
      setSession(result.user, result.tokens);
      queryClient.clear();
      router.replace(safeNext(next) ?? homeForUser(result.user));
    },
    [queryClient, router, setSession],
  );

  const logout = useCallback(async () => {
    const { refreshToken, clear } = useAuthStore.getState();
    try {
      await authService.logout(refreshToken);
    } catch {
      // Logging out locally is enough if the API is unreachable.
    }
    clear();
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  return { user, hasHydrated, completeAuth, logout };
}
