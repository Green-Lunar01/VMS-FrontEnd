import { api } from "@/lib/api/client";
import type {
  AppNotification,
  Contractor,
  ContractorVisit,
  Dispatch,
  Institution,
  ModeOfEntry,
  Officer,
  Role,
  User,
  Visitor,
  VisitorStatus,
  VisitorType,
} from "@/lib/types";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/* ------------------------------------------------------------------ auth */

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }, { anonymous: true }),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }, { anonymous: true }),
  /** Role-agnostic — the same route serves all four dashboards. */
  logout: () => api.post<void>("/auth/logout"),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>("/auth/change-password", { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post<void>("/auth/forgot-password", { email }, { anonymous: true }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<void>("/auth/reset-password", { token, newPassword }, { anonymous: true }),
};

/* ----------------------------------------------------------------- users */

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "institution_admin" | "security_officer">;
}

export const usersApi = {
  me: () => api.get<User>("/users/me"),
  updateMe: (payload: { name?: string; phone?: string }) => api.patch<User>("/users/me", payload),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("photo", file);
    return api.upload<User>("/users/me/photo", fd);
  },
  list: (role?: Role) => api.get<User[]>("/users", { query: { role } }),
  createAdmin: (payload: CreateAdminPayload) => api.post<User>("/users/admins", payload),
  createPlatformAdmin: (payload: { name: string; email: string; password: string }) =>
    api.post<User>("/users/platform-admins", payload),
  update: (id: string, payload: Partial<Pick<User, "name" | "status" | "role">>) =>
    api.patch<User>(`/users/${id}`, payload),
  remove: (id: string) => api.del<void>(`/users/${id}`),
};

/* ---------------------------------------------------------- institutions */

export interface InstitutionStats {
  totalInstitutions: number;
  newInstitutionsThisMonth: number;
  growthPercentThisMonth: number;
  activeInstitutionsPercent: number;
  deactivatedInstitutions: number;
}

export const institutionsApi = {
  create: (payload: { name: string; email: string; phone: string; address: string; password: string }) =>
    api.post<Institution>("/institutions", payload),
  list: () => api.get<Institution[]>("/institutions"),
  stats: () => api.get<InstitutionStats>("/institutions/stats"),
  get: (id: string) => api.get<Institution>(`/institutions/${id}`),
  me: () => api.get<Institution>("/institutions/me"),
  /**
   * Read-only name+logo for roles that aren't Institution Admin — Security
   * Officers and Hosts need this for their own sidebar crest but can't call
   * the admin-only /institutions/me.
   */
  myBrand: () => api.get<{ name: string; logoUrl?: string }>("/institutions/me/brand"),
  uploadMyLogo: (file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    return api.upload<Institution>("/institutions/me/logo", fd);
  },
  uploadLogo: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    return api.upload<Institution>(`/institutions/${id}/logo`, fd);
  },
  activate: (id: string) => api.patch<Institution>(`/institutions/${id}/activate`),
  deactivate: (id: string) => api.patch<Institution>(`/institutions/${id}/deactivate`),
  impersonate: (id: string) => api.post<AuthResponse>(`/institutions/${id}/impersonate`),
};

/* -------------------------------------------------------------- officers */

export interface CreateOfficerPayload {
  name: string;
  email: string;
  phone: string;
  rank: string;
  serviceType: string;
  branch: string;
  serviceNumber: string;
  department: string;
  appointment: string;
}

/**
 * The API nests the officer's login identity under `user` (an OfficerProfile
 * references a User, not the other way round) — name/email/photoUrl live on
 * `user`, not on the profile itself. Flattening them here means every screen
 * can keep reading `officer.name` directly instead of `officer.user.name`.
 */
function normalizeOfficer(raw: Officer): Officer {
  return {
    ...raw,
    name: raw.user?.name ?? raw.name,
    email: raw.user?.email ?? raw.email,
    photoUrl: raw.user?.photoUrl ?? raw.photoUrl,
  };
}

