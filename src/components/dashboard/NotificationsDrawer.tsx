"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/icons/Icon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AppNotification } from "@/lib/types";

/** Relative time in the wording used in the Figma feed ("Now", "3 minutes ago"). */
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function NotificationsDrawer({
  open,
  onClose,
  notifications,
}: {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      width={420}
      header={
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <span className="text-lg font-semibold text-ink">Notifications</span>
          <Dialog.Close className="text-ink transition-opacity hover:opacity-60" aria-label="Close">
            <Icon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
          </Dialog.Close>
        </div>
      }
    >
      <div className="relative">
        {notifications.length === 0 && <EmptyState label="No notifications yet" />}
        {notifications.map((n) => (
          <div key={n._id} className="flex items-start justify-between gap-4 border-b border-divider px-6 py-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{n.title}</p>
              <p className="mt-0.5 text-sm text-primary">{n.subject}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs text-muted">{relativeTime(n.createdAt)}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
