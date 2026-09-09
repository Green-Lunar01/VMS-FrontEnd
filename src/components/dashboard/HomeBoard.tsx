"use client";

import { useState } from "react";
import { QueueHeader } from "@/components/dashboard/QueueHeader";
import { DispatchForm } from "@/components/dashboard/DispatchForm";
import { VisitorQueueCard } from "@/components/dashboard/VisitorQueueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/icons/Icon";
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import type { Visitor } from "@/lib/types";

function QueueSearch({ withDate }: { withDate?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 pb-4 pt-4">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <Icon icon={Search01Icon} size={17} strokeWidth={1.75} />
        </span>
        <input
          className="h-11 w-full rounded-[6px] border border-border bg-white pl-10 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          placeholder="Search"
        />
      </div>
      {withDate && (
        <button className="flex items-center gap-1.5 text-xs text-muted">
          Today
          <Icon icon={Calendar03Icon} size={17} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

function QueueColumn({
  title,
  tone,
  count,
  visitors,
  variant,
  withDate,
  notifyHost,
}: {
  title: string;
  tone: "teal" | "ink" | "green" | "red";
  count: number;
  visitors: Visitor[];
  variant: "submitted" | "cancelled" | "signed_in" | "signed_out";
  withDate?: boolean;
  notifyHost?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <QueueHeader title={title} count={count} tone={tone} className="mb-4" />
      <div className="relative flex-1 rounded-[10px] bg-grey/60 p-3">
        <div className="relative rounded-[10px] bg-white/70">
          <QueueSearch withDate={withDate} />
          <div className="max-h-[880px] space-y-4 overflow-y-auto px-4 pb-4">
            {visitors.length === 0 ? (
              <EmptyState />
            ) : (
              visitors.map((v) => (
                <VisitorQueueCard key={v._id} visitor={v} variant={variant} notifyHost={notifyHost} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Home dashboard: a fixed "Onboard New Dispatcher" panel plus two swappable queue
 * columns. The topbar's "Signed In / Signed Out Visitors" links flip the pair,
 * and the side arrows step between them.
 */
export function HomeBoard({ visitors, board }: { visitors: Visitor[]; board: "default" | "signed" }) {
  const [view, setView] = useState<"default" | "signed">(board);

  const submitted = visitors.filter((v) => v.status === "submitted" || v.status === "awaiting_approval");
  const cancelled = visitors.filter((v) => v.status === "cancelled");
  const signedIn = visitors.filter((v) => v.status === "signed_in");
  const signedOut = visitors.filter((v) => v.status === "signed_out");

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[352px_1fr]">
      <div className="flex flex-col">
        <QueueHeader title="Onboard New Dispatcher" tone="indigo" className="mb-4" />
        <div className="relative flex-1 rounded-[10px] bg-grey/60 p-3">
          <div className="relative rounded-[10px] bg-white px-6 py-6">
            <DispatchForm />
          </div>
        </div>
      </div>

      <div className="relative rounded-[10px] bg-white/40 px-11 py-1">
        <button
          onClick={() => setView("default")}
          className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md transition-opacity hover:opacity-80"
          aria-label="Previous"
        >
          <Icon icon={ArrowLeft01Icon} size={20} strokeWidth={2} />
        </button>
        <button
          onClick={() => setView("signed")}
          className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md transition-opacity hover:opacity-80"
          aria-label="Next"
        >
          <Icon icon={ArrowRight01Icon} size={20} strokeWidth={2} />
        </button>

        <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-2">
          {view === "default" ? (
            <>
              <QueueColumn
                title="Submitted Visitors"
                tone="teal"
                count={submitted.length}
                visitors={submitted}
                variant="submitted"
                notifyHost
              />
              <QueueColumn
                title="Cancelled Visitors"
                tone="ink"
                count={cancelled.length}
                visitors={cancelled}
                variant="cancelled"
              />
            </>
          ) : (
            <>
              <QueueColumn
                title="Signed In Visitors"
                tone="green"
                count={signedIn.length}
                visitors={signedIn}
                variant="signed_in"
                withDate
              />
              <QueueColumn
                title="Signed Out Visitors"
                tone="red"
                count={signedOut.length}
                visitors={signedOut}
                variant="signed_out"
                withDate
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
