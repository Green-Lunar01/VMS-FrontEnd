"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints";
import { setSessionExpiredHandler } from "@/lib/api/client";
import {
  clearStoredSession,
  getStoredTokens,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
} from "@/lib/auth/storage";
import type { Role, User } from "@/lib/types";

/** Where each role lands after logging in. */
export const ROLE_HOME: Record<Role, string> = {
  institution_admin: "/admin/home",
  security_officer: "/security/home",
  host: "/host/dashboard",
  super_admin: "/super-admin/dashboard",
};

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from storage, then confirm the session is still good.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = getStoredUser();
      const { accessToken } = getStoredTokens();

      if (!stored || !accessToken) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setUserState(stored);

      const fresh = await usersMeSafe();
      if (cancelled) return;
      if (fresh) {
        setUserState(fresh);
        setStoredUser(fresh);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A failed refresh means the session is gone — bounce to login.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUserState(null);
      router.replace("/login");
    });
    return () => setSessionExpiredHandler(null);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setStoredTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setStoredUser(res.user);
    setUserState(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Same route for all four dashboards; revokes the refresh token server-side.
      await authApi.logout();
    } catch {
      /* even if the call fails, drop local state so the device is signed out */
    }
    clearStoredSession();
    setUserState(null);
    router.replace("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const fresh = await usersMeSafe();
    if (fresh) {
      setUserState(fresh);
      setStoredUser(fresh);
    }
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    setStoredUser(next);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser, setUser }),
    [user, loading, login, logout, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function usersMeSafe(): Promise<User | null> {
  try {
    const { usersApi } = await import("@/lib/api/endpoints");
    return await usersApi.me();
  } catch {
    return null;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
