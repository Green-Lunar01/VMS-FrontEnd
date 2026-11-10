"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NAV_ITEMS } from "@/lib/nav-config";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Procurement Admin is scoped narrowly to contractor review only — no
 * visitor/officer/dispatch access, and `GET /institutions/me/brand` doesn't
 * list this role among its allowed callers, so unlike the other dashboards
 * this one skips InstitutionBrandProvider entirely (the sidebar falls back
 * to a plain "Institution" label with no logo, which is fine here).
 */
export default function ProcurementLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="procurement_admin">
      <ProcurementShell>{children}</ProcurementShell>
    </RequireRole>
  );
}

function ProcurementShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <DashboardShell
      navItems={NAV_ITEMS.procurement_admin}
      userName={user?.name ?? ""}
      userPhotoUrl={user?.photoUrl}
      showVisitorShortcuts={false}
    >
      {children}
    </DashboardShell>
  );
}
