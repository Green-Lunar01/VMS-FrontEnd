"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { InstitutionDetailDrawer } from "@/components/dashboard/InstitutionDetailDrawer";
import { institutionsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { setStoredTokens } from "@/lib/auth/storage";
import { ROLE_HOME, useAuth } from "@/lib/auth/AuthProvider";
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
  const router = useRouter();
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"register" | "list">("list");
  const [selected, setSelected] = useState<Institution | null>(null);

  const { data, loading, error, reload, setData } = useApi<Institution[]>(() => institutionsApi.list(), []);
  const institutions = data ?? [];

  async function toggleStatus(inst: Institution) {
    const updated =
      inst.status === "active"
        ? await institutionsApi.deactivate(inst._id)
        : await institutionsApi.activate(inst._id);
    setData((prev) => (prev ?? []).map((i) => (i._id === updated._id ? updated : i)));
    setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
  }

  /**
   * Swaps this session for one acting as the institution's admin. The role guard
   * reads the user from context, so the context has to be updated too — writing
   * only to storage leaves the session as super_admin and the redirect bounces
   * straight back here.
   */
  async function impersonate(inst: Institution) {
    try {
      const res = await institutionsApi.impersonate(inst._id);
      setStoredTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      setUser(res.user);
      setSelected(null);
      router.replace(ROLE_HOME[res.user.role]);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.messages.join(" ") : "Could not act as this institution.");
    }
  }

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
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading institutions&hellip;</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red">{error}</p>
          ) : (
            <DataTable
              columns={columns}
              rows={institutions}
              minHeight={520}
              onRowClick={(i) => setSelected(i)}
              selectedId={selected?._id}
            />
          )}
        </div>
      ) : (
        <RegisterInstitutionForm
          onDone={() => {
            reload();
            setTab("list");
          }}
        />
      )}

      <InstitutionDetailDrawer
        institution={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggleStatus={toggleStatus}
        onImpersonate={impersonate}
      />
    </div>
  );
}

function RegisterInstitutionForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) {
      setError("The passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await institutionsApi.create({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        address: String(form.get("address") ?? ""),
        phone: String(form.get("phone") ?? ""),
        password,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not register this institution.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-center py-8">
      <form onSubmit={handleSubmit} className="w-[502px] max-w-full overflow-hidden rounded-[8px] border border-border">
        <div className="border-b border-border bg-grey py-4 text-center text-lg font-semibold text-ink">
          Add new Organization
        </div>
        <div className="flex flex-col gap-5 px-12 py-9">
          <Field label="Organization name">
            <input name="name" className={inputClass} placeholder="Organization name" required />
          </Field>
          <Field label="Email address">
            <input name="email" className={inputClass} type="email" placeholder="institution@example.com" required />
          </Field>
          <Field label="Organization address">
            <input name="address" className={inputClass} placeholder="Area 7, Garki, Abuja" required />
          </Field>
          <Field label="Phone number">
            <input name="phone" className={inputClass} placeholder="0909987" required />
          </Field>
          <Field label="Password">
            <input name="password" className={inputClass} type="password" placeholder="••••••••••••••••" required />
          </Field>
          <Field label="Confirm password">
            <input
              name="confirmPassword"
              className={inputClass}
              type="password"
              placeholder="••••••••••••••••"
              required
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth className="mt-2 h-[52px]" disabled={busy}>
            {busy ? "Registering…" : "Register Institution"}
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
