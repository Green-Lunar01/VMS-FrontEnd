"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchField } from "@/components/ui/Toolbar";
import { Icon } from "@/components/icons/Icon";
import { PencilEdit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { DEFAULT_SESSIONS } from "@/lib/mock-session";
import { formatDateTime } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

const ROLE_OPTIONS = [
  { label: "Super Admin", value: "Super Admin" },
  { label: "Employee", value: "Employee" },
];

interface PlatformAdmin {
  _id: string;
  name: string;
  role: string;
  email: string;
  createdAt: string;
  status: "active" | "inactive";
}

const ADMINS: PlatformAdmin[] = [
  { _id: "p1", name: "Ronald Richards", role: "Super Admin", email: "debbie.baker@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
  { _id: "p2", name: "Robert Fox", role: "Employee", email: "nevaeh.simmons@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
  { _id: "p3", name: "Darrell Steward", role: "Employee", email: "nathan.roberts@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
  { _id: "p4", name: "Jacob Jones", role: "Employee", email: "deanna.curtis@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
  { _id: "p5", name: "Darlene Robertson", role: "Employee", email: "willie.jennings@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
  { _id: "p6", name: "Brooklyn Simmons", role: "Employee", email: "kenzi.lawson@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "inactive" },
  { _id: "p7", name: "Savannah Nguyen", role: "Employee", email: "felicia.reid@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "inactive" },
  { _id: "p8", name: "Kathryn Murphy", role: "Employee", email: "alma.lawson@example.com", createdAt: "2025-02-22T17:00:00.000Z", status: "inactive" },
  { _id: "p9", name: DEFAULT_SESSIONS.super_admin.name, role: "Super Admin", email: DEFAULT_SESSIONS.super_admin.email, createdAt: "2025-02-22T17:00:00.000Z", status: "active" },
];

export default function PlatformAdminsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"admin" | "role">("admin");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PlatformAdmin | null>(null);

  const rows = useMemo(
    () => ADMINS.filter((a) => !query || [a.name, a.email].some((f) => f.toLowerCase().includes(query.toLowerCase()))),
    [query],
  );

  const columns: Column<PlatformAdmin>[] = [
    { key: "name", header: "Name", render: (a) => a.name },
    { key: "role", header: "Role", render: (a) => a.role },
    { key: "email", header: "Email address", width: "1.3fr", render: (a) => a.email },
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
          <button onClick={() => { setEditing(a); setCreating(false); }} className="text-ink hover:opacity-60" aria-label="Edit">
            <Icon icon={PencilEdit02Icon} size={19} strokeWidth={1.75} />
          </button>
          <button className="text-ink hover:opacity-60" aria-label="Delete">
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
        <AdminForm admin={editing} onDone={() => { setCreating(false); setEditing(null); }} />
      ) : (
        <DataTable columns={columns} rows={rows} minHeight={520} />
      )}
    </div>
  );
}

function AdminForm({ admin, onDone }: { admin: PlatformAdmin | null; onDone: () => void }) {
  const [role, setRole] = useState(admin?.role ?? "Employee");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex h-[68px] items-center rounded-[4px] bg-primary px-6">
        <h2 className="text-xl font-bold text-white">{admin ? "Update Admin" : "Add New Admin"}</h2>
      </div>

      <div className="grid grid-cols-1 gap-x-14 gap-y-6 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-ink">Full name</label>
          <input className={inputClass} placeholder="Full name" defaultValue={admin?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Email</label>
          <input className={inputClass} type="email" placeholder="Email" defaultValue={admin?.email} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Role</label>
          <Dropdown className="h-11 w-full" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Password</label>
          <input className={inputClass} type="password" placeholder="Password" required={!admin} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Confirm Password</label>
          <input className={inputClass} type="password" placeholder="Confirm password" required={!admin} />
        </div>
      </div>

      <Button type="submit" className="px-8">
        {admin ? "Update Admin" : "Create Admin"}
      </Button>
    </form>
  );
}
