"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { InstitutionCrest } from "@/components/layout/InstitutionCrest";
import { useInstitutionBrand } from "@/lib/institution/InstitutionBrandContext";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/icons/Icon";
import { Call02Icon, Notification01Icon, UserGroup03Icon, Logout03Icon } from "@hugeicons/core-free-icons";
import { NotificationsDrawer } from "@/components/dashboard/NotificationsDrawer";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Officer/Soldier (host) shell: crest sidebar with a single "Visitor" entry, and a
 * bare topbar with call, notifications and the account avatar.
 */
export function HostShell({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const brand = useInstitutionBrand();
  const institutionName = brand?.name ?? "Institution";
  const [notifOpen, setNotifOpen] = useState(false);
  const active = pathname?.startsWith("/host/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-grey">
      <aside className="hidden h-full w-[196px] shrink-0 flex-col overflow-y-auto border-r border-divider bg-white md:flex">
        <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-4" title={institutionName}>
          <InstitutionCrest size={96} src={brand?.logoUrl} name={institutionName} />
          <p className="max-w-full break-words text-center font-display text-[20px] leading-tight text-primary">
            {institutionName}
          </p>
        </div>
        <div className="border-t border-divider" />

        <nav className="flex flex-1 flex-col gap-1 py-5">
          <Link
            href="/host/dashboard"
            className={cn(
              "flex items-center gap-3.5 px-6 py-3 text-[15px] transition-colors",
              active ? "bg-nav-active font-medium text-primary" : "text-ink hover:bg-grey/60",
            )}
          >
            <Icon icon={UserGroup03Icon} size={22} strokeWidth={1.6} />
            Visitor
          </Link>

          <button
            onClick={logout}
            className="mt-6 flex items-center gap-3.5 px-6 py-3 text-[15px] text-red transition-colors hover:bg-red-light"
          >
            <Icon icon={Logout03Icon} size={22} strokeWidth={1.6} />
            Log out
          </button>
        </nav>

        <div className="flex justify-center px-4 pb-6">
          <Image src="/branding/green-lunar.png" alt="Green Lunar Nigeria Limited" width={74} height={56} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[84px] w-full shrink-0 items-center justify-end gap-5 border-b border-divider bg-white px-6 sm:px-10">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-white transition-opacity hover:opacity-90"
            aria-label="Call"
          >
            <Icon icon={Call02Icon} size={18} strokeWidth={1.9} />
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors hover:bg-grey"
            aria-label="Notifications"
          >
            <Icon icon={Notification01Icon} size={19} strokeWidth={1.75} />
          </button>
          <Link href="/host/profile" className="flex flex-col items-center gap-1">
            <Avatar name={userName} size={48} className="bg-red" />
            <span className="text-xs text-ink">{userName}</span>
          </Link>
        </header>

        {/* Only this pane scrolls, so the sidebar and header never move out of view. */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
