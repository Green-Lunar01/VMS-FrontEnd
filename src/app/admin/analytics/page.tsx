"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { TextTabs } from "@/components/ui/Tabs";
import { Dropdown } from "@/components/ui/Dropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Icon } from "@/components/icons/Icon";
import { UserGroup03Icon, PrisonGuardIcon, Briefcase01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "admins", label: "Admins" },
  { value: "officers", label: "Officers/Soldiers" },
];

const MONTHLY = [
  { month: "Jan", value: 215 },
  { month: "Feb", value: 120 },
  { month: "March", value: 70 },
  { month: "April", value: 62 },
  { month: "May", value: 110 },
  { month: "June", value: 190 },
  { month: "July", value: 250 },
  { month: "Aug", value: 235 },
  { month: "Sep", value: 175 },
  { month: "Oct", value: 120 },
  { month: "Nov", value: 100 },
  { month: "Dec", value: 98 },
];

const YEARS = [
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
];

function StatCard({ icon, value, label }: { icon: IconSvgElement; value: number; label: string }) {
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
    <div className="relative">
      <div className="rounded-[6px] bg-primary px-4 py-2 text-center text-white shadow-lg">
        <p className="text-[10px] leading-tight opacity-90">{label} 2025</p>
        <p className="text-lg font-bold leading-tight">{payload[0].value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("overview");
  const [year, setYear] = useState("2025");

  return (
    <div>
      <PageTitle>Analytics</PageTitle>

      <PageCard className="px-7 py-7">
        <div className="relative">
          <h2 className="mb-5 text-2xl font-bold text-ink">Report</h2>
          <TextTabs items={TABS} value={tab} onChange={setTab} className="mb-7" />

          {tab === "overview" && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard icon={UserGroup03Icon} value={789} label="Total visitors" />
                <StatCard icon={PrisonGuardIcon} value={789} label="Total Officers/Soldiers" />
                <StatCard icon={Briefcase01Icon} value={876} label="Total Contractors" />
              </div>

              <div className="mt-7 rounded-[8px] border border-border px-7 py-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-ink">Visitation Overview</h3>
                  <Dropdown className="h-11 w-[140px]" value={year} options={YEARS} onChange={setYear} />
                </div>

                <div className="mt-4 flex gap-10">
                  <div>
                    <p className="text-sm text-muted">Signed in</p>
                    <p className="text-xl font-bold text-ink">89</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Signed out</p>
                    <p className="text-xl font-bold text-ink">89</p>
                  </div>
                </div>

                <div className="mt-6 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d4af37" stopOpacity={0.75} />
                          <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} horizontal={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        dy={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        width={40}
                        ticks={[0, 50, 100, 150, 200]}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c9c9c9", strokeDasharray: "3 3" }} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#d4af37"
                        strokeWidth={3}
                        fill="url(#goldFade)"
                        isAnimationActive={false}
                        activeDot={{ r: 7, fill: "#ffffff", stroke: "#d4af37", strokeWidth: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {tab === "admins" && <AdminsPerformance />}
          {tab === "officers" && <OfficersPerformance />}
        </div>
      </PageCard>
    </div>
  );
}

interface AdminPerf {
  _id: string;
  name: string;
  role: string;
  signIn: number;
  signOut: number;
  photoUrl?: string;
}

const ADMIN_ROWS: AdminPerf[] = [
  { _id: "a1", name: "Courtney Henry", role: "Int", signIn: 27, signOut: 78 },
  { _id: "a2", name: "Dianne Russell", role: "Security Officer", signIn: 27, signOut: 78 },
  { _id: "a3", name: "Bessie Cooper", role: "Security officer", signIn: 27, signOut: 78 },
  { _id: "a4", name: "Darrell Steward", role: "Int", signIn: 27, signOut: 78 },
];

function AdminsPerformance() {
  const columns: Column<AdminPerf>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "role", header: "Role", render: (r) => r.role },
    { key: "signIn", header: "No of sign in visitors", render: (r) => r.signIn },
    { key: "signOut", header: "No of sign out visitors", render: (r) => r.signOut },
  ];
  return (
    <div className="rounded-[8px] border border-border px-8 py-7">
      <h3 className="mb-5 border-b border-divider pb-4 text-xl font-bold text-ink">Admins Performance</h3>
      <DataTable columns={columns} rows={ADMIN_ROWS} leadingAvatar minHeight={380} />
    </div>
  );
}

interface OfficerPerf {
  _id: string;
  name: string;
  rank: string;
  department: string;
  visitors: number;
}

const OFFICER_ROWS: OfficerPerf[] = [
  { _id: "o1", name: "Musa John", rank: "Major", department: "Defence logistics", visitors: 62 },
  { _id: "o2", name: "Chidi Okafor", rank: "Colonel", department: "Communications", visitors: 41 },
  { _id: "o3", name: "Amina Bello", rank: "Lt. Commander", department: "Naval Operations", visitors: 27 },
  { _id: "o4", name: "Tunde Adeyemi", rank: "Wing Commander", department: "Air Logistics", visitors: 18 },
];

function OfficersPerformance() {
  const columns: Column<OfficerPerf>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "rank", header: "Rank", render: (r) => r.rank },
    { key: "department", header: "Department", render: (r) => r.department },
    { key: "visitors", header: "No of visitors", render: (r) => r.visitors },
  ];
  return (
    <div className="rounded-[8px] border border-border px-8 py-7">
      <h3 className="mb-5 border-b border-divider pb-4 text-xl font-bold text-ink">Officers/Soldiers Performance</h3>
      <DataTable columns={columns} rows={OFFICER_ROWS} leadingAvatar minHeight={380} />
    </div>
  );
}
