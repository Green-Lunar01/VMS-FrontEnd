"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { officersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Officer } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-4 py-1">
      <span className="w-[150px] shrink-0 text-sm text-muted">{label}:</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

/**
 * "Login Credential" popup. The API never reveals an existing password — only
 * hashes are stored — so this offers the resend action, which issues a fresh
 * temporary password and emails it to the officer.
 */
export function OfficerCredentialsModal({
  officer,
  open,
  onClose,
}: {
  officer: Officer | null;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    if (!officer) return;
    setStatus("sending");
    setError(null);
    try {
      await officersApi.resendCredentials(officer._id);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not send the credentials.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setStatus("idle");
        setError(null);
        onClose();
      }}
      title="Login Credential"
      hideHeader
      className="w-[414px]"
    >
      <div className="px-8 pb-9 pt-14">
        <div className="mb-8 flex h-[68px] items-center justify-center rounded-[2px] bg-primary">
          <p className="text-2xl font-bold text-white">Login Credential</p>
        </div>

        <div className="flex justify-center pb-6">
          <Image
            src={officer?.photoUrl || "/branding/avatar-placeholder.png"}
            alt=""
            width={120}
            height={120}
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
        </div>

        <div className="pl-2">
          <Row label="Username" value={officer?.name} />
          <Row label="Email" value={officer?.email} />
          <Row label="Rank" value={officer?.rank} />
          <Row label="Service no." value={officer?.serviceNumber} />
          <Row label="No of visitors received" value={officer?.visitorsReceivedCount} />
        </div>

        <div className="mt-8 text-center">
          {status === "sent" ? (
            <p className="text-sm text-primary">
              A new password has been emailed to {officer?.email}. The old one no longer works.
            </p>
          ) : (
            <button
              onClick={resend}
              disabled={status === "sending"}
              className="text-sm font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Share credential with account owner"}
            </button>
          )}
          {status !== "sent" && <p className="mt-1 text-sm text-muted">{officer?.email}</p>}
          {error && <p className="mt-2 text-sm text-red">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}
