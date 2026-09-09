"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/Button";

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

/** "Onboard New Dispatcher" panel on the Home dashboard. */
export function DispatchForm({ onSubmit }: { onSubmit?: () => void }) {
  const [values, setValues] = useState({
    companyName: "",
    docOfficeDestination: "",
    docTitle: "",
    phone: "",
    dispatcherName: "",
  });

  function set(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit?.();
    setValues({ companyName: "", docOfficeDestination: "", docTitle: "", phone: "", dispatcherName: "" });
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
        <input className={inputClass} placeholder="Name of company" value={values.companyName} onChange={set("companyName")} required />
      </Field>
      <Field label="Doc office destination">
        <input
          className={inputClass}
          placeholder="Office where the document is heading to"
          value={values.docOfficeDestination}
          onChange={set("docOfficeDestination")}
          required
        />
      </Field>
      <Field label="Doc Title">
        <input className={inputClass} placeholder="Title of document" value={values.docTitle} onChange={set("docTitle")} required />
      </Field>
      <Field label="Phone number">
        <input className={inputClass} placeholder="Phone number" type="tel" value={values.phone} onChange={set("phone")} required />
      </Field>
      <Field label="Dispatcher name">
        <input className={inputClass} placeholder="Host name" value={values.dispatcherName} onChange={set("dispatcherName")} required />
      </Field>

      <Button type="submit" fullWidth className="mt-2 h-12">
        Enter to notify host
      </Button>
    </form>
  );
}
