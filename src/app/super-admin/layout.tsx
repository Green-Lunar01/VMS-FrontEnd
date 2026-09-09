import type { ReactNode } from "react";
import { PlatformShell } from "@/components/layout/PlatformShell";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
