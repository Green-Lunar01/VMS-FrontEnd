"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { officersApi, visitorsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import { ID_TYPE_OPTIONS } from "@/lib/labels";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import type { Officer } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

const VISITOR_TYPES = [
  { label: "Family", value: "family" },
  { label: "Friend", value: "friend" },
  { label: "Official", value: "official" },
  { label: "Relative", value: "relative" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

/**
 * "Onboard New Visitors" — a Security Officer registering someone who arrived
 * without a prior host submission. The visitor starts at awaiting_approval and
 * the named host is notified to confirm before they can be signed in.
 */
export function WalkInForm({ onCreated }: { onCreated?: () => void }) {
  const { data: officers } = useApi<Officer[]>(() => officersApi.list(), []);
  const [country, setCountry] = useState("Nigeria");
  const [idType, setIdType] = useState("nin");
  const [visitorType, setVisitorType] = useState("family");
  const [hostId, setHostId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const hostOptions = (officers ?? []).map((o) => ({
    label: `${o.rank ? `${o.rank} ` : ""}${o.name}`,
    value: o.user?._id ?? o._id,
  }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hostId) {
      setError("Choose the host this visitor is here to see.");
      return;
    }
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const escortNames = String(form.get("escortNames") ?? "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    setBusy(true);
    setError(null);
    try {
      await visitorsApi.walkIn({
        hostId,
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        country,
        idType,
        visitorType,
        escortCount: Number(form.get("escortCount") ?? 0),
        escortNames,
        phoneOrLaptop: false,
      });
      // e.currentTarget is nulled by the time the await above resolves, so the
      // element reference has to be captured beforehand.
      formEl.reset();
      setDone(true);
      onCreated?.();
      window.setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not onboard this visitor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex justify-center border-b border-divider pb-5">
        <div className="relative">
          <Image
            src="/branding/avatar-placeholder.png"
            alt=""
            width={110}
            height={110}
            className="h-[110px] w-[110px] rounded-full object-cover"
          />
          <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow">
            <Icon icon={Camera01Icon} size={17} />
          </span>
        </div>
      </div>

      <Field label="Visitor's country">
        <Dropdown className="h-11 w-full" value={country} options={COUNTRY_OPTIONS} onChange={setCountry} />
      </Field>
      <Field label="Full name">
        <input name="name" className={inputClass} placeholder="Full name" required />
      </Field>
      <Field label="Phone number">
        <input name="phone" className={inputClass} placeholder="Phone number" type="tel" required />
      </Field>
      <Field label="ID type">
        <Dropdown className="h-11 w-full" value={idType} options={ID_TYPE_OPTIONS} onChange={setIdType} />
      </Field>
      <Field label="Host name">
        <Dropdown
          className="h-11 w-full"
          value={hostId}
          options={hostOptions.length ? hostOptions : [{ label: "Loading hosts…", value: "" }]}
          onChange={setHostId}
        />
      </Field>
      <Field label="Type of visitor">
        <Dropdown className="h-11 w-full" value={visitorType} options={VISITOR_TYPES} onChange={setVisitorType} />
      </Field>
      <Field label="Escort">
        <input name="escortCount" className={inputClass} type="number" min={0} defaultValue={0} />
      </Field>
      <Field label="Escort names">
        <input name="escortNames" className={inputClass} placeholder="e.g. John Doe, Jane Doe" />
        <p className="text-xs text-muted">Separate multiple names with commas.</p>
      </Field>

      {error && (
        <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-[4px] bg-primary-light px-4 py-3 text-sm text-primary-dark">
          Visitor onboarded. The host has been notified to confirm.
        </p>
      )}

      <Button type="submit" fullWidth className="mt-2 h-12" disabled={busy}>
        {busy ? "Submitting…" : "Enter to notify host"}
      </Button>
    </form>
  );
}
