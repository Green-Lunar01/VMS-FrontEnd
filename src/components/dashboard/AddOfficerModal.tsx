"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

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

/** "Add new Officer/Soldier" — a popup in the Figma file, not a page. */
export function AddOfficerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (email: string) => void;
}) {
  const [serviceType, setServiceType] = useState("army");
  const [rank, setRank] = useState("Lieutenant");
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onCreated?.(email);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add new Officer/Soldier">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-12 py-7">
        <Field label="Service type">
          <Dropdown className="h-11 w-full" value={serviceType} options={SERVICE_OPTIONS} onChange={setServiceType} />
        </Field>
        <Field label="Rank">
          <Dropdown className="h-11 w-full" value={rank} options={RANK_OPTIONS} onChange={setRank} />
        </Field>
        <Field label="Name">
          <input className={inputClass} placeholder="Name" required />
        </Field>
        <Field label="Appointment">
          <input className={inputClass} placeholder="Appointment" required />
        </Field>
        <Field label="Branch">
          <input className={inputClass} placeholder="Branch" required />
        </Field>
        <Field label="Department">
          <input className={inputClass} placeholder="Branch" required />
        </Field>
        <Field label="Phone Number">
          <input className={inputClass} placeholder="Phone number" type="tel" required />
        </Field>
        <Field label="Service No">
          <input className={inputClass} placeholder="Phone number" required />
        </Field>
        <Field label="Email">
          <input
            className={inputClass}
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button type="submit" fullWidth className="mt-3 h-12">
          Add
        </Button>
      </form>
    </Modal>
  );
}
