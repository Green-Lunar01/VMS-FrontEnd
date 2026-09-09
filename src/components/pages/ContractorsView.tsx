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
import { mockContractors, mockContractorVisits } from "@/data/mock-data";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Contractor } from "@/lib/types";

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
        <div className="relative">
          <h2 className="mb-6 text-2xl font-bold text-ink">Contractors</h2>
          <PillTabs items={canManage ? ALL_TABS : ALL_TABS.filter((t) => t.value !== "add")} value={tab} onChange={setTab} className="mb-7" />

          {tab === "add" && <AddContractorTab />}
          {tab === "list" && <ContractorListTab />}
          {tab === "checkin" && <CheckInTab />}
        </div>
      </PageCard>
    </div>
  );
}

function AddContractorTab() {
  const [created, setCreated] = useState<Contractor | null>(null);
  const [form, setForm] = useState({ name: "", companyName: "", from: "", to: "", email: "", phone: "" });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCreated({
      _id: "new",
      name: form.name || "Musa Akpan",
      companyName: form.companyName || "Tatamomo",
      email: form.email || "Musa@gmail.com",
      phone: form.phone || "090776489",
      idNumber: "737366217ggs7",
      validityFrom: form.from || "2024-01-12",
      validityTo: form.to || "2026-11-10",
      status: "active",
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
        {/* Left: the permit being filled in */}
        <div className="overflow-hidden rounded-[10px] border border-border">
          <div className="border-b border-border py-4 text-center text-base font-bold text-ink">
            Add new Contractor
          </div>
          <div className="relative px-8 py-7">
            <div className="flex items-center gap-3 pb-6">
              <Image src="/branding/dhq-crest.png" alt="" width={52} height={52} />
              <div>
                <p className="font-display text-[22px] leading-tight text-primary">DEFENCE HEADQUARTERS</p>
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
                <input className={inputClass} placeholder="Name" value={form.name} onChange={set("name")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Company name</label>
                <input
                  className={inputClass}
                  placeholder="Company"
                  value={form.companyName}
                  onChange={set("companyName")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Validity period</label>
                <div className="flex items-stretch overflow-hidden rounded-[4px] border border-border">
                  <span className="flex items-center bg-grey px-3 text-sm font-semibold text-ink">From</span>
                  <input
                    type="date"
                    className="h-11 min-w-0 flex-1 px-3 text-sm text-ink outline-none"
                    value={form.from}
                    onChange={set("from")}
                  />
                  <span className="flex items-center bg-grey px-3 text-sm font-semibold text-ink">To</span>
                  <input
                    type="date"
                    className="h-11 min-w-0 flex-1 px-3 text-sm text-ink outline-none"
                    value={form.to}
                    onChange={set("to")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Email address</label>
                <input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={set("email")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink">Phone number</label>
                <input className={inputClass} placeholder="090873636366" value={form.phone} onChange={set("phone")} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: card back preview */}
        <div className="overflow-hidden rounded-[10px] border border-border">
          <div className="border-b border-border py-4 text-center text-base font-bold text-ink">Card Back</div>
          <div className="p-6">
            <PermitBack className="border-0" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button type="submit" className="h-[52px] w-[390px]">
          Add contractor
        </Button>
      </div>

      <Modal open={!!created} onClose={() => setCreated(null)} hideHeader className="w-[1100px] max-w-[94vw]">
        <div className="px-8 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <PermitFront contractor={created ?? undefined} />
            <PermitBack />
          </div>
          <div className="mt-6 text-center">
            <button className="text-sm font-semibold text-primary hover:underline">Print ID</button>
          </div>
        </div>
      </Modal>
    </form>
  );
}

function ContractorListTab() {
  const columns: Column<Contractor>[] = [
    { key: "name", header: "Name", render: (c) => c.name },
    { key: "companyName", header: "Company", render: (c) => c.companyName },
    { key: "idNumber", header: "ID number", render: (c) => c.idNumber },
    { key: "phone", header: "Phone", render: (c) => c.phone },
    { key: "email", header: "Email address", render: (c) => c.email },
    { key: "validityTo", header: "Expiring date", render: (c) => formatDate(c.validityTo) },
  ];
  return <DataTable columns={columns} rows={mockContractors} />;
}

function CheckInTab() {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Contractor | null>(null);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const match = mockContractors.find(
      (c) =>
        c.idNumber.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFound(match ?? null);
  }

  const visits = found ? mockContractorVisits[found._id] ?? [] : [];

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[10px] border border-border lg:grid-cols-2">
      {/* Left: search + contractor */}
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <form onSubmit={handleSearch} className="flex items-center gap-4 border-b border-border px-8 py-6">
          <div className="relative flex-1">
            <input
              className="h-12 w-full rounded-[4px] border border-border bg-white px-4 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              placeholder="Enter visitor ID or name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="px-7">
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
                [
                  "Validity period",
                  found ? `${formatDate(found.validityFrom)} - ${formatDate(found.validityTo)}` : undefined,
                ],
                ["ID number", found?.idNumber],
                ["Active", found ? (found.status === "active" ? "Yes" : "No") : undefined],
              ].map(([label, value]) => (
                <div key={label as string} className="flex gap-2 py-[3px] text-[13px]">
                  <span className="text-muted">{label}:</span>
                  <span className="text-ink">{value ?? ""}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <Button fullWidth>Sign In</Button>
              <Button fullWidth variant="destructive">
                Sign Out
              </Button>
              <Button fullWidth variant="muted">
                Deny Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: history */}
      <div>
        <div className="border-b border-border py-4 text-center text-base font-bold text-ink">History</div>
        <div className="relative min-h-[420px]">
          {visits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="relative px-8 py-6">
              {visits.map((v) => (
                <div key={v._id} className="border-b border-divider py-3 text-sm">
                  <p className="font-semibold text-ink">In: {formatDateTime(v.checkedInAt)}</p>
                  <p className="text-muted">
                    Out: {v.checkedOutAt ? formatDateTime(v.checkedOutAt) : "—"} · Agent {v.checkedInBy}
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
