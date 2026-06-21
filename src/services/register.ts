import type { API } from "@/types";
import { apiFetchWithBody } from "./api";

/**
 * 请求注册问卷（第一步）。
 * 获取 sheet_id 和需要回答的安全问题列表。
 */
export async function requestSheet(): Promise<API.SheetResponse> {
  return apiFetchWithBody<API.SheetResponse>(
    "/api/v1/users/register/sheet/request",
    {},
    { skipAuth: true },
  );
}

/**
 * 提交注册信息（第二步）。
 * 包括昵称、姓名、班级信息、安全问答等。
 */
export async function submitRegistration(data: API.RegisterRequest): Promise<API.RegisterResponse> {
  return apiFetchWithBody<API.RegisterResponse>("/api/v1/users/register", data, { skipAuth: true });
}

/**
 * 完成注册（第三步）。
 * 设置用户名和密码，并使用 tempToken 完成最终注册。
 */
export async function completeRegistration(
  data: API.RegisterCompleteRequest,
  tempToken: string,
): Promise<API.RegisterCompleteResponse> {
  return apiFetchWithBody<API.RegisterCompleteResponse>("/api/v1/users/register/complete", data, {
    headers: { Authorization: `Bearer ${tempToken}` },
  });
}
