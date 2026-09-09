"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import type { ModeOfEntry, Visitor } from "@/lib/types";

export function ApproveVisitorModal({
  visitor,
  open,
  onClose,
  onApprove,
}: {
  visitor: Visitor | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (guestTagNumber: string, modeOfEntry: ModeOfEntry) => Promise<void> | void;
}) {
  const [guestTagNumber, setGuestTagNumber] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState<ModeOfEntry | "">("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!modeOfEntry) return;
    setBusy(true);
    setError(null);
    try {
      await onApprove?.(guestTagNumber, modeOfEntry);
      setGuestTagNumber("");
      setModeOfEntry("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not sign this visitor in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign in visitor">
      <p className="mb-4 text-sm text-muted">
        Confirm gate details for <span className="font-semibold text-ink">{visitor?.name}</span> before signing them in.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Guest tag number"
          placeholder="e.g. TAG-1042"
          required
          value={guestTagNumber}
          onChange={(e) => setGuestTagNumber(e.target.value)}
        />
        <Select
          label="Mode of entry"
          placeholder="Select mode of entry"
          required
          value={modeOfEntry}
          onChange={(e) => setModeOfEntry(e.target.value as ModeOfEntry)}
          options={[
            { label: "Direct", value: "direct" },
            { label: "Indirect", value: "indirect" },
          ]}
        />
        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in\u2026" : "Sign in"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
