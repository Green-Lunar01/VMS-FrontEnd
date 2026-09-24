"use client";

import { PhotoBlock } from "@/components/pages/ProfileView";
import type { Institution } from "@/lib/types";

/**
 * Shown once, right after an Institution Admin's forced password change,
 * for institutions that have never uploaded a logo — mirrors mustChangePassword
 * in that it blocks the dashboard until done, since every screen elsewhere
 * (sidebar, contractor permits) now shows this institution's own branding
 * instead of a generic placeholder.
 */
export function InstitutionLogoGate({
  institutionName,
  onDone,
}: {
  institutionName: string;
  onDone: (institution: Institution) => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grey px-6 py-12">
      <div className="w-full max-w-[480px] rounded-[8px] border border-border bg-white p-8">
        <h1 className="text-lg font-bold text-ink">Set up {institutionName}</h1>
        <p className="mt-1 text-sm text-muted">
          Add your institution&apos;s logo — it&apos;ll appear in the sidebar and on printed
          contractor permits for everyone at {institutionName}.
        </p>
        <div className="mt-6">
          <PhotoBlock isOrganization onOrgUploaded={onDone} />
        </div>
      </div>
    </div>
  );
}
