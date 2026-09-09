"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import {
  DashboardCircleIcon,
  Call02Icon,
  Notification01Icon,
  UserGroup03Icon,
} from "@hugeicons/core-free-icons";

export function Topbar({
  userName,
  userPhotoUrl,
  onOpenNotifications,
  onShowSignedIn,
  onShowSignedOut,
  showVisitorShortcuts = true,
  actions,
}: {
  userName: string;
  userPhotoUrl?: string;
  onOpenNotifications?: () => void;
  onShowSignedIn?: () => void;
  onShowSignedOut?: () => void;
  showVisitorShortcuts?: boolean;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[84px] w-full shrink-0 items-center border-b border-divider bg-white px-11">
      <button className="text-ink transition-opacity hover:opacity-60" aria-label="Menu">
        <Icon icon={DashboardCircleIcon} size={24} strokeWidth={1.75} />
      </button>

      {showVisitorShortcuts && (
        <div className="ml-auto mr-auto hidden items-center gap-[86px] lg:flex">
          <button onClick={onShowSignedIn} className="flex items-center gap-2.5 text-sm text-ink">
            <Icon icon={UserGroup03Icon} size={22} strokeWidth={1.75} color="var(--color-primary)" />
            Signed In Visitors
          </button>
          <button onClick={onShowSignedOut} className="flex items-center gap-2.5 text-sm text-ink">
            <Icon icon={UserGroup03Icon} size={22} strokeWidth={1.75} color="var(--color-red)" />
            Signed Out Visitors
          </button>
        </div>
      )}

      <div className={`flex items-center gap-5 ${showVisitorShortcuts ? "" : "ml-auto"}`}>
        {actions}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-white transition-opacity hover:opacity-90"
          aria-label="Call"
        >
          <Icon icon={Call02Icon} size={18} strokeWidth={1.9} />
        </button>
        <button
          onClick={onOpenNotifications}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors hover:bg-grey"
          aria-label="Notifications"
        >
          <Icon icon={Notification01Icon} size={19} strokeWidth={1.75} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <Avatar name={userName} src={userPhotoUrl} size={48} />
          <span className="text-xs text-ink">{userName}</span>
        </div>
      </div>
    </header>
  );
}
