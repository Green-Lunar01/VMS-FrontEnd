"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import type { NavItem } from "@/lib/nav-config";
import { InstitutionCrest } from "@/components/layout/InstitutionCrest";
import { useInstitutionBrand } from "@/lib/institution/InstitutionBrandContext";

export function Sidebar({
  items,
  onLogout,
}: {
  items: NavItem[];
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const brand = useInstitutionBrand();
  const institutionName = brand?.name ?? "Institution";

  return (
    <aside className="flex h-full w-[235px] shrink-0 flex-col overflow-y-auto border-r border-divider bg-white">
      <div className="flex flex-col items-center gap-1 px-4 pb-6 pt-5" title={institutionName}>
        <InstitutionCrest size={108} src={brand?.logoUrl} name={institutionName} />
        <p className="max-w-full break-words text-center font-display text-[22px] leading-tight text-primary">
          {institutionName}
        </p>
      </div>
      <div className="border-t border-divider" />

      <nav className="flex flex-1 flex-col gap-1 py-5">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-7 py-3 text-[15px] transition-colors",
                active ? "bg-nav-active font-medium text-primary" : "text-ink hover:bg-grey/60",
              )}
            >
              <Icon icon={item.icon} size={22} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={onLogout}
          className="mt-8 flex items-center gap-4 px-7 py-3 text-[15px] text-red transition-colors hover:bg-red-light"
        >
          <Icon icon={Logout03Icon} size={22} strokeWidth={1.6} />
          Log out
        </button>
      </nav>

      <div className="flex justify-center px-4 pb-6">
        <Image src="/branding/green-lunar.png" alt="Green Lunar Nigeria Limited" width={74} height={56} />
      </div>
    </aside>
  );
}
