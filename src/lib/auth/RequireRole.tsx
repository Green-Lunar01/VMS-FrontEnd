"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, ROLE_HOME } from "@/lib/auth/AuthProvider";
import type { Role } from "@/lib/types";

/**
 * Route guard for a dashboard section. Sends signed-out users to login, users in
 * the wrong dashboard to their own, and anyone still carrying
 * `mustChangePassword` to the forced change-password screen first (§3).
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const onChangePassword = pathname?.endsWith("/change-password");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(ROLE_HOME[user.role]);
      return;
    }
    if (user.mustChangePassword && !onChangePassword) {
      router.replace("/change-password");
    }
  }, [user, loading, role, router, onChangePassword]);

  if (loading || !user || user.role !== role || (user.mustChangePassword && !onChangePassword)) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grey">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-border border-t-primary" />
    </div>
  );
}
