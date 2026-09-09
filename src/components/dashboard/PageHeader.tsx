import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Plain page title sitting on the grey page background, above the white card. */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn("mb-5 text-2xl font-bold text-ink", className)}>{children}</h1>;
}

/** The white rounded panel that holds each screen's content. */
export function PageCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-[10px] bg-white", className)}>{children}</div>;
}
