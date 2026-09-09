import type { IdType, VisitorType, ServiceType, ModeOfEntry } from "@/lib/types";

export const ID_TYPE_LABEL: Record<IdType, string> = {
  nin: "NIN",
  international_passport: "Int'l Passport",
  voters_card: "Voter's Card",
  drivers_license: "Driver's License",
};

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
