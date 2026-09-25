"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { TextTabs } from "@/components/ui/Tabs";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Icon } from "@/components/icons/Icon";
import { UserGroup03Icon, PrisonGuardIcon, Briefcase01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { analyticsApi } from "@/lib/api/endpoints";
import type { AdminPerformance, OfficerPerformance } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "admins", label: "Admins" },
  { value: "officers", label: "Residents" },
];

const currentYear = new Date().getFullYear();
const YEARS = [0, 1, 2].map((offset) => {
  const y = String(currentYear - offset);
  return { label: y, value: y };
});

function StatCard({ icon, value, label }: { icon: IconSvgElement; value: number | string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[8px] border border-border px-6 py-5">
      <Icon icon={icon} size={26} strokeWidth={1.6} />
      <div className="flex-1">
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <Icon icon={ArrowRight01Icon} size={20} strokeWidth={1.75} />
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] bg-primary px-4 py-2 text-center text-white shadow-lg">
      <p className="text-[10px] leading-tight opacity-90">{label}</p>
      <p className="text-lg font-bold leading-tight">{payload[0].value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("overview");
  const [year, setYear] = useState(String(currentYear));

  const overview = useApi(() => analyticsApi.overview(), [], tab === "overview");
  const visitation = useApi(() => analyticsApi.visitationOverview(Number(year)), [year], tab === "overview");

  const months = visitation.data ?? [];
  const totalSignedIn = months.reduce((sum, m) => sum + (m.signedIn ?? 0), 0);
  const totalSignedOut = months.reduce((sum, m) => sum + (m.signedOut ?? 0), 0);

  return (
    <div>
      <PageTitle>Analytics</PageTitle>

      <PageCard className="px-7 py-7">
        <h2 className="mb-5 text-2xl font-bold text-ink">Report</h2>
        <TextTabs items={TABS} value={tab} onChange={setTab} className="mb-7" />

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard icon={UserGroup03Icon} value={overview.data?.totalVisitors ?? "—"} label="Total visitors" />
              <StatCard
                icon={PrisonGuardIcon}
                value={overview.data?.totalOfficers ?? "—"}
                label="Total Residents"
              />
              <StatCard
                icon={Briefcase01Icon}
                value={overview.data?.totalContractors ?? "—"}
                label="Total Contractors"
              />
            </div>

            <div className="mt-7 rounded-[8px] border border-border px-7 py-6">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-ink">Visitation Overview</h3>
                <Dropdown className="h-11 w-[140px]" value={year} options={YEARS} onChange={setYear} />
              </div>

              <div className="mt-4 flex gap-10">
                <div>
                  <p className="text-sm text-muted">Signed in</p>
                  <p className="text-xl font-bold text-ink">{totalSignedIn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Signed out</p>
                  <p className="text-xl font-bold text-ink">{totalSignedOut}</p>
                </div>
              </div>

              <div className="mt-6 h-[300px] w-full">
                {visitation.loading ? (
                  <p className="pt-24 text-center text-sm text-muted">Loading chart&hellip;</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={months} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d4af37" stopOpacity={0.75} />
                          <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} horizontal={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={8} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} width={40} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c9c9c9", strokeDasharray: "3 3" }} />
                      <Area
                        type="monotone"
                        dataKey="signedIn"
                        stroke="#d4af37"
                        strokeWidth={3}
                        fill="url(#goldFade)"
                        isAnimationActive={false}
                        activeDot={{ r: 7, fill: "#ffffff", stroke: "#d4af37", strokeWidth: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "admins" && <AdminsPerformance />}
        {tab === "officers" && <OfficersPerformance />}
      </PageCard>
    </div>
  );
}

function AdminsPerformance() {
  const { data, loading, error } = useApi(() => analyticsApi.adminsPerformance(), []);
  const rows = (data ?? []).map((r, i) => ({ ...r, _id: r._id ?? `admin-${i}` }));

  const columns: Column<AdminPerformance & { _id: string }>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "role", header: "Role", render: (r) => r.role ?? "—" },
    { key: "signedIn", header: "No of sign in visitors", render: (r) => r.signedIn ?? 0 },
    { key: "signedOut", header: "No of sign out visitors", render: (r) => r.signedOut ?? 0 },
  ];

  return (
    <div className="rounded-[8px] border border-border px-8 py-7">
      <h3 className="mb-5 border-b border-divider pb-4 text-xl font-bold text-ink">Admins Performance</h3>
      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading&hellip;</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-red">{error}</p>
      ) : (
        <DataTable columns={columns} rows={rows} leadingAvatar avatarKey={(r) => r.photoUrl} minHeight={380} />
      )}
    </div>
  );
}

function OfficersPerformance() {
  const { data, loading, error } = useApi(() => analyticsApi.officersPerformance(), []);
  const rows = (data ?? []).map((r, i) => ({ ...r, _id: r._id ?? `officer-${i}` }));

  const columns: Column<OfficerPerformance & { _id: string }>[] = [
    { key: "rank", header: "Rank", render: (r) => r.rank },
    { key: "name", header: "Name", render: (r) => r.name ?? "—" },
    { key: "department", header: "Department", render: (r) => r.department ?? "—" },
    { key: "visitors", header: "No of visitors", render: (r) => r.visitors ?? 0 },
  ];

  return (
    <div className="rounded-[8px] border border-border px-8 py-7">
      <h3 className="mb-5 border-b border-divider pb-4 text-xl font-bold text-ink">Residents Performance</h3>
      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading&hellip;</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-red">{error}</p>
      ) : (
        <DataTable columns={columns} rows={rows} leadingAvatar minHeight={380} />
      )}
    </div>
  );
}
