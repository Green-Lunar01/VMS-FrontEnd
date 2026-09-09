// Design-phase stand-in for real auth. Once the backend is wired up this whole
// module is replaced by the accessToken/refreshToken flow in FRONTEND_INTEGRATION_GUIDE.md.
import type { Role } from "@/lib/types";

export interface MockSession {
  role: Role;
  name: string;
  email: string;
}

const STORAGE_KEY = "dhq-vms-mock-session";

export const DEFAULT_SESSIONS: Record<Role, MockSession> = {
  institution_admin: { role: "institution_admin", name: "Boye John", email: "dhq@greenlunar.com" },
  security_officer: { role: "security_officer", name: "Ada Security", email: "ada.security@dhq.mil.ng" },
  host: { role: "host", name: "Musa John", email: "musa.john@dhq.mil.ng" },
  super_admin: { role: "super_admin", name: "Greenlunar Admin", email: "superadmin@greenlunar.com" },
};

// Naming convention only, so reviewers can jump into any of the four dashboards
// from the one pixel-accurate login screen before real role-based auth exists.
export function resolveRoleFromEmail(email: string): Role {
  const value = email.toLowerCase();
  if (value.includes("super")) return "super_admin";
  if (value.includes("security")) return "security_officer";
  if (value.includes("musa") || value.includes("host") || value.includes("officer")) return "host";
  return "institution_admin";
}

export function setMockSession(session: MockSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getMockSession(role: Role): MockSession {
  if (typeof window === "undefined") return DEFAULT_SESSIONS[role];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SESSIONS[role];
    const parsed = JSON.parse(raw) as MockSession;
    return parsed.role === role ? parsed : DEFAULT_SESSIONS[role];
  } catch {
    return DEFAULT_SESSIONS[role];
  }
}

export const ROLE_HOME: Record<Role, string> = {
  institution_admin: "/admin/home",
  security_officer: "/security/home",
  host: "/host/dashboard",
  super_admin: "/super-admin/dashboard",
};
