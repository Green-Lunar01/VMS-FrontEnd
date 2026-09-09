"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Right-hand slide-over panel. The Figma file uses this for the notifications feed
 * and for visitor / contractor detail views opened from a table row.
 */
export function Drawer({
  open,
  onClose,
  children,
  title,
  header,
  width = 420,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  header?: ReactNode;
  width?: number;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width }}
          className={cn(
            "fixed right-0 top-0 z-50 flex h-screen max-w-[calc(100vw-24px)] flex-col bg-white shadow-2xl outline-none",
            className,
          )}
        >
          <Dialog.Title className="sr-only">{title ?? "Panel"}</Dialog.Title>
          {header}
          <div className="relative flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
