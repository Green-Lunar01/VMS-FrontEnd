"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { visitorsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { ID_TYPE_LABEL, VISITOR_STATUS_LABEL } from "@/lib/labels";
import { formatDate, timeRange, visitorTypeLabel } from "@/lib/utils";
import type { Visitor } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-[5px] text-[13px]">
      <span className="w-[120px] shrink-0 text-muted">{label}:</span>
      <span className="flex-1 text-ink">{value}</span>
    </div>
  );
}

/**
 * §4.3a of FRONTEND_INTEGRATION_GUIDE.md — a second way to find a
 * pre-registered visitor at the gate, alongside the existing Visitors Log
 * search. Read-only: GET /visitors/by-code/:code doesn't sign anyone in by
 * itself, so this just shows the visit detail and hands off to the same
 * "Sign in" flow used everywhere else once found.
 */
export function VisitorCodeLookup({ onSignIn }: { onSignIn: (visitor: Visitor) => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Visitor | null>(null);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    setFound(null);
    try {
      setFound(await visitorsApi.getByCode(code.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "No visitor found with that code.");
    } finally {
      setBusy(false);
    }
  }

  const canSignIn = found?.status === "submitted" || found?.status === "confirmed";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted">
        A visitor can share the code their host gave them when submitting a visit — type it in to
        pull up their details instead of searching the log.
      </p>
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Visitation code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={inputClass}
            placeholder="e.g. K7M2XQ"
            maxLength={6}
          />
        </div>
        <Button type="submit" fullWidth className="h-12" disabled={busy}>
          {busy ? "Searching…" : "Find visitor"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}

      {found && (
        <div className="rounded-[10px] border border-border p-4">
          <p className="mb-2 text-base font-bold text-ink">{found.name}</p>
          <Row label="Visitor type" value={visitorTypeLabel(found)} />
          <Row label="Host name" value={found.host?.name} />
          <Row label="Phone number" value={found.phone} />
          <Row label="ID type" value={ID_TYPE_LABEL[found.idType]} />
          <Row label="Plate number" value={found.plateNumber} />
          <Row label="Escort" value={found.escortCount} />
          <Row label="Escort names" value={found.escortNames.join(", ")} />
          <Row label="Expected date" value={found.expectedDate ? formatDate(found.expectedDate) : undefined} />
          <Row label="Expected time" value={timeRange(found.expectedTimeFrom, found.expectedTimeTo)} />
          <Row label="Status" value={VISITOR_STATUS_LABEL[found.status]} />

          {canSignIn ? (
            <Button fullWidth className="mt-4 h-12" onClick={() => onSignIn(found)}>
              Sign In
            </Button>
          ) : (
            <p className="mt-4 text-sm text-muted">
              This visitor can&apos;t be signed in right now (status: {VISITOR_STATUS_LABEL[found.status]}).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
