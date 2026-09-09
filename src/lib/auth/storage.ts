import type { User } from "@/lib/types";

const ACCESS_KEY = "dhq-vms.accessToken";
const REFRESH_KEY = "dhq-vms.refreshToken";
const USER_KEY = "dhq-vms.user";

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

function safeGet(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — session simply won't persist */
  }
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getStoredTokens(): StoredTokens {
  return { accessToken: safeGet(ACCESS_KEY), refreshToken: safeGet(REFRESH_KEY) };
}

export function setStoredTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  safeSet(ACCESS_KEY, accessToken);
  safeSet(REFRESH_KEY, refreshToken);
}

export function getStoredUser(): User | null {
  const raw = safeGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  safeSet(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  safeRemove(ACCESS_KEY);
  safeRemove(REFRESH_KEY);
  safeRemove(USER_KEY);
}
