"use client";

import { useState } from "react";
import { QueueHeader } from "@/components/dashboard/QueueHeader";
import { DispatchForm } from "@/components/dashboard/DispatchForm";
import { VisitorQueueCard } from "@/components/dashboard/VisitorQueueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/icons/Icon";
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { WalkInForm } from "@/components/dashboard/WalkInForm";
import { visitorsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { ApproveVisitorModal } from "@/components/dashboard/ApproveVisitorModal";
import { cn } from "@/lib/utils";
import type { ModeOfEntry, Visitor } from "@/lib/types";

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
  loading,
  onAction,
}: {
  title: string;
  tone: "teal" | "ink" | "green" | "red";
  count: number;
  visitors: Visitor[];
  variant: "submitted" | "cancelled" | "signed_in" | "signed_out";
  withDate?: boolean;
  loading?: boolean;
  onAction?: (visitor: Visitor) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <QueueHeader title={title} count={count} tone={tone} className="mb-4" />
      <div className="relative flex-1 rounded-[10px] bg-grey/60 p-3">
        <div className="relative rounded-[10px] bg-white/70">
          <QueueSearch withDate={withDate} />
          <div className="max-h-[880px] space-y-4 overflow-y-auto px-4 pb-4">
            {loading ? (
              <p className="py-16 text-center text-sm text-muted">Loading&hellip;</p>
            ) : visitors.length === 0 ? (
              <EmptyState />
            ) : (
              visitors.map((v) => (
                <VisitorQueueCard
                  key={v._id}
                  visitor={v}
                  variant={variant}
                  onAction={onAction ? () => onAction(v) : undefined}
                />
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
export function HomeBoard({
  board = "default",
  canOnboardWalkIn = false,
  canApprove = false,
  dispatcherPosition = "start",
}: {
  board?: "default" | "signed";
  /** Security Officers can register a walk-in; the panel is theirs alone. */
  canOnboardWalkIn?: boolean;
  canApprove?: boolean;
  /** Institution Admin wants the onboarding panel after the visitor queues, not before. */
  dispatcherPosition?: "start" | "end";
}) {
  const [view, setView] = useState<"default" | "signed">(board);
  const [panel, setPanel] = useState<"dispatch" | "walkin">("dispatch");
  const [approving, setApproving] = useState<Visitor | null>(null);

  const { data, loading, error, reload, setData } = useApi<Visitor[]>(() => visitorsApi.today(), []);
  const visitors = data ?? [];

  const submitted = visitors.filter(
    (v) => v.status === "submitted" || v.status === "awaiting_approval" || v.status === "confirmed",
  );
  const cancelled = visitors.filter((v) => v.status === "cancelled");
  const signedIn = visitors.filter((v) => v.status === "signed_in");
  const signedOut = visitors.filter((v) => v.status === "signed_out");

  function patchRow(updated: Visitor) {
    setData((prev) => (prev ?? []).map((v) => (v._id === updated._id ? updated : v)));
  }

  async function handleApprove(guestTagNumber: string, modeOfEntry: ModeOfEntry) {
    if (!approving) return;
    patchRow(await visitorsApi.approve(approving._id, guestTagNumber, modeOfEntry));
  }

  async function handleSignOut(visitor: Visitor) {
    try {
      patchRow(await visitorsApi.signOut(visitor._id));
    } catch (err) {
      window.alert(err instanceof ApiError ? err.messages.join(" ") : "Could not sign this visitor out.");
    }
  }

  const dispatcherPanel = (
    <div className="flex flex-col">
      <QueueHeader
        title={panel === "dispatch" ? "Onboard New Dispatcher" : "Onboard New Visitors"}
        tone="indigo"
        className="mb-4"
      />
      {canOnboardWalkIn && (
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setPanel("dispatch")}
            className={`flex-1 rounded-[6px] px-3 py-2 text-xs font-semibold transition-colors ${
              panel === "dispatch" ? "bg-primary text-white" : "bg-grey text-muted hover:text-ink"
            }`}
          >
            Dispatcher
          </button>
          <button
            onClick={() => setPanel("walkin")}
            className={`flex-1 rounded-[6px] px-3 py-2 text-xs font-semibold transition-colors ${
              panel === "walkin" ? "bg-primary text-white" : "bg-grey text-muted hover:text-ink"
            }`}
          >
            Visitor
          </button>
        </div>
      )}
      <div className="relative flex-1 rounded-[10px] bg-grey/60 p-3">
        <div className="relative rounded-[10px] bg-white px-6 py-6">
          {panel === "walkin" && canOnboardWalkIn ? <WalkInForm onCreated={reload} /> : <DispatchForm />}
        </div>
      </div>
    </div>
  );

  const queueArea = (
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
              loading={loading}
              onAction={canApprove ? (v) => setApproving(v) : undefined}
            />
            <QueueColumn
              title="Cancelled Visitors"
              tone="ink"
              count={cancelled.length}
              visitors={cancelled}
              variant="cancelled"
              loading={loading}
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
              loading={loading}
              onAction={canApprove ? handleSignOut : undefined}
            />
            <QueueColumn
              title="Signed Out Visitors"
              tone="red"
              count={signedOut.length}
              visitors={signedOut}
              variant="signed_out"
              withDate
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        dispatcherPosition === "end" ? "xl:grid-cols-[1fr_352px]" : "xl:grid-cols-[352px_1fr]",
      )}
    >
      {error && (
        <button onClick={reload} className="col-span-full rounded-[6px] bg-red-light px-4 py-3 text-sm text-red">
          {error} &mdash; retry
        </button>
      )}
      {dispatcherPosition === "end" ? (
        <>
          {queueArea}
          {dispatcherPanel}
        </>
      ) : (
        <>
          {dispatcherPanel}
          {queueArea}
        </>
      )}

      <ApproveVisitorModal
        visitor={approving}
        open={!!approving}
        onClose={() => setApproving(null)}
        onApprove={handleApprove}
      />
    </div>
  );
}
