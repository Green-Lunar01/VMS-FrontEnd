import type { ReactNode } from "react";
import { HostShell } from "@/components/layout/HostShell";
import { DEFAULT_SESSIONS } from "@/lib/mock-session";
import { mockNotifications } from "@/data/mock-data";

export default function HostLayout({ children }: { children: ReactNode }) {
  const session = DEFAULT_SESSIONS.host;
  return (
    <HostShell userName={session.name} notifications={mockNotifications}>
      {children}
    </HostShell>
  );
}
