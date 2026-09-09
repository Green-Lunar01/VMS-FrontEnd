"use client";

import { Icon } from "@/components/icons/Icon";
import { ArrowUpRight01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { institutionsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { formatDate } from "@/lib/utils";
import type { Institution } from "@/lib/types";

const GRADIENTS: Record<string, string> = {
  green: "bg-[linear-gradient(135deg,#0a8f5b_0%,#046b41_60%,#02502f_100%)]",
  gold: "bg-[linear-gradient(135deg,#e0c258_0%,#d0a92f_60%,#b08c1f_100%)]",
  red: "bg-[linear-gradient(135deg,#ef3a3f_0%,#d21c22_60%,#a8161b_100%)]",
};

function StatCard({
  label,
  value,
  tone,
  delta,
}: {
  label: string;
  value: string;
  tone: keyof typeof GRADIENTS;
  delta?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[8px] px-6 py-6 text-white ${GRADIENTS[tone]}`}>
      <div className="flex items-start justify-between">
        <p className="text-base font-medium">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
          <Icon icon={ArrowUpRight01Icon} size={17} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-4 text-4xl font-bold">{value}</p>
      {delta && (
        <p className="mt-5 flex items-center gap-1.5 text-xs">
          <Icon icon={ArrowUp01Icon} size={15} strokeWidth={2} />
          {delta}
        </p>
      )}
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const stats = useApi(() => institutionsApi.stats(), []);
  const institutions = useApi<Institution[]>(() => institutionsApi.list(), []);

  const s = stats.data;
  const growth = s?.growthPercentThisMonth;
  const recent = (institutions.data ?? []).slice(0, 12);

  return (
    <div>
      <div className="grid grid-cols-1 gap-[60px] md:grid-cols-3">
        <StatCard
          label="Total Institutions"
          value={s ? String(s.totalInstitutions) : "—"}
          tone="green"
          delta={growth !== undefined ? `${growth}% increase this month` : undefined}
        />
        <StatCard
          label="Total Institution activities"
          value={s ? `${s.activeInstitutionsPercent}%` : "—"}
          tone="gold"
          delta={growth !== undefined ? `${growth}% increase this month` : undefined}
        />
        <StatCard
          label="Deactivated accounts"
          value={s ? String(s.deactivatedInstitutions) : "—"}
          tone="red"
          delta={growth !== undefined ? `${growth}% increase this month` : undefined}
        />
      </div>

      {stats.error && <p className="mt-4 text-sm text-red">{stats.error}</p>}

      <div className="mt-9 rounded-[10px] bg-white px-9 py-8">
        <h2 className="mb-6 text-base font-semibold text-muted">Recently added Institutions</h2>

        {institutions.loading ? (
          <p className="py-10 text-center text-sm text-muted">Loading institutions&hellip;</p>
        ) : institutions.error ? (
          <p className="py-10 text-center text-sm text-red">{institutions.error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#d9d9d9]">
                  <th className="px-4 py-3.5 text-left font-semibold text-ink">Organization name</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink">Email address</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink">Organization address</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink">Sign-up date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i._id}>
                    <td className="px-4 py-3.5 text-ink">{i.name}</td>
                    <td className="px-4 py-3.5 text-ink">{i.email}</td>
                    <td className="px-4 py-3.5 text-ink">{i.address}</td>
                    <td className="px-4 py-3.5 text-ink">{i.createdAt ? formatDate(i.createdAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
