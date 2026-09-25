"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

/**
 * Text tabs with a green active label — used on Analytics ("Overview / Admins /
 * Residents") and Profile ("Personal / Organization").
 */
export function TextTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-9", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "pb-1 text-sm transition-colors",
            item.value === value ? "font-semibold text-primary" : "text-muted hover:text-ink",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Soft pill tabs — used on Contractors ("Add new contractor / Contractor list /
 * Check-in/Check-out contractor"). Active is solid green, inactive is grey.
 */
export function PillTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-[6px] px-4 py-2.5 text-sm transition-colors",
            item.value === value
              ? "bg-primary font-semibold text-white"
              : "bg-grey text-muted hover:text-ink",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Solid/outline button pair — used on Admins/Users ("Users" filled, "Role" outlined).
 */
export function ButtonTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "h-11 min-w-[86px] rounded-[6px] px-5 text-sm font-semibold transition-colors",
            item.value === value
              ? "bg-primary text-white"
              : "border border-primary bg-white text-primary hover:bg-primary-light",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
