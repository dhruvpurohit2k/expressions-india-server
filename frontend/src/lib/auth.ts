export type StoredUser = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

const USER_KEY = "ei_user";

export function storeUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}

export function clearAuth(): void {
  localStorage.removeItem(USER_KEY);
}
