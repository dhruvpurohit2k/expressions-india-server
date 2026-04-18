import { z } from "zod";
import { storeUser, clearAuth } from "./auth";

/** Error thrown by API helpers — carries the HTTP status code. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Retry policy for detail queries: never retry a 404, retry others up to 3×. */
export const retryUnless404 = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status === 404) && count < 3;

// ------------------------------------------------------------------
// Token refresh (singleton — multiple concurrent 401s share one refresh)
// ------------------------------------------------------------------

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  const doRefresh = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.userId) return false;
      storeUser({
        userId: json.data.userId,
        email: json.data.email,
        isAdmin: json.data.isAdmin,
      });
      return true;
    } catch {
      return false;
    }
  };

  _refreshPromise = doRefresh().finally(() => {
    _refreshPromise = null;
  });
  return _refreshPromise;
}

// ------------------------------------------------------------------
// Authenticated fetch — sends cookies, retries once on 401/403
// ------------------------------------------------------------------

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: "include" });

  if (res.status === 401 || res.status === 403) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearAuth();
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      // Return the original response so callers don't throw before the redirect
      return res;
    }
    return fetch(input, { ...init, credentials: "include" });
  }

  return res;
}

// ------------------------------------------------------------------
// Silent refresh — used by the admin route beforeLoad guard
// ------------------------------------------------------------------

export async function silentRefresh(): Promise<boolean> {
  return tryRefresh();
}

// ------------------------------------------------------------------
// Response parsers (unchanged — receive a Response from apiFetch)
// ------------------------------------------------------------------

/**
 * Parses a standard API response envelope and returns the data.
 * Throws ApiError (with HTTP status) if success is false.
 * Returns null if data is null.
 */
export async function parseApiResponse<T>(
  response: Response,
  dataSchema: z.ZodType<T>,
): Promise<T | null> {
  const json = await response.json();
  if (!json.success) {
    throw new ApiError(
      json.error?.message ?? "Request failed",
      response.status,
    );
  }

  if (json.data === null || json.data === undefined) return null;

  const parsed = dataSchema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; perPage: number; totalPages: number };
};

/**
 * Parses a paginated API response envelope (data array + meta).
 */
export async function parsePaginatedResponse<T>(
  response: Response,
  itemSchema: z.ZodType<T>,
): Promise<PaginatedResponse<T>> {
  const json = await response.json();
  if (!json.success) {
    throw new ApiError(
      json.error?.message ?? "Request failed",
      response.status,
    );
  }
  if (json.data === null || json.data === undefined) {
    return { data: [], meta: { total: 0, perPage: 15, totalPages: 0 } };
  }
  const parsed = z.array(itemSchema).safeParse(json.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return {
    data: parsed.data,
    meta: {
      total: json.meta?.total ?? 0,
      perPage: json.meta?.perPage ?? 15,
      totalPages: json.meta?.totalPages ?? 0,
    },
  };
}

/**
 * Parses a mutation response (POST/PUT/DELETE).
 * Throws with the server's error message if success is false.
 */
export async function parseMutationResponse(response: Response): Promise<void> {
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
}
