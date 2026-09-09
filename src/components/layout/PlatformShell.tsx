"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import {
  DashboardSquare01Icon,
  BankIcon,
  UserGroup02Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";

const NAV = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: DashboardSquare01Icon },
  { label: "Institutions", href: "/super-admin/institutions", icon: BankIcon },
  { label: "Admins", href: "/super-admin/admins", icon: UserGroup02Icon },
];

/**
 * Greenlunar platform shell: Green Lunar branding in the sidebar, a bare topbar
 * with just the account avatar, and no institution-scoped shortcuts.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-grey">
      <aside className="sticky top-0 flex h-screen w-[186px] shrink-0 flex-col border-r border-divider bg-white">
        <div className="flex justify-center px-4 pb-8 pt-6">
          <Image src="/branding/green-lunar.png" alt="Green Lunar Nigeria Limited" width={100} height={76} />
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-6 py-3 text-[15px] transition-colors",
                  active ? "font-medium text-primary" : "text-ink hover:bg-grey/60",
                )}
              >
                <Icon icon={item.icon} size={22} strokeWidth={1.6} />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={() => router.push("/login")}
            className="mt-6 flex items-center gap-3.5 px-6 py-3 text-[15px] text-red transition-colors hover:bg-red-light"
          >
            <Icon icon={Logout03Icon} size={22} strokeWidth={1.6} />
            Log out
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[102px] w-full shrink-0 items-center justify-end border-b border-divider bg-white px-8">
          <Link href="/super-admin/profile">
            <Image
              src="/branding/avatar-placeholder.png"
              alt="Account"
              width={62}
              height={62}
              className="h-[62px] w-[62px] rounded-full object-cover"
            />
          </Link>
        </header>
        <main className="flex-1 px-6 py-5">{children}</main>
      </div>
    </div>
  );
}
