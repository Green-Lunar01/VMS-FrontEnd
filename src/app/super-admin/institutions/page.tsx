"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { InstitutionDetailDrawer } from "@/components/dashboard/InstitutionDetailDrawer";
import { mockInstitutions } from "@/data/mock-data";
import type { Institution } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

function BigTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[56px] w-[347px] max-w-full rounded-[8px] text-base transition-colors ${
        active ? "bg-primary font-semibold text-white" : "bg-grey text-ink hover:bg-grey/70"
      }`}
    >
      {label}
    </button>
  );
}

export default function InstitutionsPage() {
  const [tab, setTab] = useState<"register" | "list">("list");
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [selected, setSelected] = useState<Institution | null>(null);

  const columns: Column<Institution>[] = [
    { key: "name", header: "Name", render: (i) => i.name },
    { key: "email", header: "Email address", render: (i) => i.email },
    { key: "address", header: "Address", render: (i) => i.address },
    { key: "phone", header: "Phone number", render: (i) => i.phone },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <span className={i.status === "active" ? "text-primary" : "text-red"}>
          {i.status === "active" ? "Active" : "Deactivated"}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-[10px] bg-white p-6">
      <div className="rounded-[6px] bg-grey px-6 py-6">
        <h1 className="text-[22px] font-bold tracking-wide text-ink">INSTITUTION</h1>
      </div>

      <div className="flex flex-wrap gap-[52px] border-b border-divider py-6">
        <BigTab label="Register new Institution" active={tab === "register"} onClick={() => setTab("register")} />
        <BigTab label="Institutions list" active={tab === "list"} onClick={() => setTab("list")} />
      </div>

      {tab === "list" ? (
        <div className="pt-8">
          <DataTable
            columns={columns}
            rows={institutions}
            minHeight={520}
            onRowClick={(i) => setSelected(i)}
            selectedId={selected?._id}
          />
        </div>
      ) : (
        <RegisterInstitutionForm />
      )}

      <InstitutionDetailDrawer
        institution={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggleStatus={(inst) => {
          setInstitutions((list) =>
            list.map((i) => (i._id === inst._id ? { ...i, status: i.status === "active" ? "inactive" : "active" } : i)),
          );
          setSelected((cur) =>
            cur && cur._id === inst._id
              ? { ...cur, status: cur.status === "active" ? "inactive" : "active" }
              : cur,
          );
        }}
      />
    </div>
  );
}

function RegisterInstitutionForm() {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex justify-center py-8">
      <form onSubmit={handleSubmit} className="w-[502px] max-w-full overflow-hidden rounded-[8px] border border-border">
        <div className="border-b border-border bg-grey py-4 text-center text-lg font-semibold text-ink">
          Add new Organization
        </div>
        <div className="flex flex-col gap-5 px-12 py-9">
          <Field label="Organization name">
            <input className={inputClass} placeholder="Organization name" required />
          </Field>
          <Field label="Email address">
            <input className={inputClass} type="email" placeholder="DHQ@gmail.com" required />
          </Field>
          <Field label="Organization address">
            <input className={inputClass} placeholder="Area 7, Garki, Abuja" required />
          </Field>
          <Field label="Phone number">
            <input className={inputClass} placeholder="0909987" required />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" placeholder="••••••••••••••••" required />
          </Field>
          <Field label="Confirm password">
            <input className={inputClass} type="password" placeholder="••••••••••••••••" required />
          </Field>
          <Button type="submit" fullWidth className="mt-2 h-[52px]">
            Register Institution
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}
