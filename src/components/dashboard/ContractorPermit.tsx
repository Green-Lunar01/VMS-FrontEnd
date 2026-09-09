import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Contractor } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Faint repeated-crest pattern used inside the permit cards. */
function CrestPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: "url('/branding/dhq-crest.png')",
        backgroundSize: "46px 46px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-[3px]">
      <span className="w-[118px] shrink-0 text-[13px] text-muted">{label}:</span>
      <span className="text-[13px] text-ink">{value ?? ""}</span>
    </div>
  );
}

export function PermitFront({ contractor, className }: { contractor?: Partial<Contractor>; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[10px] border border-border bg-white p-6", className)}>
      <CrestPattern />
      <div className="relative">
        <div className="flex items-center gap-3">
          <Image src="/branding/dhq-crest.png" alt="" width={52} height={52} />
          <div>
            <p className="font-display text-[22px] leading-tight text-primary">DEFENCE HEADQUARTERS</p>
            <p className="text-center text-base font-bold tracking-wide text-ink">CONTRACTOR PERMIT</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <Image
            src={contractor?.photoUrl || "/branding/avatar-placeholder.png"}
            alt=""
            width={110}
            height={110}
            className="h-[110px] w-[110px] shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <Row label="Name" value={contractor?.name} />
            <Row label="Company name" value={contractor?.companyName} />
            <Row label="Email address" value={contractor?.email} />
            <Row
              label="Validity period"
              value={
                contractor?.validityFrom && contractor?.validityTo
                  ? `${formatDate(contractor.validityFrom)} - ${formatDate(contractor.validityTo)}`
                  : undefined
              }
            />
            <Row label="Phone number" value={contractor?.phone} />
            <Row label="ID number" value={contractor?.idNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PermitBack({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-border bg-white px-10 py-10 text-center",
        className,
      )}
    >
      <CrestPattern />
      <div className="relative flex flex-col items-center">
        <Image src="/branding/dhq-crest.png" alt="" width={62} height={62} />
        <p className="mt-4 font-display text-[22px] leading-tight text-primary">DEFENCE HEADQUARTERS</p>
        <p className="text-lg font-bold tracking-wide text-ink">ABUJA</p>
        <p className="mt-5 max-w-[380px] text-sm leading-relaxed text-ink">
          This Personnel Identity Tag is the Property of Deference Headquarters. If found please return to Deference
          Headquarters Complex, Area 7, Garki, Abuja or nearest Military or Police Post
        </p>
      </div>
    </div>
  );
}
