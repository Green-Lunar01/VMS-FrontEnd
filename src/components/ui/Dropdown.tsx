"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";

export interface DropdownOption {
  label: string;
  value: string;
}

/**
 * The filter dropdown used across the dashboards: a bordered white trigger with a
 * chevron, opening a white panel whose selected row is solid green with white text.
 */
export function Dropdown({
  value,
  options,
  onChange,
  className,
  icon = "chevron",
  align = "start",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  icon?: "chevron" | "calendar";
  align?: "start" | "end";
}) {
  const current = options.find((o) => o.value === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "flex h-12 items-center justify-between gap-3 rounded-[4px] border border-border bg-white px-4 text-sm text-ink outline-none transition-colors hover:border-muted focus:border-primary",
          className,
        )}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <Icon icon={icon === "calendar" ? Calendar03Icon : ArrowDown01Icon} size={18} strokeWidth={1.75} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={4}
          className="z-50 max-h-[320px] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-[4px] border border-border bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              className={cn(
                "cursor-pointer px-4 py-2.5 text-sm outline-none",
                opt.value === value ? "bg-primary font-medium text-white" : "text-ink hover:bg-grey",
              )}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
