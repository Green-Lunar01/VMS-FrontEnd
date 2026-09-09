"use client";

import type { ReactNode } from "react";
import { HostShell } from "@/components/layout/HostShell";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="host">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <HostShell userName={user?.name ?? ""}>{children}</HostShell>;
}
