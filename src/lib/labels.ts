import type { IdType, VisitorType, VisitorStatus, ServiceType, ModeOfEntry, InstitutionType } from "@/lib/types";

export const ID_TYPE_LABEL: Record<IdType, string> = {
  nin: "NIN",
  international_passport: "Int'l Passport",
  voters_card: "Voter's Card",
  drivers_license: "Driver's License",
};

/** Single source of truth for the ID type dropdowns — keeps every form in sync with IdType. */
export const ID_TYPE_OPTIONS: { label: string; value: IdType }[] = [
  { label: "NIN", value: "nin" },
  { label: "International Passport", value: "international_passport" },
  { label: "Voter's Card", value: "voters_card" },
  { label: "Driver's License", value: "drivers_license" },
];

export const VISITOR_TYPE_LABEL: Record<VisitorType, string> = {
  friend: "Friend",
  family: "Family",
  official: "Official",
  relative: "Relative",
  other: "Other",
};

/**
 * "Other" needs a matching backend change before it can actually be
 * submitted (see Visitor.visitorType's doc comment in lib/types.ts) — kept
 * here anyway so the form is ready to go the moment that ships.
 */
export const VISITOR_TYPE_FORM_OPTIONS: { label: string; value: VisitorType }[] = [
  { label: "Family", value: "family" },
  { label: "Friend", value: "friend" },
  { label: "Official", value: "official" },
  { label: "Relative", value: "relative" },
  { label: "Other", value: "other" },
];

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  army: "Army",
  navy: "Navy",
  air_force: "Air Force",
};

export const MODE_OF_ENTRY_LABEL: Record<ModeOfEntry, string> = {
  direct: "Direct",
  indirect: "Indirect",
};

export const VISITOR_STATUS_LABEL: Record<VisitorStatus, string> = {
  awaiting_approval: "Awaiting host confirmation",
  submitted: "Submitted",
  confirmed: "Confirmed",
  signed_in: "Signed in",
  signed_out: "Signed out",
  cancelled: "Cancelled",
};

export const INSTITUTION_TYPE_LABEL: Record<InstitutionType, string> = {
  military_office: "Military Office",
  military_estate: "Military Estate",
  civilian_office: "Civilian Office",
  civilian_estate: "Civilian Estate",
};

export const INSTITUTION_TYPE_OPTIONS: { label: string; value: InstitutionType }[] = [
  { label: "Military Office", value: "military_office" },
  { label: "Military Estate", value: "military_estate" },
  { label: "Civilian Office", value: "civilian_office" },
  { label: "Civilian Estate", value: "civilian_estate" },
];
