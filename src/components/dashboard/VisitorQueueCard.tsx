import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ID_TYPE_LABEL, VISITOR_STATUS_LABEL, VISITOR_TYPE_LABEL, SERVICE_TYPE_LABEL } from "@/lib/labels";
import { agentName, formatDate, timeRange } from "@/lib/utils";
import type { Visitor, ServiceType } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-[5px] text-[13px]">
      <span className="w-[112px] shrink-0 text-muted">{label}:</span>
      <span className="flex-1 text-ink">{value}</span>
    </div>
  );
}

type Variant = "submitted" | "cancelled" | "signed_in" | "signed_out";

/**
 * The "Submitted Visitors" column lumps together submitted/confirmed AND
 * awaiting_approval walk-ins, but only the first two can actually be signed
 * in — the API rejects approve() until the host confirms. Driven off the
 * visitor's own status rather than the column's variant so that distinction
 * shows up on the card instead of offering a "Sign In" that will just fail.
 */
function actionFor(visitor: Visitor): { label: string; buttonVariant: "primary" | "destructive" | "muted"; disabled: boolean } | null {
  switch (visitor.status) {
    case "signed_in":
      return { label: "Sign Out", buttonVariant: "destructive", disabled: false };
    case "awaiting_approval":
      return { label: "Awaiting confirmation", buttonVariant: "muted", disabled: true };
    case "submitted":
    case "confirmed":
      return { label: "Sign In", buttonVariant: "primary", disabled: false };
    case "cancelled":
      return { label: "Sign In", buttonVariant: "muted", disabled: true };
    default:
      return null;
  }
}

/** Visitor card used in the Home dashboard queue columns. */
export function VisitorQueueCard({
  visitor,
  variant = "submitted",
  onAction,
}: {
  visitor: Visitor;
  variant?: Variant;
  onAction?: () => void;
}) {
  const action = actionFor(visitor);

  return (
    <div className="relative rounded-[10px] border border-border bg-white px-5 py-5">
      {variant === "cancelled" && (
        <span className="absolute right-4 top-4 rounded-[4px] bg-red px-2 py-1 text-[10px] font-semibold text-white">
          Cancelled
        </span>
      )}
      {/* Only genuinely unconfirmed walk-ins need the host notified/reminded. */}
      {visitor.status === "awaiting_approval" && (
        <span className="absolute right-4 top-4 rounded-[4px] bg-gold-header px-2 py-1 text-[10px] font-semibold text-white">
          Notify host
        </span>
      )}

      <div className="flex flex-col items-center gap-1 pb-4">
        <Image
          src={visitor.photoUrl || "/branding/avatar-placeholder.png"}
          alt=""
          width={62}
          height={62}
          className="h-[62px] w-[62px] rounded-full object-cover"
        />
        <p className="font-bold text-ink">{visitor.name}</p>
        <p className="text-xs text-muted">{VISITOR_TYPE_LABEL[visitor.visitorType]}</p>
      </div>

      <div>
        <Row label="Status" value={VISITOR_STATUS_LABEL[visitor.status]} />
        <Row label="Host name" value={visitor.host.name} />
        <Row label="Phone number" value={visitor.phone} />
        <Row label="Host rank" value={visitor.host.rank} />
        <Row label="Visitor's country" value={visitor.country} />
        <Row label="ID type" value={ID_TYPE_LABEL[visitor.idType]} />
        <Row label="Host department" value={visitor.host.department} />
        {visitor.hostServiceType && (
          <Row label="Host service type" value={SERVICE_TYPE_LABEL[visitor.hostServiceType as ServiceType]} />
        )}
        <Row label="Escort" value={visitor.escortCount} />
        <Row label="Escort names" value={visitor.escortNames.join(", ")} />
        <Row label="Expected date" value={visitor.expectedDate ? formatDate(visitor.expectedDate) : undefined} />
        <Row label="Expected time (FRO/TO)" value={timeRange(visitor.expectedTimeFrom, visitor.expectedTimeTo)} />
        <Row label="Sign in time" value={visitor.signInTime} />
        <Row label="Sign in agent" value={agentName(visitor.signInAgent)} />
        <Row label="Appointment end time" value={visitor.appointmentEndTime} />
        <Row label="Sign out time" value={visitor.signOutTime} />
        <Row label="Sign out agent" value={agentName(visitor.signOutAgent)} />
      </div>

      {action && (
        <Button
          fullWidth
          className="mt-4 h-12"
          variant={action.buttonVariant}
          disabled={action.disabled}
          onClick={onAction}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
