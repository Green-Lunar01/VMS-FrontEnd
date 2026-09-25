"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { officersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Officer } from "@/lib/types";

const SERVICE_OPTIONS = [
  { label: "Army", value: "army" },
  { label: "Navy", value: "navy" },
  { label: "Air force", value: "air_force" },
];

const RANK_OPTIONS = [
  { label: "Lieutenant", value: "Lieutenant" },
  { label: "Captain", value: "Captain" },
  { label: "Major", value: "Major" },
  { label: "Colonel", value: "Colonel" },
  { label: "Brigadier General", value: "Brigadier General" },
  { label: "Major General", value: "Major General" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

/**
 * "Add new Resident" popup. No password field — the API generates a
 * temporary one and emails it, with mustChangePassword set.
 */
export function AddOfficerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (officer: Officer) => void;
}) {
  const [serviceType, setServiceType] = useState("army");
  const [rank, setRank] = useState("Lieutenant");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const officer = await officersApi.create({
        serviceType,
        rank,
        name: String(form.get("name") ?? ""),
        appointment: String(form.get("appointment") ?? ""),
        branch: String(form.get("branch") ?? ""),
        department: String(form.get("department") ?? ""),
        phone: String(form.get("phone") ?? ""),
        serviceNumber: String(form.get("serviceNumber") ?? ""),
        email: String(form.get("email") ?? ""),
      });
      onCreated?.(officer);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not add this officer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add new Resident">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-12 py-7">
        <Field label="Service type">
          <Dropdown className="h-11 w-full" value={serviceType} options={SERVICE_OPTIONS} onChange={setServiceType} />
        </Field>
        <Field label="Rank">
          <Dropdown className="h-11 w-full" value={rank} options={RANK_OPTIONS} onChange={setRank} />
        </Field>
        <Field label="Name">
          <input name="name" className={inputClass} placeholder="Name" required />
        </Field>
        <Field label="Appointment">
          <input name="appointment" className={inputClass} placeholder="Appointment" required />
        </Field>
        <Field label="Department">
          <input name="department" className={inputClass} placeholder="Department" required />
        </Field>
        {/* Visible label only — the field still posts as "branch" to match the API's DTO. */}
        <Field label="Directorate">
          <input name="branch" className={inputClass} placeholder="Directorate" required />
        </Field>
        <Field label="Phone Number">
          <input name="phone" className={inputClass} placeholder="Phone number" type="tel" required />
        </Field>
        <Field label="Service No">
          <input name="serviceNumber" className={inputClass} placeholder="Phone number" required />
        </Field>
        <Field label="Email">
          <input name="email" className={inputClass} placeholder="Email" type="email" required />
        </Field>

        <p className="text-xs text-muted">
          There&apos;s no password field — a temporary password is generated automatically and
          emailed to this address, and they&apos;ll be asked to set their own on first login.
        </p>

        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth className="mt-3 h-12" disabled={busy}>
          {busy ? "Adding…" : "Add"}
        </Button>
      </form>
    </Modal>
  );
}
