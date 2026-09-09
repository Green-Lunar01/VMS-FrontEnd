// Types mirror the DHQ-VMS backend DTOs described in FRONTEND_INTEGRATION_GUIDE.md
// so that swapping mock data for real API responses later is a drop-in change.

export type Role = "super_admin" | "institution_admin" | "security_officer" | "host";

export type VisitorType = "friend" | "family" | "official" | "relative";

export type IdType = "nin" | "international_passport" | "voters_card" | "drivers_license";

export type VisitorStatus =
  | "awaiting_approval"
  | "submitted"
  | "confirmed"
  | "signed_in"
  | "signed_out"
  | "cancelled";

export type ModeOfEntry = "direct" | "indirect";

export type ServiceType = "army" | "navy" | "air_force";

export type UserStatus = "active" | "inactive";

export type NotificationType =
  | "visitor_submitted"
  | "visitor_signed_in"
  | "visitor_signed_out"
  | "visitor_cancelled"
  | "visitor_blacklisted"
  | "contractor_checked_in"
  | "contractor_checked_out"
  | "contractor_revoked"
  | "dispatch_received";

export interface Institution {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  status: UserStatus;
  createdAt: string;
  totalOfficers?: number;
  totalAdmins?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  photoUrl?: string;
  institutionId?: string;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface Officer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  rank: string;
  serviceType: ServiceType;
  branch: string;
  serviceNumber: string;
  department: string;
  appointment: string;
  status: UserStatus;
  photoUrl?: string;
  user: User;
  createdAt: string;
  /** Computed by GET /officers/:id only — "No of visitors received". */
  visitorsReceivedCount?: number;
}

/** A signed-in/signed-out-by reference — the API populates these with just name + email. */
export interface AgentRef {
  _id: string;
  name: string;
  email: string;
}

export interface Visitor {
  _id: string;
  name: string;
  phone: string;
  country: string;
  idType: IdType;
  visitorType: VisitorType;
  escortCount: number;
  escortNames: string[];
  /** Walk-ins have none of these three — they arrived without a prior appointment. */
  expectedDate?: string;
  expectedTimeFrom?: string;
  expectedTimeTo?: string;
  phoneOrLaptop: boolean;
  status: VisitorStatus;
  guestTagNumber?: string;
  modeOfEntry?: ModeOfEntry;
  blacklisted?: boolean;
  blacklistReason?: string;
  signedInAt?: string;
  signedOutAt?: string;
  cancelledAt?: string;
  photoUrl?: string;
  /** Gate-desk display fields shown in the visitor detail drawer and log table. */
  signInTime?: string;
  signOutTime?: string;
  appointmentEndTime?: string;
  /**
   * Populated on `/visitors` and `/visitors/mine`, but not on `/visitors/today` —
   * check for an object before reading `.name`.
   */
  signInAgent?: AgentRef | string | null;
  signOutAgent?: AgentRef | string | null;
  hostServiceType?: string;
  host: Pick<Officer, "_id" | "name" | "rank" | "phone" | "department"> & { user?: string };
  createdAt: string;
}

export type ContractorStatus = "active" | "inactive";

export interface Contractor {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  idNumber: string;
  photoUrl?: string;
  validityFrom: string;
  validityTo: string;
  status: ContractorStatus;
  revokeReason?: string;
  checkedIn?: boolean;
  createdAt: string;
}

export interface ContractorVisit {
  _id: string;
  contractor: string;
  signInTime: string | null;
  signInAgent?: AgentRef | null;
  signOutTime: string | null;
  signOutAgent?: AgentRef | null;
}

export interface Dispatch {
  _id: string;
  companyName: string;
  docOfficeDestination: string;
  docTitle: string;
  phone: string;
  dispatcherName: string;
  hostName: string;
  hostId?: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type: NotificationType;
  /** Headline shown in bold in the feed, e.g. "Visitor submitted". */
  title?: string;
  /** Green sub-line naming the person involved, e.g. "Musa John". */
  subject?: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
}
