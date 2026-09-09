import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgentRef } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Some endpoints populate sign-in/out agents with {name, email}, others leave the bare id. */
export function agentName(agent: AgentRef | string | null | undefined): string | undefined {
  if (agent && typeof agent === "object") return agent.name;
  return undefined;
}

/** Walk-ins carry neither field, so `${from} - ${to}` would otherwise render as "null - null". */
export function timeRange(from?: string | null, to?: string | null): string | undefined {
  return from && to ? `${from} - ${to}` : undefined;
}
