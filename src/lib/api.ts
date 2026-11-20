import { API_BASE } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, TokenPair } from "@/types";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  formData?: FormData;
  /** Set false for public endpoints (login, register, …). Skips the Bearer header and refresh flow. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Extract a readable message from our envelope or FastAPI's default `{ detail }` errors. */
function parseErrorBody(body: unknown, status: number): ApiError {
  const fallback = `Request failed (${status})`;
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.message === "string" && b.message) {
      return new ApiError(b.message, status, typeof b.code === "string" ? b.code : undefined, b.details);
    }
    if (typeof b.detail === "string") return new ApiError(b.detail, status);
    if (Array.isArray(b.detail)) {
      const msg = b.detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : ""))
        .filter(Boolean)
        .join("; ");
      return new ApiError(msg || fallback, status, "validation_error", b.detail);
    }
  }
  return new ApiError(fallback, status);
}

let refreshInFlight: Promise<boolean> | null = null;

/** Single-flight token refresh. Returns true when new tokens are stored. */
export function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) return Promise.resolve(false);

  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) throw new Error("refresh failed");
      const json = (await res.json()) as ApiResponse<TokenPair | { tokens: TokenPair }>;
      const data = json.data as TokenPair | { tokens: TokenPair };
      const tokens = "tokens" in data ? data.tokens : data;
      if (!tokens?.access_token) throw new Error("invalid refresh response");
      setTokens({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? refreshToken,
      });
      return true;
    } catch {
      clear();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<ApiResponse<T>> {
  const { auth = true, query, body, formData, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: payload, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Cannot reach the Bada API. Check your connection or try again shortly.", 0, "network_error");
  }

  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(method, path, options, true);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }

  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) throw parseErrorBody(json, res.status);

  if (json && typeof json === "object" && "success" in (json as object)) {
    return json as ApiResponse<T>;
  }
  // Tolerate endpoints that return a bare payload.
  return { success: true, message: "OK", data: json as T, meta: null };
}

export const api = {
  get: <T>(path: string, query?: Query, opts?: Omit<RequestOptions, "query" | "body">) =>
    request<T>("GET", path, { ...opts, query }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("PUT", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("PATCH", path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
  upload: <T>(path: string, formData: FormData) => request<T>("POST", path, { formData }),
};
