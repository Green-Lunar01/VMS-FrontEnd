"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { Search01Icon } from "@hugeicons/core-free-icons";

/** The bordered search field used in every list toolbar. */
export function SearchField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
        <Icon icon={Search01Icon} size={18} strokeWidth={1.75} />
      </span>
      <input
        type="text"
        placeholder="Search"
        className="h-12 w-full rounded-[4px] border border-border bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary"
        {...props}
      />
    </div>
  );
}

/** The toolbar strip that sits at the top of a list card, above a divider. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 border-b border-divider px-6 py-5 2xl:flex-nowrap", className)}>
      {children}
    </div>
  );
}