export const officersApi = {
  list: (params?: { q?: string; serviceType?: string }) =>
    api.get<Officer[]>("/officers", { query: params }).then((rows) => rows.map(normalizeOfficer)),
  /** Single-record view — includes the computed `visitorsReceivedCount`. */
  get: (id: string) => api.get<Officer>(`/officers/${id}`).then(normalizeOfficer),
  create: (payload: CreateOfficerPayload) =>
    api.post<Officer>("/officers", payload).then(normalizeOfficer),
  resendCredentials: (id: string) => api.post<void>(`/officers/${id}/resend-credentials`),
  remove: (id: string) => api.del<void>(`/officers/${id}`),
};

/* -------------------------------------------------------------- visitors */

export interface VisitorFilters {
  status?: VisitorStatus;
  visitorType?: VisitorType;
  q?: string;
  from?: string;
  to?: string;
  hostId?: string;
  [key: string]: string | undefined;
}

export interface SubmitVisitorPayload {
  name: string;
  phone: string;
  country: string;
  idType: string;
  visitorType: string;
  /** Only meaningful when visitorType is "other" — see Visitor.visitorTypeOther. */
  visitorTypeOther?: string;
  escortCount: number;
  escortNames: string[];
  expectedDate: string;
  expectedTimeFrom: string;
  expectedTimeTo: string;
  phoneOrLaptop: boolean;
}

export type WalkInVisitorPayload = Omit<
  SubmitVisitorPayload,
  "expectedDate" | "expectedTimeFrom" | "expectedTimeTo"
> & {
  hostId: string;
  expectedDate?: string;
  expectedTimeFrom?: string;
  expectedTimeTo?: string;
  /** Walk-in only — the host's own submission form doesn't accept this yet. */
  plateNumber?: string;
};

/**
 * Visitor.host comes back in two different shapes depending on the endpoint:
 * populated with just {_id, name, email} on /visitors, /visitors/mine and
 * /visitors/today, or as a bare id string everywhere else (confirm, approve,
 * sign-out, cancel, end-appointment, blacklist — none of those populate it at
 * all). Neither shape carries rank/department, which live on the host's
 * separate Officer profile. Rebuilt here from a byId lookup against the
 * officers list so every screen reading host.name/rank/department gets real
 * values no matter which endpoint the visitor came from.
 */
async function hostOfficerMap(): Promise<Map<string, Officer>> {
  const officers = await officersApi.list().catch(() => []);
  return new Map(officers.map((o) => [o.user?._id ?? o._id, o]));
}

function applyHostDetails(visitor: Visitor, byUserId: Map<string, Officer>): Visitor {
  const rawHost = visitor.host as unknown as string | Visitor["host"] | null | undefined;
  const hostId = typeof rawHost === "string" ? rawHost : rawHost?._id;
  const officer = hostId ? byUserId.get(hostId) : undefined;
  if (!hostId || !officer) return visitor;
  const existing = rawHost && typeof rawHost === "object" ? rawHost : undefined;
  return {
    ...visitor,
    host: {
      _id: hostId,
      name: officer.name,
      rank: officer.rank,
      department: officer.department,
      phone: existing?.phone ?? "",
      user: hostId,
    },
  };
}

async function enrichVisitor(visitor: Visitor): Promise<Visitor> {
  return applyHostDetails(visitor, await hostOfficerMap());
}

async function enrichVisitors(visitors: Visitor[]): Promise<Visitor[]> {
  const byUserId = await hostOfficerMap();
  return visitors.map((v) => applyHostDetails(v, byUserId));
}

