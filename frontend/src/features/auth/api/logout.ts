import { apiFetch } from "#/lib/api";
import { clearAuth } from "#/lib/auth";

export async function logout(): Promise<void> {
  // Best-effort: tell the server to invalidate the refresh token cookie.
  // We clear local auth state regardless of whether this succeeds.
  try {
    await apiFetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
      method: "POST",
    });
  } catch {
    // ignore
  }
  clearAuth();
}
