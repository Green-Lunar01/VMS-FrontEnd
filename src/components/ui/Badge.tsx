import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { VisitorStatus, UserStatus, ContractorStatus } from "@/lib/types";

type Tone = "green" | "red" | "blue" | "gold" | "grey" | "ink";

const toneClasses: Record<Tone, string> = {
  green: "bg-primary-light text-primary-dark",
  red: "bg-red-light text-red",
  blue: "bg-blue-light text-blue",
  gold: "bg-gold-light text-[#8a6d1f]",
  grey: "bg-grey text-muted",
  ink: "bg-ink text-white",
};

export function Badge({ tone = "grey", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const visitorStatusTone: Record<VisitorStatus, Tone> = {
  awaiting_approval: "gold",
  submitted: "blue",
  confirmed: "blue",
  signed_in: "green",
  signed_out: "ink",
  cancelled: "red",
};

const visitorStatusLabel: Record<VisitorStatus, string> = {
  awaiting_approval: "Awaiting approval",
  submitted: "Submitted",
  confirmed: "Confirmed",
  signed_in: "Signed in",
  signed_out: "Signed out",
  cancelled: "Cancelled",
};

export function VisitorStatusBadge({ status }: { status: VisitorStatus }) {
  return <Badge tone={visitorStatusTone[status]}>{visitorStatusLabel[status]}</Badge>;
}

export function StatusBadge({ status }: { status: UserStatus | ContractorStatus }) {
  return <Badge tone={status === "active" ? "green" : "grey"}>{status === "active" ? "Active" : "Inactive"}</Badge>;
}
