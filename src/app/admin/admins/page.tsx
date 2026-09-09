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
import { mockAdmins } from "@/data/mock-data";
import { formatDateTime } from "@/lib/utils";
import type { User } from "@/lib/types";

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

  const rows = useMemo(
    () => mockAdmins.filter((a) => !query || [a.name, a.email].some((f) => f.toLowerCase().includes(query.toLowerCase()))),
    [query],
  );

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (a) => a.name },
    { key: "role", header: "Role", render: (a) => ROLE_LABEL[a.role] ?? a.role },
    { key: "email", header: "Email address", render: (a) => a.email },
    { key: "createdAt", header: "Date created", render: (a) => formatDateTime(a.createdAt) },
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
          <button className="text-ink hover:opacity-60" aria-label="Delete">
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
          <DataTable columns={columns} rows={rows} />
        </div>
      </PageCard>

      <AdminFormModal open={addOpen} onClose={() => setAddOpen(false)} title="Add new admin" />
      <AdminFormModal open={!!editing} onClose={() => setEditing(null)} title="Edit admin" user={editing} />
    </div>
  );
}

function AdminFormModal({
  open,
  onClose,
  title,
  user,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  user?: User | null;
}) {
  const [role, setRole] = useState(user?.role ?? "security_officer");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-12 py-7">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Name</label>
          <input className={inputClass} placeholder="Name" defaultValue={user?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Email</label>
          <input className={inputClass} placeholder="Email" type="email" defaultValue={user?.email} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Role</label>
          <Dropdown className="h-11 w-full" value={role} options={ROLE_OPTIONS} onChange={(v) => setRole(v as User["role"])} />
        </div>
        {!user && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Password</label>
            <input className={inputClass} placeholder="Password" type="password" required />
          </div>
        )}
        <Button type="submit" fullWidth className="mt-3 h-12">
          {user ? "Save changes" : "Add"}
        </Button>
      </form>
    </Modal>
  );
}
