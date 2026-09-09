"use client";

import { useMemo, useState } from "react";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { AddOfficerModal } from "@/components/dashboard/AddOfficerModal";
import { OfficerCredentialsModal } from "@/components/dashboard/OfficerCredentialsModal";
import { SERVICE_OPTIONS } from "@/lib/filter-options";
import { mockOfficers } from "@/data/mock-data";
import { SERVICE_TYPE_LABEL } from "@/lib/labels";
import type { Officer } from "@/lib/types";

/**
 * Officers/Soldiers list. Institution Admins get the "Add new Officer/Soldier"
 * popup and credential sharing; Security Officers get the read-only list.
 */
export function OfficersView({ canManage = true }: { canManage?: boolean }) {
  const [query, setQuery] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [view, setView] = useState<"add" | "list">("list");
  const [addOpen, setAddOpen] = useState(false);
  const [credentialsFor, setCredentialsFor] = useState<Officer | null>(null);

  const rows = useMemo(
    () =>
      mockOfficers.filter((o) => {
        const matchesService = serviceType === "all" || o.serviceType === serviceType;
        const matchesQuery =
          !query ||
          [o.name, o.rank, o.serviceNumber, o.branch, o.department].some((f) =>
            f.toLowerCase().includes(query.toLowerCase()),
          );
        return matchesService && matchesQuery;
      }),
    [query, serviceType],
  );

  const columns: Column<Officer>[] = [
    { key: "name", header: "Name", render: (o) => o.name },
    { key: "serviceType", header: "Service type", render: (o) => SERVICE_TYPE_LABEL[o.serviceType] },
    { key: "rank", header: "Rank", render: (o) => o.rank },
    { key: "appointment", header: "Appointment", render: (o) => o.appointment },
    { key: "department", header: "Department", render: (o) => o.department },
    { key: "branch", header: "Branch", render: (o) => o.branch },
    { key: "serviceNumber", header: "Service no.", render: (o) => o.serviceNumber },
  ];

  return (
    <div>
      <PageTitle>Officers/Soldiers</PageTitle>

      <PageCard>
        <Toolbar>
          {canManage && (
            <Button
              className="shrink-0 px-5"
              variant={view === "add" ? "primary" : "outline"}
              onClick={() => {
                setView("add");
                setAddOpen(true);
              }}
            >
              Add new Officer/Soldier
            </Button>
          )}
          <Button className="shrink-0 px-5" variant={view === "list" ? "primary" : "outline"} onClick={() => setView("list")}>
            Officer/Soldier List
          </Button>
          <SearchField
            className="w-[170px] shrink-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
          <Button className="shrink-0 px-6">Search</Button>
          <Dropdown className="w-[180px] shrink-0" value={serviceType} options={SERVICE_OPTIONS} onChange={setServiceType} />
          <Button className="ml-auto shrink-0 px-6">Export</Button>
        </Toolbar>

        <div className="px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total Officers/Soldiers: {rows.length}</p>
        </div>

        <div className="px-7 pb-7">
          <DataTable
            columns={columns}
            rows={rows}
            leadingAvatar
            avatarKey={(o) => o.photoUrl}
            onRowClick={canManage ? (o) => setCredentialsFor(o) : undefined}
          />
        </div>
      </PageCard>

      {canManage && (
        <>
          <AddOfficerModal open={addOpen} onClose={() => setAddOpen(false)} />
          <OfficerCredentialsModal
            officer={credentialsFor}
            open={!!credentialsFor}
            onClose={() => setCredentialsFor(null)}
          />
        </>
      )}
    </div>
  );
}
