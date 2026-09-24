"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { PillTabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermitFront, PermitBack } from "@/components/dashboard/ContractorPermit";
import { Icon } from "@/components/icons/Icon";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { contractorsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { useInstitutionBrand } from "@/lib/institution/InstitutionBrandContext";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Contractor, ContractorVisit } from "@/lib/types";

const ALL_TABS = [
  { value: "add", label: "Add new contractor" },
  { value: "list", label: "Contractor list" },
  { value: "checkin", label: "Check-in/Check-out contractor" },
];

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

export function ContractorsView({ canManage = true }: { canManage?: boolean }) {
  const [tab, setTab] = useState(canManage ? "add" : "checkin");

  return (
    <div>
      <PageTitle>Contractors</PageTitle>

      <PageCard className="px-7 py-7">
        <h2 className="mb-6 text-2xl font-bold text-ink">Contractors</h2>
        <PillTabs
          items={canManage ? ALL_TABS : ALL_TABS.filter((t) => t.value !== "add")}
          value={tab}
          onChange={setTab}
          className="mb-7"
        />

        {tab === "add" && <AddContractorTab />}
        {tab === "list" && <ContractorListTab canManage={canManage} />}
        {tab === "checkin" && <CheckInTab canCheckIn={!canManage} />}
      </PageCard>
    </div>
  );
}

function AddContractorTab() {
  const brand = useInstitutionBrand();
  const institutionName = brand?.name ?? "Institution";
  const [created, setCreated] = useState<Contractor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);
    try {
      const contractor = await contractorsApi.create({
        name: String(form.get("name") ?? ""),
        companyName: String(form.get("companyName") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        validityFrom: String(form.get("from") ?? ""),
        validityTo: String(form.get("to") ?? ""),
      });
      setCreated(contractor);
      // e.currentTarget is nulled by the time the await above resolves, so the
      // element reference has to be captured beforehand.
      formEl.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not add this contractor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[10px] border border-border">
          <div className="border-b border-border py-4 text-center text-base font-bold text-ink">Add new Contractor</div>
          <div className="px-8 py-7">
            <div className="flex items-center gap-3 pb-6">
              {brand?.logoUrl && <Image src={brand.logoUrl} alt="" width={52} height={52} />}
              <div>
                <p className="font-display text-[22px] leading-tight text-primary">{institutionName.toUpperCase()}</p>
                <p className="text-center text-base font-bold tracking-wide text-ink">CONTRACTOR PERMIT</p>
              </div>
            </div>

            <div className="flex justify-center pb-6">
              <div className="relative">
                <Image
                  src="/branding/avatar-placeholder.png"
                  alt=""
                  width={110}
                  height={110}
                  className="h-[110px] w-[110px] rounded-full object-cover"
                />
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow">
                  <Icon icon={Camera01Icon} size={17} />
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Name</label>
                <input name="name" className={inputClass} placeholder="Name" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Company name</label>
                <input name="companyName" className={inputClass} placeholder="Company" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Validity period</label>
                <div className="flex items-stretch overflow-hidden rounded-[4px] border border-border">
                  <span className="flex items-center bg-grey px-3 text-sm font-semibold text-ink">From</span>
                  <input name="from" type="date" className="h-11 min-w-0 flex-1 px-3 text-sm text-ink outline-none" required />
                  <span className="flex items-center bg-grey px-3 text-sm font-semibold text-ink">To</span>
                  <input name="to" type="date" className="h-11 min-w-0 flex-1 px-3 text-sm text-ink outline-none" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Email address</label>
                <input name="email" className={inputClass} placeholder="Email" type="email" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Phone number</label>
                <input name="phone" className={inputClass} placeholder="090873636366" required />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-border">
          <div className="border-b border-border py-4 text-center text-base font-bold text-ink">Card Back</div>
          <div className="p-6">
            <PermitBack className="border-0" />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-[4px] bg-red-light px-4 py-3 text-center text-sm text-red">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <Button type="submit" className="h-[52px] w-[390px]" disabled={busy}>
          {busy ? "Adding…" : "Add contractor"}
        </Button>
      </div>

      <Modal open={!!created} onClose={() => setCreated(null)} hideHeader className="w-[1100px] max-w-[94vw]">
        <div className="px-8 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <PermitFront contractor={created ?? undefined} />
            <PermitBack />
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => window.print()} className="text-sm font-semibold text-primary hover:underline">
              Print ID
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}

