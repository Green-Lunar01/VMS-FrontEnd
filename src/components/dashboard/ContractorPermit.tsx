import Image from "next/image";
import { cn } from "@/lib/utils";
import { useInstitutionBrand } from "@/lib/institution/InstitutionBrandContext";
import type { Contractor } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Faint repeated-crest pattern used inside the permit cards. Skipped without a logo to avoid a broken tile. */
function CrestPattern({ logoUrl }: { logoUrl?: string }) {
  if (!logoUrl) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: `url('${logoUrl}')`,
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
  const brand = useInstitutionBrand();
  const institutionName = brand?.name ?? "Institution";

  return (
    <div className={cn("relative overflow-hidden rounded-[10px] border border-border bg-white p-6", className)}>
      <CrestPattern logoUrl={brand?.logoUrl} />
      <div className="relative">
        <div className="flex items-center gap-3">
          {brand?.logoUrl && <Image src={brand.logoUrl} alt="" width={52} height={52} />}
          <div>
            <p className="font-display text-[22px] leading-tight text-primary">{institutionName.toUpperCase()}</p>
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
  const brand = useInstitutionBrand();
  const institutionName = brand?.name ?? "Institution";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-border bg-white px-10 py-10 text-center",
        className,
      )}
    >
      <CrestPattern logoUrl={brand?.logoUrl} />
      <div className="relative flex flex-col items-center">
        {brand?.logoUrl && <Image src={brand.logoUrl} alt="" width={62} height={62} />}
        <p className="mt-4 font-display text-[22px] leading-tight text-primary">{institutionName.toUpperCase()}</p>
        <p className="mt-5 max-w-[380px] text-sm leading-relaxed text-ink">
          This Personnel Identity Tag is the property of {institutionName}. If found, please return to{" "}
          {brand?.address || institutionName} or the nearest Military or Police Post.
        </p>
      </div>
    </div>
  );
}
