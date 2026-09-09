import { getStoredTokens, setStoredTokens, clearStoredSession } from "@/lib/auth/storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://vms-r80z.onrender.com/api/v1";

/** The backend's uniform error envelope (see §6 of the integration guide). */
export interface ApiErrorBody {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly messages: string[];
  readonly body?: ApiErrorBody;

  constructor(statusCode: number, messages: string[], body?: ApiErrorBody) {
    super(messages[0] ?? `Request failed with status ${statusCode}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.messages = messages;
    this.body = body;
  }
}

function toMessages(raw: unknown): string[] {
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.map(String);
  return ["Something went wrong. Please try again."];
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body — serialised automatically. Use `formData` for multipart uploads. */
  json?: unknown;
  formData?: FormData;
  /** Query string values; undefined/empty entries are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip the Authorization header (login, refresh, forgot/reset password). */
  anonymous?: boolean;
  /** Internal: prevents infinite refresh recursion. */
  _isRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Refresh tokens rotate, so concurrent 401s must not each fire their own refresh —
 * the first one starts it and everyone else awaits the same promise.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken || !data.refreshToken) return false;
    setStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

function ensureRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/** Called when refreshing fails — the session is unrecoverable. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, formData, query, anonymous, _isRetry, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (!anonymous) {
    const { accessToken } = getStoredTokens();
    if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
    });
  } catch {
    throw new ApiError(0, ["Can't reach the server. Check your connection and try again."]);
  }

  // Expired access token: refresh once, then replay the original request.
  if (response.status === 401 && !anonymous && !_isRetry) {
    const refreshed = await ensureRefresh();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }
    clearStoredSession();
    onSessionExpired?.();
    throw new ApiError(401, ["Your session has expired. Please log in again."]);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const body = (typeof parsed === "object" && parsed !== null ? parsed : undefined) as
      | ApiErrorBody
      | undefined;
    throw new ApiError(response.status, toMessages(body?.message ?? parsed), body);
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", json }),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", json }),
  del: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "DELETE" }),
  upload: <T>(path: string, formData: FormData, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", formData }),
};