function ContractorListTab({ canManage }: { canManage: boolean }) {
  const { data, loading, error, reload, setData } = useApi<Contractor[]>(() => contractorsApi.list(), []);
  const rows = data ?? [];

  async function revoke(contractor: Contractor) {
    const reason = window.prompt(`Why is ${contractor.name}'s access being revoked?`);
    if (!reason) return;
    try {
      const updated = await contractorsApi.revoke(contractor._id, reason);
      setData((prev) => (prev ?? []).map((c) => (c._id === updated._id ? updated : c)));
    } catch {
      reload();
    }
  }

  const columns: Column<Contractor>[] = [
    { key: "name", header: "Name", render: (c) => c.name },
    { key: "companyName", header: "Company", render: (c) => c.companyName },
    { key: "idNumber", header: "ID number", render: (c) => c.idNumber },
    { key: "phone", header: "Phone", render: (c) => c.phone },
    { key: "email", header: "Email address", render: (c) => c.email },
    { key: "validityTo", header: "Expiring date", render: (c) => formatDate(c.validityTo) },
  ];

  if (canManage) {
    columns.push({
      key: "action",
      header: "",
      width: "110px",
      render: (c) =>
        c.status === "active" ? (
          <button onClick={() => revoke(c)} className="text-sm text-red hover:underline">
            Revoke
          </button>
        ) : (
          <span className="text-sm text-muted">Revoked</span>
        ),
    });
  }

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading contractors&hellip;</p>;
  if (error) return <p className="py-16 text-center text-sm text-red">{error}</p>;
  return <DataTable columns={columns} rows={rows} />;
}

function CheckInTab({ canCheckIn }: { canCheckIn: boolean }) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Contractor | null>(null);
  const [visits, setVisits] = useState<ContractorVisit[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const results = await contractorsApi.list({ q: query });
      const match = results[0] ?? null;
      setFound(match);
      setVisits(match ? await contractorsApi.visits(match._id).catch(() => []) : []);
      if (!match) setError("No contractor matched that ID or name.");
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Search failed.");
    } finally {
      setBusy(false);
    }
  }

  async function act(kind: "in" | "out") {
    if (!found) return;
    setBusy(true);
    setError(null);
    try {
      // check-in/check-out return the visit record they created, not the
      // contractor — the contractor itself is unchanged, so `found` stays put.
      if (kind === "in") {
        await contractorsApi.checkIn(found._id);
      } else {
        await contractorsApi.checkOut(found._id);
      }
      setVisits(await contractorsApi.visits(found._id).catch(() => visits));
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "That action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[10px] border border-border lg:grid-cols-2">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <form onSubmit={handleSearch} className="flex items-center gap-4 border-b border-border px-8 py-6">
          <input
            className="h-12 w-full flex-1 rounded-[4px] border border-border bg-white px-4 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            placeholder="Enter visitor ID or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" className="px-7" disabled={busy}>
            Search
          </Button>
        </form>

        <div className="flex justify-center px-8 py-8">
          <div className="w-[310px] rounded-[8px] border border-border p-6">
            <div className="flex justify-center pb-5">
              <Image
                src={found?.photoUrl || "/branding/avatar-placeholder.png"}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
            <div className="pb-5">
              {[
                ["Name", found?.name],
                ["Company name", found?.companyName],
                ["Email address", found?.email],
                ["Validity period", found ? `${formatDate(found.validityFrom)} - ${formatDate(found.validityTo)}` : undefined],
                ["ID number", found?.idNumber],
                ["Active", found ? (found.status === "active" ? "Yes" : "No") : undefined],
              ].map(([label, value]) => (
                <div key={label as string} className="flex gap-2 py-[3px] text-[13px]">
                  <span className="text-muted">{label}:</span>
                  <span className="text-ink">{value ?? ""}</span>
                </div>
              ))}
            </div>

            {error && <p className="mb-3 text-center text-xs text-red">{error}</p>}

            <div className="flex flex-col gap-2.5">
              <Button fullWidth disabled={!found || busy || !canCheckIn} onClick={() => act("in")}>
                Sign In
              </Button>
              <Button fullWidth variant="destructive" disabled={!found || busy || !canCheckIn} onClick={() => act("out")}>
                Sign Out
              </Button>
              <Button fullWidth variant="muted" disabled={!found} onClick={() => setFound(null)}>
                Deny Entry
              </Button>
            </div>
            {!canCheckIn && found && (
              <p className="mt-3 text-center text-xs text-muted">Only Security Officers can check contractors in or out.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="border-b border-border py-4 text-center text-base font-bold text-ink">History</div>
        <div className="min-h-[420px]">
          {visits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-8 py-6">
              {visits.map((v) => (
                <div key={v._id} className="border-b border-divider py-3 text-sm">
                  <p className="font-semibold text-ink">
                    In: {v.signInTime ? formatDateTime(v.signInTime) : "—"}
                  </p>
                  <p className="text-muted">
                    Out: {v.signOutTime ? formatDateTime(v.signOutTime) : "—"} · Agent{" "}
                    {v.signInAgent?.name ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
