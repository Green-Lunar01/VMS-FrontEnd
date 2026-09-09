"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Toolbar, SearchField } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { ButtonTabs } from "@/components/ui/Tabs";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Icon } from "@/components/icons/Icon";
import { PencilEdit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { usersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { formatDateTime } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  institution_admin: "Int",
  security_officer: "Security officer",
};

const ROLE_OPTIONS = [
  { label: "Int", value: "institution_admin" },
  { label: "Security officer", value: "security_officer" },
];

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

export default function AdminsUsersPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("users");
  const [addOpen, setAddOpen] = useState(false);
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
    { key: "role", header: "Role", render: (a) => ROLE_LABEL[a.role] ?? a.role },
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
          <button onClick={() => setEditing(a)} className="text-ink hover:opacity-60" aria-label="Edit">
            <Icon icon={PencilEdit02Icon} size={19} strokeWidth={1.75} />
          </button>
          <button onClick={() => remove(a)} className="text-ink hover:opacity-60" aria-label="Delete">
            <Icon icon={Delete02Icon} size={19} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle>Admins/Users</PageTitle>

      <PageCard>
        <Toolbar>
          <SearchField
            className="w-[288px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
          <Button className="px-7">Search</Button>
          <Button className="ml-auto px-7" onClick={() => setAddOpen(true)}>
            Add new admin
          </Button>
        </Toolbar>

        <div className="px-7 py-6">
          <ButtonTabs
            items={[
              { value: "users", label: "Users" },
              { value: "role", label: "Role" },
            ]}
            value={view}
            onChange={setView}
            className="mb-6"
          />
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading admins&hellip;</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red">{error}</p>
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </div>
      </PageCard>

      <AdminFormModal open={addOpen} onClose={() => setAddOpen(false)} title="Add new admin" onDone={reload} />
      <AdminFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit admin"
        user={editing}
        onDone={reload}
      />
    </div>
  );
}

function AdminFormModal({
  open,
  onClose,
  title,
  user,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  user?: User | null;
  onDone: () => void;
}) {
  const [role, setRole] = useState<string>(user?.role ?? "security_officer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      if (user) {
        await usersApi.update(user._id, { name: String(form.get("name") ?? ""), role: role as Role });
      } else {
        await usersApi.createAdmin({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          role: role as "institution_admin" | "security_officer",
        });
      }
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not save this admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-12 py-7">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Name</label>
          <input name="name" className={inputClass} placeholder="Name" defaultValue={user?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Email</label>
          <input
            name="email"
            className={inputClass}
            placeholder="Email"
            type="email"
            defaultValue={user?.email}
            disabled={!!user}
            required={!user}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Role</label>
          <Dropdown className="h-11 w-full" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        </div>
        {!user && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Password</label>
            <input name="password" className={inputClass} placeholder="Password" type="password" required />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth className="mt-3 h-12" disabled={busy}>
          {busy ? "Saving…" : user ? "Save changes" : "Add"}
        </Button>
      </form>
    </Modal>
  );
}
