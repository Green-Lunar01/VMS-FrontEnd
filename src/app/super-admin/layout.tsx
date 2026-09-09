"use client";

import type { ReactNode } from "react";
import { PlatformShell } from "@/components/layout/PlatformShell";
import { RequireRole } from "@/lib/auth/RequireRole";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="super_admin">
      <PlatformShell>{children}</PlatformShell>
    </RequireRole>
  );
}
