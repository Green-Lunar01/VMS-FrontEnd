import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NAV_ITEMS } from "@/lib/nav-config";
import { DEFAULT_SESSIONS } from "@/lib/mock-session";
import { mockNotifications } from "@/data/mock-data";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const session = DEFAULT_SESSIONS.institution_admin;

  return (
    <DashboardShell
      navItems={NAV_ITEMS.institution_admin}
      userName={session.name}
      notifications={mockNotifications}
    >
      {children}
    </DashboardShell>
  );
}
