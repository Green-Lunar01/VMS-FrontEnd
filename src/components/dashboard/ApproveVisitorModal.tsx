"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
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
  const [done, setDone] = useState(false);

  function handleClose() {
    setGuestTagNumber("");
    setModeOfEntry("");
    setError(null);
    setDone(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!modeOfEntry) return;
    setBusy(true);
    setError(null);
    try {
      await onApprove?.(guestTagNumber, modeOfEntry);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not sign this visitor in.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Modal open={open} onClose={handleClose} hideHeader className="w-[340px]">
        <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
          <Image src="/branding/success-check.png" alt="" width={72} height={72} />
          <div>
            <p className="text-base font-bold text-ink">Visitor signed in</p>
            <p className="mt-1 text-sm text-muted">{visitor?.name} has been signed in at the gate.</p>
          </div>
          <Button fullWidth onClick={handleClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sign in visitor">
      <div className="px-6 py-6">
        <p className="mb-5 text-sm text-muted">
          Confirm gate details for <span className="font-semibold text-ink">{visitor?.name}</span> before signing them in.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in\u2026" : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
