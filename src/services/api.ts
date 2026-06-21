import type { API } from "@/types";

const TOKEN_KEY = "tinder_token";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1912";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 静默忽略写入失败
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 静默忽略清除失败
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (!options?.skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `请求失败 (${res.status})`;
    try {
      const err = (await res.json()) as API.ApiError;
      if (err.detail) detail = err.detail;
    } catch {}
    if (res.status === 401) {
      clearToken();
      throw new AuthError(detail);
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// 适用于 201 Created 等无 body 或不需要 body 的 POST
export async function apiFetchWithBody<T>(
  path: string,
  body: unknown,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}
