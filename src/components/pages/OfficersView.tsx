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
import { SERVICE_TYPE_LABEL } from "@/lib/labels";
import { officersApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { exportRowsToCsv } from "@/lib/csv";
import type { Officer, ServiceType } from "@/lib/types";

/**
 * Residents list. Institution Admins get the "Add new Resident"
 * popup and credential sharing; Security Officers get the read-only list.
 */
export function OfficersView({ canManage = true }: { canManage?: boolean }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Officer | null>(null);

  const params = useMemo(
    () => ({ q: submittedQuery || undefined, serviceType: serviceType === "all" ? undefined : serviceType }),
    [submittedQuery, serviceType],
  );

  const { data, loading, error, reload } = useApi<Officer[]>(() => officersApi.list(params), [
    params.q,
    params.serviceType,
  ]);

  const rows = useMemo(() => data ?? [], [data]);

  /** The list response omits visitorsReceivedCount; the single-record view has it. */
  async function openOfficer(officer: Officer) {
    setSelected(officer);
    try {
      setSelected(await officersApi.get(officer._id));
    } catch {
      /* keep the row data we already have */
    }
  }

  const columns: Column<Officer>[] = [
    { key: "name", header: "Name", render: (o) => o.name },
    {
      key: "serviceType",
      header: "Service type",
      render: (o) => SERVICE_TYPE_LABEL[o.serviceType as ServiceType] ?? o.serviceType,
    },
    { key: "rank", header: "Rank", render: (o) => o.rank },
    { key: "appointment", header: "Appointment", render: (o) => o.appointment },
    { key: "department", header: "Department", render: (o) => o.department },
    { key: "branch", header: "Directorate", render: (o) => o.branch },
    { key: "serviceNumber", header: "Service no.", render: (o) => o.serviceNumber },
  ];

  return (
    <div>
      <PageTitle>Residents</PageTitle>

      <PageCard>
        <Toolbar>
          {canManage && (
            <Button className="shrink-0 px-5" variant="outline" onClick={() => setAddOpen(true)}>
              Add new Resident
            </Button>
          )}
          <Button className="shrink-0 px-5" onClick={reload}>
            Resident List
          </Button>
          <SearchField
            className="w-[170px] shrink-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSubmittedQuery(query)}
            placeholder="Search"
          />
          <Button className="shrink-0 px-6" onClick={() => setSubmittedQuery(query)}>
            Search
          </Button>
          <Dropdown className="w-[180px] shrink-0" value={serviceType} options={SERVICE_OPTIONS} onChange={setServiceType} />
          <Button
            className="ml-auto shrink-0 px-6"
            onClick={() =>
              exportRowsToCsv<Officer>("officers", rows, [
                ["Name", (o) => o.name],
                ["Service type", (o) => o.serviceType],
                ["Rank", (o) => o.rank],
                ["Appointment", (o) => o.appointment],
                ["Department", (o) => o.department],
                ["Directorate", (o) => o.branch],
                ["Service no.", (o) => o.serviceNumber],
              ])
            }
          >
            Export
          </Button>
        </Toolbar>

        <div className="flex items-center justify-between px-7 pb-2 pt-5">
          <p className="text-sm text-ink">Total Residents: {rows.length}</p>
          {error && (
            <button onClick={reload} className="text-sm text-red hover:underline">
              {error} &mdash; retry
            </button>
          )}
        </div>

        <div className="px-7 pb-7">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading officers&hellip;</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              leadingAvatar
              avatarKey={(o) => o.photoUrl}
              onRowClick={canManage ? openOfficer : undefined}
            />
          )}
        </div>
      </PageCard>

      {canManage && (
        <>
          <AddOfficerModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={reload} />
          <OfficerCredentialsModal officer={selected} open={!!selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
