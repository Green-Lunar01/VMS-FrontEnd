"use client";

import type { ReactNode } from "react";
import { HostShell } from "@/components/layout/HostShell";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";
import { InstitutionBrandProvider } from "@/lib/institution/InstitutionBrandContext";
import { institutionsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="host">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: brand } = useApi(() => institutionsApi.myBrand(), []);

  return (
    <InstitutionBrandProvider value={brand ?? null}>
      <HostShell userName={user?.name ?? ""}>{children}</HostShell>
    </InstitutionBrandProvider>
  );
}
