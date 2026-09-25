import type { InstitutionType } from "@/lib/types";

type FieldState = "hidden" | "required" | "optional";

export interface OfficerFieldConfig {
  /** e.g. "Personnel", "Staff", "Residents" — the plural/section-heading form. */
  personPlural: string;
  /** Singular form, e.g. "Add new {Resident}" — same word for mass nouns like Personnel/Staff. */
  personSingular: string;
  rank: FieldState;
  serviceType: FieldState;
  /** The `branch` field, always labeled "Directorate" when shown. */
  directorate: FieldState;
  serviceNumber: FieldState;
  /** "Service Number" everywhere except Civilian Office, which calls it "Staff Number". */
  serviceNumberLabel: string;
  department: FieldState;
  appointment: FieldState;
  houseAddress: FieldState;
}

/**
 * The frontend owns all enforcement here — the backend accepts every field on
 * every institution type regardless (see FRONTEND_INTEGRATION_GUIDE.md §5).
 * This is the single source of truth for which fields to render, mark
 * required, and include in the create/edit payload, keyed by InstitutionType.
 */
export const OFFICER_FIELD_CONFIG: Record<InstitutionType, OfficerFieldConfig> = {
  military_office: {
    personPlural: "Personnel",
    personSingular: "Personnel",
    rank: "required",
    serviceType: "required",
    directorate: "required",
    serviceNumber: "required",
    serviceNumberLabel: "Service Number",
    department: "required",
    appointment: "required",
    houseAddress: "hidden",
  },
  military_estate: {
    personPlural: "Personnel",
    personSingular: "Personnel",
    rank: "required",
    serviceType: "required",
    directorate: "hidden",
    serviceNumber: "required",
    serviceNumberLabel: "Service Number",
    department: "hidden",
    appointment: "hidden",
    houseAddress: "required",
  },
  civilian_office: {
    personPlural: "Staff",
    personSingular: "Staff",
    rank: "hidden",
    serviceType: "hidden",
    directorate: "hidden",
    serviceNumber: "optional",
    serviceNumberLabel: "Staff Number",
    department: "required",
    appointment: "required",
    houseAddress: "hidden",
  },
  civilian_estate: {
    personPlural: "Residents",
    personSingular: "Resident",
    rank: "hidden",
    serviceType: "hidden",
    directorate: "hidden",
    serviceNumber: "hidden",
    serviceNumberLabel: "Staff Number",
    department: "hidden",
    appointment: "hidden",
    houseAddress: "required",
  },
};

/**
 * Institutions created before `type` existed have none yet (see Institution.type's
 * doc comment). Falls back to the fullest field set — military_office — so nothing
 * that used to be collected from them silently disappears.
 */
export const DEFAULT_OFFICER_FIELD_CONFIG = OFFICER_FIELD_CONFIG.military_office;

export function getOfficerFieldConfig(type: InstitutionType | undefined): OfficerFieldConfig {
  return type ? OFFICER_FIELD_CONFIG[type] : DEFAULT_OFFICER_FIELD_CONFIG;
}
