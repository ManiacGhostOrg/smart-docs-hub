// Central API client — all requests route through here.
// To switch environments, only change VITE_API_BASE_URL in your .env file.

export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const isBrowser = typeof window !== "undefined";

function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem("auth_token");
}

// Required for ngrok free tier — skips the browser interstitial warning page
const NGROK_HEADER: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, ...NGROK_HEADER }
    : { ...NGROK_HEADER };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export async function apiRegister(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...NGROK_HEADER },
    body: JSON.stringify(payload),
  });
  return handleResponse<RegisterResponse>(res);
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...NGROK_HEADER },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthUser {
  token: string;
  userId: string;
  name: string;
  email: string;
}

export async function apiVerifyOtp(payload: VerifyOtpPayload): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...NGROK_HEADER },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthUser>(res);
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface Asset {
  id: string | number;
  originalFilename: string;
  assetType: string; // "PDF" | "AUDIO" | "VIDEO" | ...
  fileSize?: number;
  uploadedAt?: string;
  status?: string;
}

export async function apiListAssets(): Promise<Asset[]> {
  const res = await fetch(`${API_BASE}/api/assets`, {
    headers: authHeaders(),
  });
  return handleResponse<Asset[]>(res);
}

export interface AssetSummaryResponse {
  assetId: string | number;
  summary: string;
}

export async function apiGetSummary(assetId: string | number): Promise<AssetSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/assets/${assetId}/summary`, {
    headers: authHeaders(),
  });
  return handleResponse<AssetSummaryResponse>(res);
}

export async function apiUploadAsset(file: File, onProgress?: (pct: number) => void): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/assets/upload`);
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Asset);
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          msg = body.message || msg;
        } catch { /* ignore */ }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export interface AskResponse {
  assetId: string | number;
  question: string;
  answer: string;
  timestamps: ApiTimestamp[];
}

export interface ApiTimestamp {
  time?: string;
  seconds: number;
  label?: string;
  description?: string;
}

export async function apiAskQuestion(assetId: string | number, question: string): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/api/assets/${assetId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ question }),
  });
  return handleResponse<AskResponse>(res);
}

export interface PlayLinkResponse {
  assetId: string | number;
  playableUrl: string;
  startSeconds?: number;
}

export async function apiGetPlayLink(assetId: string | number, startSeconds: number): Promise<PlayLinkResponse> {
  const res = await fetch(
    `${API_BASE}/api/assets/${assetId}/play-link?startSeconds=${startSeconds}`,
    { headers: authHeaders() }
  );
  return handleResponse<PlayLinkResponse>(res);
}
