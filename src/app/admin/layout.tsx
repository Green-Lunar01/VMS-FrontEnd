"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InstitutionLogoGate } from "@/components/dashboard/InstitutionLogoGate";
import { NAV_ITEMS } from "@/lib/nav-config";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";
import { InstitutionBrandProvider } from "@/lib/institution/InstitutionBrandContext";
import { institutionsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="institution_admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: institution, setData: setInstitution } = useApi(() => institutionsApi.me(), []);

  // Rendered optimistically rather than blocked on this fetch resolving —
  // the common case (an institution that already has a logo) then costs no
  // extra wait at all, and the page's own data fetches start in parallel
  // instead of queued behind this one. Only a brand-new institution's very
  // first post-password-change login briefly shows the dashboard before
  // this gate takes over once the fetch comes back with no logoUrl.
  if (institution && !institution.logoUrl) {
    return <InstitutionLogoGate institutionName={institution.name} onDone={setInstitution} />;
  }

  return (
    <InstitutionBrandProvider
      value={
        institution
          ? { name: institution.name, logoUrl: institution.logoUrl, address: institution.address }
          : null
      }
    >
      <DashboardShell navItems={NAV_ITEMS.institution_admin} userName={user?.name ?? ""} userPhotoUrl={user?.photoUrl}>
        {children}
      </DashboardShell>
    </InstitutionBrandProvider>
  );
}
