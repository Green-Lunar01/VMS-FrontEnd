"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NotificationsDrawer } from "@/components/dashboard/NotificationsDrawer";
import type { NavItem } from "@/lib/nav-config";
import type { AppNotification } from "@/lib/types";

export function DashboardShell({
  navItems,
  userName,
  userPhotoUrl,
  notifications = [],
  institutionName,
  shortName,
  showVisitorShortcuts = true,
  onShowSignedIn,
  onShowSignedOut,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  userPhotoUrl?: string;
  notifications?: AppNotification[];
  institutionName?: string;
  shortName?: string;
  showVisitorShortcuts?: boolean;
  onShowSignedIn?: () => void;
  onShowSignedOut?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-grey">
      <Sidebar
        items={navItems}
        institutionName={institutionName}
        shortName={shortName}
        onLogout={() => router.push("/login")}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={userName}
          userPhotoUrl={userPhotoUrl}
          onOpenNotifications={() => setNotifOpen(true)}
          onShowSignedIn={onShowSignedIn}
          onShowSignedOut={onShowSignedOut}
          showVisitorShortcuts={showVisitorShortcuts}
        />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} />
    </div>
  );
}
