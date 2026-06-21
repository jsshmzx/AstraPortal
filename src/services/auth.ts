import type { API } from "@/types";
import { apiFetch, apiFetchWithBody, clearToken, setToken, sha256Hex } from "./api";

/**
 * 登录 — 对密码做两次 SHA256 后再 POST。
 * 成功后自动保存 access_token 到 localStorage。
 */
export async function login(username: string, password: string): Promise<API.LoginResponse> {
  const hashed = await sha256Hex(await sha256Hex(password));
  const data = await apiFetchWithBody<API.LoginResponse>(
    "/api/v1/auth/login",
    { username, password: hashed },
    { skipAuth: true },
  );
  setToken(data.access_token);
  return data;
}

/**
 * 获取当前登录用户信息。
 */
export async function getMe(): Promise<API.CurrentUser> {
  return apiFetch<API.CurrentUser>("/api/v1/users/me");
}

/**
 * 登出 — 向服务端发送 refresh_token，无论成功与否都清除本地 token。
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiFetchWithBody<API.LogoutResponse>("/api/v1/auth/logout", {
      refresh_token: refreshToken,
    });
  } catch {
    // 即使请求失败也清除本地 token
  } finally {
    clearToken();
  }
}
