"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/icons/Icon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { notificationsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { cn } from "@/lib/utils";
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

export function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, loading, error, setData } = useApi<AppNotification[]>(
    () => notificationsApi.list(),
    [open],
    open,
  );

  const notifications = data ?? [];

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      setData((prev) => (prev ?? []).map((n) => ({ ...n, read: true })));
    } catch {
      /* leave the list as-is; the next open re-fetches */
    }
  }

  async function markRead(n: AppNotification) {
    if (n.read) return;
    try {
      await notificationsApi.markRead(n._id);
      setData((prev) => (prev ?? []).map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    } catch {
      /* ignore */
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      width={420}
      header={
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <span className="text-lg font-semibold text-ink">Notifications</span>
          <div className="flex items-center gap-4">
            {notifications.some((n) => !n.read) && (
              <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">
                Mark all as read
              </button>
            )}
            <Dialog.Close className="text-ink transition-opacity hover:opacity-60" aria-label="Close">
              <Icon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
            </Dialog.Close>
          </div>
        </div>
      }
    >
      {loading && <p className="px-6 py-6 text-sm text-muted">Loading…</p>}
      {error && !loading && <p className="px-6 py-6 text-sm text-red">{error}</p>}
      {!loading && !error && notifications.length === 0 && <EmptyState label="No notifications yet" />}

      {notifications.map((n) => (
        <button
          key={n._id}
          onClick={() => markRead(n)}
          className={cn(
            "flex w-full items-start justify-between gap-4 border-b border-divider px-6 py-4 text-left transition-colors hover:bg-grey/50",
            !n.read && "bg-primary-light/30",
          )}
        >
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">{n.title}</p>
            {n.message && <p className="mt-0.5 text-sm text-primary">{n.message}</p>}
          </div>
          <span className="shrink-0 pt-0.5 text-xs text-muted">{relativeTime(n.createdAt)}</span>
        </button>
      ))}
    </Drawer>
  );
}
