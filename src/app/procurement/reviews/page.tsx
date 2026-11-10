"use client";

import { useState } from "react";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { contractorsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { formatDate } from "@/lib/utils";
import type { Contractor } from "@/lib/types";

/** Every contractor document field, in submission order — see §4.4. */
const DOCUMENT_FIELDS: Array<[keyof Contractor, string]> = [
  ["companyProfileDoc", "Company profile"],
  ["cacCertificate", "CAC certificate"],
  ["taxClearanceCertificate", "Tax clearance certificate"],
  ["vatCertificate", "VAT certificate"],
  ["pencomCertificate", "Pencom certificate"],
  ["itfCertificate", "ITF certificate"],
  ["nsitfCertificate", "NSITF certificate"],
  ["bppRegistrationCertificate", "BPP registration certificate"],
  ["efccScumlCertificate", "EFCC/SCUML certificate"],
  ["ninDocument", "NIN document"],
  ["letterOfIntroduction", "Letter of introduction"],
];

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-[5px] text-[13px]">
      <span className="w-[160px] shrink-0 text-muted">{label}:</span>
      <span className="flex-1 text-ink">{value}</span>
    </div>
  );
}

export default function ProcurementReviewsPage() {
  const { data, loading, error, setData } = useApi<Contractor[]>(() => contractorsApi.pendingReview(), []);
  const rows = data ?? [];
  const [viewing, setViewing] = useState<Contractor | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function approve(contractor: Contractor) {
    setBusy(true);
    setActionError(null);
    try {
      await contractorsApi.approve(contractor._id);
      setData((prev) => (prev ?? []).filter((c) => c._id !== contractor._id));
      setViewing(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.messages.join(" ") : "Could not approve this contractor.");
    } finally {
      setBusy(false);
    }
  }

  async function reject(contractor: Contractor) {
    const reason = window.prompt(`Why is ${contractor.name ?? contractor.email}'s submission being rejected?`);
    if (!reason) return;
    setBusy(true);
    setActionError(null);
    try {
      await contractorsApi.reject(contractor._id, reason);
      setData((prev) => (prev ?? []).filter((c) => c._id !== contractor._id));
      setViewing(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.messages.join(" ") : "Could not reject this contractor.");
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Contractor>[] = [
    { key: "name", header: "Name", render: (c) => c.name ?? "—" },
    { key: "companyName", header: "Company", render: (c) => c.companyName ?? "—" },
    { key: "email", header: "Email address", width: "1.3fr", render: (c) => c.email },
    { key: "rcNumber", header: "RC number", render: (c) => c.rcNumber ?? "—" },
    { key: "validityTo", header: "Expiring date", render: (c) => formatDate(c.validityTo) },
    {
      key: "action",
      header: "",
      width: "120px",
      render: (c) => (
        <button onClick={() => setViewing(c)} className="text-sm font-semibold text-primary hover:underline">
          Review
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageTitle>Pending Reviews</PageTitle>

      <PageCard className="px-7 py-7">
        <h2 className="mb-6 text-2xl font-bold text-ink">Contractor registrations awaiting review</h2>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading submissions&hellip;</p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-red">{error}</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyLabel="Nothing awaiting review right now" />
        )}
      </PageCard>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Contractor submission" className="w-[640px]">
        {viewing && (
          <div className="px-7 py-6">
            <Row label="Name" value={viewing.name} />
            <Row label="Company name" value={viewing.companyName} />
            <Row label="Email" value={viewing.email} />
            <Row label="Phone" value={viewing.phone} />
            <Row label="Nationality" value={viewing.nationality} />
            <Row label="Address" value={viewing.addressOfContractor} />
            <Row label="Permanent address" value={viewing.permanentAddress} />
            <Row label="Office address" value={viewing.officeAddress} />
            <Row label="RC number" value={viewing.rcNumber} />
            <Row label="TIN" value={viewing.tin} />
            <Row label="BPP registration date" value={viewing.bppRegistrationDate ? formatDate(viewing.bppRegistrationDate) : undefined} />
            <Row
              label="Validity period"
              value={`${formatDate(viewing.validityFrom)} – ${formatDate(viewing.validityTo)}`}
            />

            <p className="mb-2 mt-5 text-sm font-semibold text-ink">Documents</p>
            <div className="flex flex-col gap-1.5">
              {DOCUMENT_FIELDS.map(([key, label]) => {
                const url = viewing[key];
                if (!url || typeof url !== "string") return null;
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {label}
                  </a>
                );
              })}
              {viewing.passportPhotos?.map((url, i) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Passport photo {i + 1}
                </a>
              ))}
            </div>

            {actionError && (
              <p role="alert" className="mt-5 rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button fullWidth disabled={busy} onClick={() => approve(viewing)}>
                Approve
              </Button>
              <Button fullWidth variant="destructive" disabled={busy} onClick={() => reject(viewing)}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
