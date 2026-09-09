"use client";

import { useMemo, useState } from "react";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DATE_OPTIONS } from "@/lib/filter-options";
import { mockDispatches } from "@/data/mock-data";
import type { Dispatch } from "@/lib/types";

export function DispatcherView() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("7d");

  const rows = useMemo(
    () =>
      mockDispatches.filter(
        (d) =>
          !query ||
          [d.companyName, d.docTitle, d.hostName, d.dispatcherName].some((f) =>
            f.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [query],
  );

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
            className="w-[256px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
          <Button className="px-7">Search</Button>
          <Dropdown className="ml-4 w-[215px]" value={range} options={DATE_OPTIONS} onChange={setRange} icon="calendar" />
          <Button className="ml-auto px-7">Export</Button>
        </Toolbar>

        <div className="px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total: {rows.length}</p>
        </div>

        <div className="px-7 pb-7">
          <DataTable columns={columns} rows={rows} />
        </div>
      </PageCard>
    </div>
  );
}
