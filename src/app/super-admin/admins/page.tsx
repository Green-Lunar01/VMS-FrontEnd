"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/Toolbar";
import { Icon } from "@/components/icons/Icon";
import { PencilEdit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { usersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { formatDateTime } from "@/lib/utils";
import type { User } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

export default function PlatformAdminsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"admin" | "role">("admin");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const { data, loading, error, reload, setData } = useApi<User[]>(() => usersApi.list(), []);

  const rows = useMemo(() => {
    const all = data ?? [];
    const filtered = query
      ? all.filter((a) => [a.name, a.email].some((f) => f?.toLowerCase().includes(query.toLowerCase())))
      : all;
    return view === "role" ? [...filtered].sort((a, b) => a.role.localeCompare(b.role)) : filtered;
  }, [data, query, view]);

  async function remove(user: User) {
    if (!window.confirm(`Remove ${user.name}?`)) return;
    try {
      await usersApi.remove(user._id);
      setData((prev) => (prev ?? []).filter((u) => u._id !== user._id));
    } catch {
      reload();
    }
  }

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (a) => a.name },
    { key: "role", header: "Role", render: (a) => (a.role === "super_admin" ? "Super Admin" : "Employee") },
    { key: "email", header: "Email address", width: "1.3fr", render: (a) => a.email },
    { key: "createdAt", header: "Date created", render: (a) => (a.createdAt ? formatDateTime(a.createdAt) : "—") },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <span className={a.status === "active" ? "text-primary" : "text-red"}>
          {a.status === "active" ? "Online" : "Offline"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "110px",
      render: (a) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditing(a);
              setCreating(false);
            }}
            className="text-ink hover:opacity-60"
            aria-label="Edit"
          >
            <Icon icon={PencilEdit02Icon} size={19} strokeWidth={1.75} />
          </button>
          <button onClick={() => remove(a)} className="text-ink hover:opacity-60" aria-label="Delete">
            <Icon icon={Delete02Icon} size={19} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  const showForm = creating || !!editing;

  return (
    <div className="rounded-[10px] bg-white p-6">
      <div className="rounded-[6px] bg-grey px-6 py-6">
        <h1 className="text-[22px] font-bold tracking-wide text-ink">ADMIN</h1>
      </div>

      <div className="flex flex-wrap items-center gap-5 border-b border-divider py-6">
        <SearchField
          className="w-[288px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
        <Button className="px-7">Search</Button>
        <Button
          className="ml-auto px-7"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          Add new admin
        </Button>
      </div>

      <div className="flex items-center gap-5 py-6">
        <Button
          variant={view === "admin" && !showForm ? "primary" : "outline"}
          className="min-w-[86px]"
          onClick={() => {
            setView("admin");
            setCreating(false);
            setEditing(null);
          }}
        >
          Admin
        </Button>
        <Button
          variant={view === "role" && !showForm ? "primary" : "outline"}
          className="min-w-[86px]"
          onClick={() => {
            setView("role");
            setCreating(false);
            setEditing(null);
          }}
        >
          Role
        </Button>
      </div>

      {showForm ? (
        <AdminForm
          admin={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
            reload();
          }}
        />
      ) : loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading admins&hellip;</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-red">{error}</p>
      ) : (
        <DataTable columns={columns} rows={rows} minHeight={520} />
      )}
    </div>
  );
}

function AdminForm({ admin, onDone }: { admin: User | null; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (!admin && password !== String(form.get("confirmPassword") ?? "")) {
      setError("The passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (admin) {
        await usersApi.update(admin._id, { name: String(form.get("name") ?? "") });
      } else {
        // Platform admins are always super_admin — the API decides the role.
        await usersApi.createPlatformAdmin({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not save this admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex h-[68px] items-center rounded-[4px] bg-primary px-6">
        <h2 className="text-xl font-bold text-white">{admin ? "Update Admin" : "Add New Admin"}</h2>
      </div>

      <div className="grid grid-cols-1 gap-x-14 gap-y-6 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-ink">Full name</label>
          <input name="name" className={inputClass} placeholder="Full name" defaultValue={admin?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Email</label>
          <input
            name="email"
            className={inputClass}
            type="email"
            placeholder="Email"
            defaultValue={admin?.email}
            disabled={!!admin}
            required={!admin}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Role</label>
          <input className={inputClass} value="Super Admin" readOnly disabled />
        </div>
        {!admin && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Password</label>
              <input name="password" className={inputClass} type="password" placeholder="Password" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Confirm Password</label>
              <input
                name="confirmPassword"
                className={inputClass}
                type="password"
                placeholder="Confirm password"
                required
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}

      <Button type="submit" className="px-8" disabled={busy}>
        {busy ? "Saving…" : admin ? "Update Admin" : "Create Admin"}
      </Button>
    </form>
  );
}
