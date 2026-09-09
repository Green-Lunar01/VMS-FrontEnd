"use client";

import { useMemo, useState } from "react";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DATE_OPTIONS } from "@/lib/filter-options";
import { resolveDateRange } from "@/lib/date-range";
import { dispatchApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { exportRowsToCsv } from "@/lib/csv";
import type { Dispatch } from "@/lib/types";

export function DispatcherView() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [range, setRange] = useState("7d");

  const { data, loading, error, reload } = useApi<Dispatch[]>(
    () => dispatchApi.list({ q: submittedQuery || undefined }),
    [submittedQuery],
  );

  // The dispatch list endpoint only supports ?q=, so the date preset is applied here.
  const rows = useMemo(() => {
    const all = data ?? [];
    const { from, to } = resolveDateRange(range);
    if (!from && !to) return all;
    return all.filter((d) => {
      const day = d.createdAt?.slice(0, 10);
      if (!day) return true;
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [data, range]);

  const columns: Column<Dispatch>[] = [
    { key: "dispatcherName", header: "Dispatcher name", render: (d) => d.dispatcherName },
    { key: "companyName", header: "Company name", render: (d) => d.companyName },
    { key: "docOfficeDestination", header: "Doc Office destination", render: (d) => d.docOfficeDestination },
    { key: "docTitle", header: "Doc title", render: (d) => d.docTitle },
    { key: "phone", header: "Phone number", render: (d) => d.phone },
  ];

  return (
    <div>
      <PageTitle>Dispatcher</PageTitle>

      <PageCard>
        <Toolbar>
          <SearchField
            className="w-[256px] shrink-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSubmittedQuery(query)}
            placeholder="Search"
          />
          <Button className="shrink-0 px-6" onClick={() => setSubmittedQuery(query)}>
            Search
          </Button>
          <Dropdown
            className="ml-4 w-[196px] shrink-0"
            value={range}
            options={DATE_OPTIONS}
            onChange={setRange}
            icon="calendar"
          />
          <Button
            className="ml-auto shrink-0 px-6"
            onClick={() =>
              exportRowsToCsv<Dispatch>("dispatch", rows, [
                ["Dispatcher name", (d) => d.dispatcherName],
                ["Company name", (d) => d.companyName],
                ["Doc Office destination", (d) => d.docOfficeDestination],
                ["Doc title", (d) => d.docTitle],
                ["Phone number", (d) => d.phone],
                ["Host", (d) => d.hostName ?? ""],
              ])
            }
          >
            Export
          </Button>
        </Toolbar>

        <div className="flex items-center justify-between px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total: {rows.length}</p>
          {error && (
            <button onClick={reload} className="text-sm text-red hover:underline">
              {error} &mdash; retry
            </button>
          )}
        </div>

        <div className="px-7 pb-7">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading dispatch entries&hellip;</p>
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </div>
      </PageCard>
    </div>
  );
}
