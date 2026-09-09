import type { IdType, VisitorType, ServiceType, ModeOfEntry } from "@/lib/types";

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
};

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  army: "Army",
  navy: "Navy",
  air_force: "Air Force",
};

export const MODE_OF_ENTRY_LABEL: Record<ModeOfEntry, string> = {
  direct: "Direct",
  indirect: "Indirect",
};
