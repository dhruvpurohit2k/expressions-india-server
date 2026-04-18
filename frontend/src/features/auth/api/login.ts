import { storeUser } from "#/lib/auth";

export type LoginRequest = { email: string; password: string };

export async function login({ email, password }: LoginRequest): Promise<void> {
  const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? "Login failed");
  }
  storeUser({
    userId: json.data.userId,
    email: json.data.email,
    isAdmin: json.data.isAdmin,
  });
}