export const visitorsApi = {
  /** Host pre-submission. */
  submit: (payload: SubmitVisitorPayload) => api.post<Visitor>("/visitors", payload).then(enrichVisitor),
  /** Security Officer onboarding someone who arrived without a prior submission. */
  walkIn: (payload: WalkInVisitorPayload) => api.post<Visitor>("/visitors/walk-in", payload).then(enrichVisitor),
  /** Host confirming a walk-in raised on their behalf (awaiting_approval -> confirmed). */
  confirm: (id: string) => api.patch<Visitor>(`/visitors/${id}/confirm`).then(enrichVisitor),
  approve: (id: string, guestTagNumber: string, modeOfEntry: ModeOfEntry) =>
    api.patch<Visitor>(`/visitors/${id}/approve`, { guestTagNumber, modeOfEntry }).then(enrichVisitor),
  signOut: (id: string) => api.patch<Visitor>(`/visitors/${id}/sign-out`).then(enrichVisitor),
  /** Host ending their own signed-in visitor's appointment. */
  endAppointment: (id: string) => api.patch<Visitor>(`/visitors/${id}/end-appointment`).then(enrichVisitor),
  cancel: (id: string) => api.patch<Visitor>(`/visitors/${id}/cancel`).then(enrichVisitor),
  blacklist: (id: string, reason: string) =>
    api.patch<Visitor>(`/visitors/${id}/blacklist`, { reason }).then(enrichVisitor),
  unblacklist: (id: string) => api.patch<Visitor>(`/visitors/${id}/unblacklist`).then(enrichVisitor),
  list: (filters?: VisitorFilters) => api.get<Visitor[]>("/visitors", { query: filters }).then(enrichVisitors),
  mine: (filters?: Omit<VisitorFilters, "hostId">) =>
    api.get<Visitor[]>("/visitors/mine", { query: filters }).then(enrichVisitors),
  today: () => api.get<Visitor[]>("/visitors/today").then(enrichVisitors),
  get: (id: string) => api.get<Visitor>(`/visitors/${id}`).then(enrichVisitor),
};

/* ----------------------------------------------------------- contractors */

export interface CreateContractorPayload {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  validityFrom: string;
  validityTo: string;
}

export const contractorsApi = {
  list: (params?: { q?: string; status?: string }) => api.get<Contractor[]>("/contractors", { query: params }),
  get: (id: string) => api.get<Contractor>(`/contractors/${id}`),
  visits: (id: string) => api.get<ContractorVisit[]>(`/contractors/${id}/visits`),
  create: (payload: CreateContractorPayload) => api.post<Contractor>("/contractors", payload),
  update: (id: string, payload: Partial<CreateContractorPayload>) =>
    api.patch<Contractor>(`/contractors/${id}`, payload),
  revoke: (id: string, reason: string) => api.patch<Contractor>(`/contractors/${id}/revoke`, { reason }),
  /** Both return the ContractorVisit record they created/closed, not the contractor itself. */
  checkIn: (id: string) => api.patch<ContractorVisit>(`/contractors/${id}/check-in`),
  checkOut: (id: string) => api.patch<ContractorVisit>(`/contractors/${id}/check-out`),
};

/* -------------------------------------------------------------- dispatch */

export interface CreateDispatchPayload {
  companyName: string;
  docOfficeDestination: string;
  docTitle: string;
  phone: string;
  dispatcherName: string;
  hostName: string;
  hostId?: string;
}

export const dispatchApi = {
  list: (params?: { q?: string }) => api.get<Dispatch[]>("/dispatch", { query: params }),
  get: (id: string) => api.get<Dispatch>(`/dispatch/${id}`),
  create: (payload: CreateDispatchPayload) => api.post<Dispatch>("/dispatch", payload),
};

/* ------------------------------------------------------------- analytics */

export interface AnalyticsOverview {
  totalVisitors: number;
  totalOfficers: number;
  totalContractors: number;
  signedInToday?: number;
  signedOutToday?: number;
  cancelledToday?: number;
  submittedToday?: number;
}

export interface VisitationMonth {
  month: string;
  signedIn: number;
  signedOut: number;
}

export interface AdminPerformance {
  _id?: string;
  name: string;
  role?: string;
  photoUrl?: string;
  signedIn: number;
  signedOut: number;
}

export interface OfficerPerformance {
  _id?: string;
  rank: string;
  name?: string;
  department?: string;
  visitors: number;
}

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>("/analytics/overview"),
  visitationOverview: (year?: number) =>
    api.get<VisitationMonth[]>("/analytics/visitation-overview", { query: { year } }),
  adminsPerformance: () => api.get<AdminPerformance[]>("/analytics/admins-performance"),
  officersPerformance: () => api.get<OfficerPerformance[]>("/analytics/officers-performance"),
};

/* ---------------------------------------------------------- notifications */

export const notificationsApi = {
  /** The API's field is `isRead`, not `read` — normalized here so the rest of the app reads `.read`. */
  list: (unread?: boolean) =>
    api
      .get<(AppNotification & { isRead?: boolean })[]>("/notifications", { query: { unread } })
      .then((rows) => rows.map(({ isRead, ...n }) => ({ ...n, read: isRead ?? n.read }))),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<void>("/notifications/read-all"),
};
