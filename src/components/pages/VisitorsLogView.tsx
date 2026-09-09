"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { VisitorDetailDrawer } from "@/components/dashboard/VisitorDetailDrawer";
import { mockVisitors } from "@/data/mock-data";
import { VISITOR_TYPE_LABEL } from "@/lib/labels";
import { DATE_OPTIONS, VISITOR_TYPE_OPTIONS, SIGN_STATE_OPTIONS } from "@/lib/filter-options";
import type { Visitor } from "@/lib/types";

export function VisitorsLogView({ canBlacklist = true }: { canBlacklist?: boolean }) {
  return (
    <Suspense>
      <VisitorsLogContent canBlacklist={canBlacklist} />
    </Suspense>
  );
}

function VisitorsLogContent({ canBlacklist }: { canBlacklist: boolean }) {
  const searchParams = useSearchParams();
  const [visitors] = useState(mockVisitors);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("friend");
  const [state, setState] = useState(searchParams.get("status") === "signed_out" ? "signed_out" : "signed_in");
  const [range, setRange] = useState("7d");
  const [selected, setSelected] = useState<Visitor | null>(null);

  const rows = useMemo(() => {
    return visitors.filter((v) => {
      const matchesType = type === "all" || v.visitorType === type;
      const matchesState =
        state === "all" ||
        (state === "signed_in" && v.status === "signed_in") ||
        (state === "signed_out" && v.status === "signed_out");
      const matchesQuery =
        !query ||
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.host.name.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesState && matchesQuery;
    });
  }, [visitors, type, state, query]);

  const columns: Column<Visitor>[] = [
    { key: "name", header: "Name", width: "1.35fr", render: (v) => v.name },
    { key: "visitorType", header: "Visitor type", render: (v) => VISITOR_TYPE_LABEL[v.visitorType] },
    { key: "hostName", header: "Host name", render: (v) => v.host.name },
    { key: "hostRank", header: "Host rank", render: (v) => v.host.rank },
    { key: "signIn", header: "Sign in time", render: (v) => v.signInTime ?? "—" },
    { key: "signOut", header: "Sign out time", render: (v) => v.signOutTime ?? "—" },
    { key: "department", header: "Department", render: (v) => v.host.department },
  ];

  return (
    <div>
      <PageTitle>Visitors Log</PageTitle>

      <PageCard>
        <Toolbar>
          <SearchField
            className="w-[236px] shrink-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
          <Button className="shrink-0 px-6">Search</Button>
          <Dropdown className="w-[200px] shrink-0" value={type} options={VISITOR_TYPE_OPTIONS} onChange={setType} />
          <Dropdown className="w-[124px] shrink-0" value={state} options={SIGN_STATE_OPTIONS} onChange={setState} />
          <Dropdown className="w-[196px] shrink-0" value={range} options={DATE_OPTIONS} onChange={setRange} icon="calendar" />
          <Button className="ml-auto shrink-0 px-6">Export</Button>
        </Toolbar>

        <div className="px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total Visitors: {rows.length}</p>
        </div>

        <div className="px-7 pb-7">
          <DataTable
            columns={columns}
            rows={rows}
            leadingAvatar
            avatarKey={(v) => v.photoUrl}
            onRowClick={(v) => setSelected(v)}
            selectedId={selected?._id}
          />
        </div>
      </PageCard>

      <VisitorDetailDrawer
        visitor={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        canBlacklist={canBlacklist}
      />
    </div>
  );
}
