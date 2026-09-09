"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NotificationsDrawer } from "@/components/dashboard/NotificationsDrawer";
import type { NavItem } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth/AuthProvider";

export function DashboardShell({
  navItems,
  userName,
  userPhotoUrl,
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
  institutionName?: string;
  shortName?: string;
  showVisitorShortcuts?: boolean;
  onShowSignedIn?: () => void;
  onShowSignedOut?: () => void;
  children: ReactNode;
}) {
  const { logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-grey">
      <Sidebar
        items={navItems}
        institutionName={institutionName}
        shortName={shortName}
        onLogout={logout}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          userName={userName}
          userPhotoUrl={userPhotoUrl}
          onOpenNotifications={() => setNotifOpen(true)}
          onShowSignedIn={onShowSignedIn}
          onShowSignedOut={onShowSignedOut}
          showVisitorShortcuts={showVisitorShortcuts}
        />
        {/* Only this pane scrolls, so the sidebar and topbar never move out of view. */}
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
