// Auth helpers — thin wrappers around localStorage + api.ts
import { apiRegister, apiLogin, apiVerifyOtp, type AuthUser, type RegisterPayload } from "./api";

export type { AuthUser };

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// localStorage is browser-only — SSR (TanStack Start server pass) has no window
const isBrowser = typeof window !== "undefined";

export async function registerUser(payload: RegisterPayload) {
  return apiRegister(payload);
}

export async function loginWithCredentials(email: string, password: string) {
  return apiLogin({ email, password });
}

export async function verifyMfa(email: string, otp: string): Promise<AuthUser> {
  const user = await apiVerifyOtp({ email, otp });
  if (isBrowser) {
    localStorage.setItem(AUTH_TOKEN_KEY, user.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
  return user;
}

export function getStoredAuth(): { token: string; user: AuthUser } | null {
  if (!isBrowser) return null;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (token && userStr) {
    try {
      return { token, user: JSON.parse(userStr) as AuthUser };
    } catch {
      return null;
    }
  }
  return null;
}

export function logout() {
  if (!isBrowser) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}
