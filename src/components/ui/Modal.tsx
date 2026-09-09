"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

/**
 * Centred popup matching the Figma dialogs: a titled header bar with a close X and
 * a hairline under it, then a scrollable body.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  hideHeader,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl outline-none",
            className,
          )}
        >
          {!hideHeader && (
            <div className="flex items-center justify-between border-b border-divider px-6 py-4">
              <Dialog.Title className="text-base font-semibold text-ink">{title}</Dialog.Title>
              <Dialog.Close className="text-ink transition-opacity hover:opacity-60" aria-label="Close">
                <Icon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
              </Dialog.Close>
            </div>
          )}
          {hideHeader && (
            <Dialog.Close
              className="absolute right-6 top-6 z-10 text-ink transition-opacity hover:opacity-60"
              aria-label="Close"
            >
              <Icon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
            </Dialog.Close>
          )}
          {hideHeader && <Dialog.Title className="sr-only">{title ?? "Dialog"}</Dialog.Title>}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
