import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NAV_ITEMS } from "@/lib/nav-config";
import { DEFAULT_SESSIONS } from "@/lib/mock-session";
import { mockNotifications } from "@/data/mock-data";

export default function SecurityLayout({ children }: { children: ReactNode }) {
  const session = DEFAULT_SESSIONS.security_officer;

  return (
    <DashboardShell
      navItems={NAV_ITEMS.security_officer}
      userName={session.name}
      notifications={mockNotifications}
    >
      {children}
    </DashboardShell>
  );
}
