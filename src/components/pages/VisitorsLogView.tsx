"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { VisitorDetailDrawer } from "@/components/dashboard/VisitorDetailDrawer";
import { ApproveVisitorModal } from "@/components/dashboard/ApproveVisitorModal";
import { VISITOR_TYPE_LABEL } from "@/lib/labels";
import { DATE_OPTIONS, VISITOR_TYPE_OPTIONS, SIGN_STATE_OPTIONS } from "@/lib/filter-options";
import { resolveDateRange } from "@/lib/date-range";
import { visitorsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { exportRowsToCsv } from "@/lib/csv";
import type { ModeOfEntry, Visitor, VisitorStatus, VisitorType } from "@/lib/types";

export function VisitorsLogView({
  canBlacklist = true,
  canApprove = false,
}: {
  canBlacklist?: boolean;
  canApprove?: boolean;
}) {
  return (
    <Suspense>
      <VisitorsLogContent canBlacklist={canBlacklist} canApprove={canApprove} />
    </Suspense>
  );
}

function VisitorsLogContent({ canBlacklist, canApprove }: { canBlacklist: boolean; canApprove: boolean }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [type, setType] = useState("all");
  const [state, setState] = useState(searchParams.get("status") === "signed_out" ? "signed_out" : "all");
  const [range, setRange] = useState("7d");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [approving, setApproving] = useState<Visitor | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filters = useMemo(() => {
    const { from, to } = resolveDateRange(range);
    return {
      status: state === "all" ? undefined : (state as VisitorStatus),
      visitorType: type === "all" ? undefined : (type as VisitorType),
      q: submittedQuery || undefined,
      from,
      to,
    };
  }, [state, type, submittedQuery, range]);

  const { data, loading, error, reload, setData } = useApi<Visitor[]>(
    () => visitorsApi.list(filters),
    [filters.status, filters.visitorType, filters.q, filters.from, filters.to],
  );

  const rows = useMemo(() => data ?? [], [data]);

  function patchRow(updated: Visitor) {
    setData((prev) => (prev ?? []).map((v) => (v._id === updated._id ? updated : v)));
    setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
  }

  async function handleApprove(guestTagNumber: string, modeOfEntry: ModeOfEntry) {
    if (!approving) return;
    patchRow(await visitorsApi.approve(approving._id, guestTagNumber, modeOfEntry));
  }

  async function handleSignOut(visitor: Visitor) {
    setBusyId(visitor._id);
    try {
      patchRow(await visitorsApi.signOut(visitor._id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleBlacklist(visitor: Visitor, reason: string) {
    patchRow(
      visitor.blacklisted
        ? await visitorsApi.unblacklist(visitor._id)
        : await visitorsApi.blacklist(visitor._id, reason),
    );
  }

  const columns: Column<Visitor>[] = [
    { key: "name", header: "Name", width: "1.35fr", render: (v) => v.name },
    { key: "visitorType", header: "Visitor type", render: (v) => VISITOR_TYPE_LABEL[v.visitorType] ?? v.visitorType },
    { key: "hostName", header: "Host name", render: (v) => v.host?.name ?? "—" },
    { key: "hostRank", header: "Host rank", render: (v) => v.host?.rank ?? "—" },
    { key: "signIn", header: "Sign in time", render: (v) => v.signInTime ?? "—" },
    { key: "signOut", header: "Sign out time", render: (v) => v.signOutTime ?? "—" },
    { key: "department", header: "Department", render: (v) => v.host?.department ?? "—" },
  ];

  if (canApprove) {
    columns.push({
      key: "action",
      header: "",
      width: "130px",
      render: (v) => {
        // approve() rejects anything still awaiting the host's confirmation.
        if (v.status === "submitted" || v.status === "confirmed") {
          return (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setApproving(v);
              }}
            >
              Sign In
            </Button>
          );
        }
        if (v.status === "signed_in") {
          return (
            <Button
              size="sm"
              variant="destructive"
              disabled={busyId === v._id}
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut(v);
              }}
            >
              Sign Out
            </Button>
          );
        }
        return null;
      },
    });
  }

  return (
    <div>
      <PageTitle>Visitors Log</PageTitle>

      <PageCard>
        <Toolbar>
          <SearchField
            className="w-[236px] shrink-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSubmittedQuery(query)}
            placeholder="Search"
          />
          <Button className="shrink-0 px-6" onClick={() => setSubmittedQuery(query)}>
            Search
          </Button>
          <Dropdown className="w-[200px] shrink-0" value={type} options={VISITOR_TYPE_OPTIONS} onChange={setType} />
          <Dropdown className="w-[124px] shrink-0" value={state} options={SIGN_STATE_OPTIONS} onChange={setState} />
          <Dropdown
            className="w-[196px] shrink-0"
            value={range}
            options={DATE_OPTIONS}
            onChange={setRange}
            icon="calendar"
          />
          <Button
            className="ml-auto shrink-0 px-6"
            onClick={() =>
              exportRowsToCsv<Visitor>("visitors-log", rows, [
                ["Name", (v) => v.name],
                ["Visitor type", (v) => VISITOR_TYPE_LABEL[v.visitorType] ?? v.visitorType],
                ["Host name", (v) => v.host?.name ?? ""],
                ["Host rank", (v) => v.host?.rank ?? ""],
                ["Sign in time", (v) => v.signInTime ?? ""],
                ["Sign out time", (v) => v.signOutTime ?? ""],
                ["Department", (v) => v.host?.department ?? ""],
                ["Status", (v) => v.status],
              ])
            }
          >
            Export
          </Button>
        </Toolbar>

        <div className="flex items-center justify-between px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total Visitors: {rows.length}</p>
          {error && (
            <button onClick={reload} className="text-sm text-red hover:underline">
              {error} &mdash; retry
            </button>
          )}
        </div>

        <div className="px-7 pb-7">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading visitors&hellip;</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              leadingAvatar
              avatarKey={(v) => v.photoUrl}
              onRowClick={(v) => setSelected(v)}
              selectedId={selected?._id}
            />
          )}
        </div>
      </PageCard>

      <VisitorDetailDrawer
        visitor={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        canBlacklist={canBlacklist}
        onBlacklist={handleBlacklist}
      />

      <ApproveVisitorModal
        visitor={approving}
        open={!!approving}
        onClose={() => setApproving(null)}
        onApprove={handleApprove}
      />
    </div>
  );
}
