"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/icons/Icon";
import { ArrowLeft01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { ID_TYPE_LABEL, VISITOR_TYPE_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { Visitor } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-4 py-[7px]">
      <span className="w-[135px] shrink-0 text-sm text-muted">{label}:</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export function VisitorDetailDrawer({
  visitor,
  open,
  onClose,
  onBlacklist,
  canBlacklist = true,
}: {
  visitor: Visitor | null;
  open: boolean;
  onClose: () => void;
  onBlacklist?: (visitor: Visitor) => void;
  canBlacklist?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Visitor details"
      width={412}
      header={
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <Dialog.Close className="text-ink transition-opacity hover:opacity-60" aria-label="Back">
            <Icon icon={ArrowLeft01Icon} size={22} strokeWidth={1.75} />
          </Dialog.Close>
        </div>
      }
    >
      {visitor && (
        <div className="relative px-7 pb-10">
          {canBlacklist && (
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
                      onBlacklist?.(visitor);
                    }}
                    className="block w-full px-5 py-2 text-left text-sm text-ink hover:bg-grey"
                  >
                    {visitor.blacklisted ? "Remove from blacklist" : "Blacklist"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-2 pb-6">
            <div className="relative">
              <Image
                src={visitor.photoUrl || "/branding/avatar-placeholder.png"}
                alt=""
                width={128}
                height={128}
                className="h-32 w-32 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white ${
                  visitor.status === "signed_in" ? "bg-primary" : "bg-red"
                }`}
              />
            </div>
            <p className="text-lg font-bold text-ink">{visitor.name}</p>
            <p className="text-sm text-muted">{VISITOR_TYPE_LABEL[visitor.visitorType]}</p>
          </div>

          <div>
            <Row label="Host name" value={visitor.host.name} />
            <Row label="Phone number" value={visitor.phone} />
            <Row label="Host Rank" value={visitor.host.rank} />
            <Row label="Visitor's Country" value={visitor.country} />
            <Row label="ID type" value={ID_TYPE_LABEL[visitor.idType]} />
            <Row label="Host Department" value={visitor.host.department} />
            <Row label="Escort" value={visitor.escortCount} />
            <Row label="Escort names" value={visitor.escortNames.join(", ")} />
            <Row label="Expected date" value={formatDate(visitor.expectedDate)} />
            <Row label="Expected time (FRO/TO)" value={`${visitor.expectedTimeFrom} - ${visitor.expectedTimeTo}`} />
            <Row label="Signed In time" value={visitor.signInTime} />
            <Row label="Appointment end time" value={visitor.appointmentEndTime} />
            <Row label="Sign in agent" value={visitor.signInAgent} />
            <Row label="Sign out time" value={visitor.signOutTime} />
            <Row label="Sign out agent" value={visitor.signOutAgent} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
