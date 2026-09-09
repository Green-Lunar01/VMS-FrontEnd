"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { dispatchApi, officersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useApi } from "@/lib/api/useApi";
import type { Officer } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

/**
 * "Onboard New Dispatcher" panel on the Home dashboard. Posts to
 * POST /dispatch — the API requires a hostName and, if a real host account is
 * chosen, notifies them by email that a document has arrived.
 */
export function DispatchForm({ onCreated }: { onCreated?: () => void }) {
  const { data: officers } = useApi<Officer[]>(() => officersApi.list(), []);
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
    const host = (officers ?? []).find((o) => (o.user?._id ?? o._id) === hostId);
    if (!hostId || !host) {
      setError("Choose the host this document is for.");
      return;
    }
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);
    try {
      await dispatchApi.create({
        companyName: String(form.get("companyName") ?? ""),
        docOfficeDestination: String(form.get("docOfficeDestination") ?? ""),
        docTitle: String(form.get("docTitle") ?? ""),
        phone: String(form.get("phone") ?? ""),
        dispatcherName: String(form.get("dispatcherName") ?? ""),
        hostName: host.name,
        hostId,
      });
      // e.currentTarget is nulled by the time the await above resolves, so the
      // element reference has to be captured beforehand.
      formEl.reset();
      setHostId("");
      setDone(true);
      onCreated?.();
      window.setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not record this dispatch.");
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

      <Field label="Name of company">
        <input name="companyName" className={inputClass} placeholder="Name of company" required />
      </Field>
      <Field label="Doc office destination">
        <input
          name="docOfficeDestination"
          className={inputClass}
          placeholder="Office where the document is heading to"
          required
        />
      </Field>
      <Field label="Doc Title">
        <input name="docTitle" className={inputClass} placeholder="Title of document" required />
      </Field>
      <Field label="Phone number">
        <input name="phone" className={inputClass} placeholder="Phone number" type="tel" required />
      </Field>
      <Field label="Dispatcher name">
        <input name="dispatcherName" className={inputClass} placeholder="Dispatcher's name" required />
      </Field>
      <Field label="Host name">
        <Dropdown
          className="h-11 w-full"
          value={hostId}
          options={hostOptions.length ? hostOptions : [{ label: "Loading hosts…", value: "" }]}
          onChange={setHostId}
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-[4px] bg-primary-light px-4 py-3 text-sm text-primary-dark">
          Dispatch recorded. The host has been notified.
        </p>
      )}

      <Button type="submit" fullWidth className="mt-2 h-12" disabled={busy}>
        {busy ? "Submitting…" : "Enter to notify host"}
      </Button>
    </form>
  );
}
