"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageTitle, PageCard } from "@/components/dashboard/PageHeader";
import { TextTabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/icons/Icon";
import { PencilEdit02Icon, ViewOffSlashIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { institutionsApi, usersApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useInstitutionBrand } from "@/lib/institution/InstitutionBrandContext";
import { getOfficerFieldConfig } from "@/lib/institution/officerFields";

const ROLE_DISPLAY: Record<string, string> = {
  institution_admin: "Int",
  security_officer: "Security officer",
  super_admin: "Super Admin",
};

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-primary";

export function PhotoBlock({
  isOrganization,
  onUploaded,
  onOrgUploaded,
}: {
  isOrganization?: boolean;
  onUploaded?: (user: import("@/lib/types").User) => void;
  onOrgUploaded?: (institution: import("@/lib/types").Institution) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      if (isOrganization) {
        const inst = await institutionsApi.uploadMyLogo(file);
        if (inst.logoUrl) setPreview(inst.logoUrl);
        onOrgUploaded?.(inst);
      } else {
        const updated = await usersApi.uploadPhoto(file);
        if (updated.photoUrl) setPreview(updated.photoUrl);
        onUploaded?.(updated);
      }
    } catch {
      window.alert("Upload failed. Images only, 5MB max.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-6 border-b border-divider pb-7">
      <Image
        src={preview ?? "/branding/avatar-placeholder.png"}
        alt=""
        width={120}
        height={120}
        className="h-[120px] w-[120px] rounded-full object-cover"
      />
      <div>
        <label className="inline-block cursor-pointer rounded-[4px] border border-border bg-white px-5 py-2.5 text-sm text-ink transition-colors hover:bg-grey">
          {busy ? "Uploading\u2026" : "Upload\u00a0 new photo"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Atleast 800 by 800 px recommended.
          <br />
          JPG and PNG is allowed
        </p>
      </div>
    </div>
  );
}

export function ProfileView({
  role = "institution_admin",
  changePasswordHref,
}: {
  role?: "institution_admin" | "security_officer" | "host" | "super_admin";
  changePasswordHref: string;
}) {
  const [tab, setTab] = useState("personal");
  const { user, setUser } = useAuth();
  const brand = useInstitutionBrand();
  const showOrganization = role === "institution_admin";
  const institution = useApi(() => institutionsApi.me(), [], showOrganization);
  // A Host's "role" is really Personnel/Staff/Resident depending on institution
  // type — ROLE_DISPLAY can't express that with a fixed lookup.
  const currentRole = user?.role ?? role;
  const roleLabel = currentRole === "host" ? getOfficerFieldConfig(brand?.type).personSingular : ROLE_DISPLAY[currentRole];

  return (
    <div>
      <PageTitle>Profile</PageTitle>

      <PageCard className="px-8 py-7">
        <div className="relative">
          {showOrganization && (
            <TextTabs
              className="mb-7"
              value={tab}
              onChange={setTab}
              items={[
                { value: "personal", label: "Personal" },
                { value: "organization", label: "Organization" },
              ]}
            />
          )}

          <PhotoBlock isOrganization={tab === "organization" && showOrganization} onUploaded={setUser} />

          {tab === "personal" || !showOrganization ? (
            <>
              <div className="flex items-center justify-between py-6">
                <h2 className="text-xl font-bold text-ink">Personal Info</h2>
                <EditButton />
              </div>
              <div className="rounded-[10px] border border-border px-10 py-9">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <ReadField label="Full name" value={user?.name ?? "—"} />
                  <ReadField label="Email address" value={user?.email ?? "—"} />
                  <ReadField label="Role" value={roleLabel} />
                </div>
                <PasswordBlock href={changePasswordHref} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-end py-6">
                <EditButton />
              </div>
              <div className="max-w-[760px] rounded-[10px] border border-border px-14 py-10">
                <div className="flex flex-col gap-5">
                  <LabelledInput label="Organization name" defaultValue={institution.data?.name ?? ""} />
                  <LabelledInput label="Email address" defaultValue={institution.data?.email ?? ""} />
                  <LabelledInput label="Organization address" defaultValue={institution.data?.address ?? ""} />
                  <PasswordField href={changePasswordHref} />
                </div>
              </div>
            </>
          )}
        </div>
      </PageCard>
    </div>
  );
}

function EditButton() {
  return (
    <button className="flex items-center gap-2 rounded-[4px] border border-border bg-white px-4 py-2 text-sm text-ink transition-colors hover:bg-grey">
      <Icon icon={PencilEdit02Icon} size={17} strokeWidth={1.75} />
      Edit
    </button>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1.5 text-sm text-ink">{value}</p>
    </div>
  );
}

function LabelledInput({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      <input className={inputClass} defaultValue={defaultValue} />
    </div>
  );
}

function PasswordBlock({ href }: { href: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pt-10">
      <p className="text-sm text-muted">Password</p>
      <div className="mt-1.5 flex items-center gap-6">
        <span className="text-sm tracking-widest text-ink">{show ? "StrongPass1!" : "***********"}</span>
        <button onClick={() => setShow((s) => !s)} className="text-ink hover:opacity-60" aria-label="Toggle password">
          <Icon icon={show ? ViewIcon : ViewOffSlashIcon} size={19} strokeWidth={1.6} />
        </button>
      </div>
      <Link href={href} className="mt-3 inline-block text-sm text-red hover:underline">
        Change password
      </Link>
    </div>
  );
}

function PasswordField({ href }: { href: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">Password</label>
      <div className="relative w-[280px]">
        <input className={inputClass} type={show ? "text" : "password"} defaultValue="StrongPassword1!" readOnly />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink hover:opacity-60"
          aria-label="Toggle password"
        >
          <Icon icon={show ? ViewIcon : ViewOffSlashIcon} size={19} strokeWidth={1.6} />
        </button>
      </div>
      <Link href={href} className="mt-1 inline-block text-sm text-red hover:underline">
        Change password
      </Link>
    </div>
  );
}
