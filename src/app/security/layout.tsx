"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NAV_ITEMS } from "@/lib/nav-config";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";
import { InstitutionBrandProvider } from "@/lib/institution/InstitutionBrandContext";
import { institutionsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="security_officer">
      <SecurityShell>{children}</SecurityShell>
    </RequireRole>
  );
}

function SecurityShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: brand } = useApi(() => institutionsApi.myBrand(), []);

  return (
    <InstitutionBrandProvider value={brand ?? null}>
      <DashboardShell navItems={NAV_ITEMS.security_officer} userName={user?.name ?? ""} userPhotoUrl={user?.photoUrl}>
        {children}
      </DashboardShell>
    </InstitutionBrandProvider>
  );
}
