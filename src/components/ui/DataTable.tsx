"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  /** Fixed width, e.g. "160px" or "1fr". Defaults to 1fr. */
  width?: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

/**
 * The list table used across every dashboard: a gold (#d4af37) header with white
 * bold labels, white rows separated by hairlines, and a cream (#f5eccf) selected row.
 */
export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  avatarKey,
  emptyLabel = "No data yet",
  minHeight = 560,
  leadingAvatar = false,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  avatarKey?: (row: T) => string | undefined;
  emptyLabel?: string;
  minHeight?: number;
  leadingAvatar?: boolean;
}) {
  const template = [leadingAvatar ? "88px" : null, ...columns.map((c) => c.width ?? "1fr")]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative">
      {/* Gold header */}
      <div
        className="grid items-center rounded-t-[4px] bg-gold-header"
        style={{ gridTemplateColumns: template }}
      >
        {leadingAvatar && <div />}
        {columns.map((c) => (
          <div key={c.key} className={cn("truncate px-4 py-4 text-sm font-bold text-white", c.className)}>
            {c.header}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="relative overflow-hidden" style={{ minHeight }}>
        {rows.length === 0 ? (
          <div className="relative">
            <EmptyState label={emptyLabel} />
          </div>
        ) : (
          <div className="relative max-h-[600px] overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row._id}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                className={cn(
                  "grid items-center border-b border-divider transition-colors",
                  onRowClick && "cursor-pointer hover:bg-row-selected/50",
                  selectedId === row._id && "bg-row-selected hover:bg-row-selected",
                )}
                style={{ gridTemplateColumns: template }}
              >
                {leadingAvatar && (
                  <div className="flex justify-center py-3.5">
                    <Image
                      src={avatarKey?.(row) || "/branding/avatar-placeholder.png"}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  </div>
                )}
                {columns.map((c) => (
                  <div key={c.key} className={cn("truncate px-4 py-4 text-sm text-ink", c.className)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
