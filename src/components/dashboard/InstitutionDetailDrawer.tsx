"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Cancel01Icon, MoreHorizontalIcon, ViewIcon, ViewOffSlashIcon, Home01Icon } from "@hugeicons/core-free-icons";
import type { Institution } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-[7px]">
      <span className="w-[140px] shrink-0 text-sm text-muted">{label}:</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

/**
 * Institution details slide-over opened from a row in the Institutions list.
 * "..." toggles activate/deactivate; "Act as User" is the impersonation flow.
 */
export function InstitutionDetailDrawer({
  institution,
  open,
  onClose,
  onToggleStatus,
  onImpersonate,
}: {
  institution: Institution | null;
  open: boolean;
  onClose: () => void;
  onToggleStatus?: (institution: Institution) => void;
  onImpersonate?: (institution: Institution) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Institution details"
      width={420}
      header={
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <span className="text-lg font-semibold text-ink">Institution details</span>
          <Dialog.Close className="text-ink transition-opacity hover:opacity-60" aria-label="Close">
            <Icon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
          </Dialog.Close>
        </div>
      }
    >
      {institution && (
        <div className="px-7 pb-10">
          <div className="relative flex justify-end pt-4">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-ink transition-opacity hover:opacity-60"
              aria-label="More options"
            >
              <Icon icon={MoreHorizontalIcon} size={22} strokeWidth={2} />
            </button>
            {menuOpen && (
              <div className="absolute right-7 top-9 z-10 rounded-[4px] border border-border bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus?.(institution);
                  }}
                  className="block w-full whitespace-nowrap px-5 py-2 text-left text-sm text-ink hover:bg-grey"
                >
                  {institution.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center pb-7">
            <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-blue text-white">
              <Icon icon={Home01Icon} size={46} strokeWidth={1.6} />
            </div>
          </div>

          <Row label="Organization name" value={institution.name} />
          <Row label="Email address" value={institution.email} />
          <Row label="Organization address" value={institution.address} />
          <Row label="Phone number" value={institution.phone} />

          <div className="flex items-start gap-4 py-[7px]">
            <span className="w-[140px] shrink-0 text-sm text-muted">Password:</span>
            <span className="flex flex-1 items-center justify-between gap-3 text-sm text-ink">
              {showPassword ? "StrongPass1!" : "****************"}
              <button
                onClick={() => setShowPassword((s) => !s)}
                className="text-ink hover:opacity-60"
                aria-label="Toggle password"
              >
                <Icon icon={showPassword ? ViewIcon : ViewOffSlashIcon} size={19} strokeWidth={1.6} />
              </button>
            </span>
          </div>

          <Button variant="outline" fullWidth className="mt-9 h-[52px]" onClick={() => onImpersonate?.(institution)}>
            Act as User
          </Button>
        </div>
      )}
    </Drawer>
  );
}
