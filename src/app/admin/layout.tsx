"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NAV_ITEMS } from "@/lib/nav-config";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="institution_admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <DashboardShell navItems={NAV_ITEMS.institution_admin} userName={user?.name ?? ""} userPhotoUrl={user?.photoUrl}>
      {children}
    </DashboardShell>
  );
}
