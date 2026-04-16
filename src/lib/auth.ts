// Mock auth service — replace these functions with your actual API calls
// to your JWT + MFA backend

interface LoginResponse {
  requiresMfa: boolean;
  tempToken?: string;
  token?: string;
  user?: User;
}

interface MfaResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// Replace with your actual API base URL
const API_BASE = "/api";

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResponse> {
  // MOCK: In production, call your backend:
  // const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
  // return res.json();

  // Simulate: always require MFA
  await new Promise((r) => setTimeout(r, 800));
  if (email && password) {
    return { requiresMfa: true, tempToken: "temp_" + Date.now() };
  }
  throw new Error("Invalid credentials");
}

export async function verifyMfa(
  tempToken: string,
  otp: string
): Promise<MfaResponse> {
  // MOCK: In production, call your backend:
  // const res = await fetch(`${API_BASE}/auth/verify-mfa`, { method: 'POST', body: JSON.stringify({ tempToken, otp }) });
  // return res.json();

  await new Promise((r) => setTimeout(r, 600));
  if (otp.length === 6) {
    const user = { id: "1", name: "Operator", email: "operator@axiom.dev" };
    const token = "jwt_" + Date.now();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return { token, user };
  }
  throw new Error("Invalid OTP");
}

export function getStoredAuth(): { token: string; user: User } | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (token && userStr) {
    return { token, user: JSON.parse(userStr) };
  }
  return null;
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  if (auth) {
    return { Authorization: `Bearer ${auth.token}` };
  }
  return {};
}
