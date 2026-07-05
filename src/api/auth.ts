import { apiRequest } from "@/api/client";
import { getApiConfig } from "@/api/config";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  VerificationOtpPayload,
} from "@/api/types";

function normalizeAuthUser(user: Partial<AuthUser> & { email: string; id: string }): AuthUser {
  const derivedFullName =
    user.full_name ||
    user.display_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.email;

  return {
    ...user,
    full_name: derivedFullName,
  };
}

export type RegisterResponse = {
  message: string;
};

export async function register(payload: RegisterPayload) {
  const { authPaths } = getApiConfig();

  const response = await apiRequest<RegisterResponse>({
    method: "POST",
    path: authPaths.register,
    body: payload,
  });

  return {
    message:
      response.message ||
      "If this email can be used, check your inbox to continue.",
  };
}

export async function login(payload: LoginPayload) {
  const { authPaths } = getApiConfig();

  const response = await apiRequest<LoginResponse>({
    method: "POST",
    path: authPaths.login,
    body: payload,
  });

  return {
    ...response,
    user: normalizeAuthUser(response.user),
  };
}

export async function resendVerificationOtp(email: string) {
  const { authPaths } = getApiConfig();

  return apiRequest<{ message?: string }>({
    method: "POST",
    path: authPaths.sendOtp,
    body: { email },
  });
}

export async function verifyOtp(payload: VerificationOtpPayload) {
  const { authPaths } = getApiConfig();

  return apiRequest<{ message?: string }>({
    method: "POST",
    path: authPaths.verifyOtp,
    body: payload,
  });
}

export async function getCurrentUser() {
  const { authPaths } = getApiConfig();

  const response = await apiRequest<AuthUser>({
    path: authPaths.me,
    auth: true,
  });

  return normalizeAuthUser(response);
}

export async function logoutRequest() {
  const { authPaths } = getApiConfig();

  return apiRequest<{ message?: string }>({
    method: "POST",
    path: authPaths.logout,
    auth: true,
  });
}

export async function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<{ current_login?: { ip?: string; user_agent?: string } }>({
    method: "POST",
    path: "/auth/change-password",
    auth: true,
    body: payload,
  });
}

export async function forgotPassword(email: string) {
  const { authPaths } = getApiConfig();

  return apiRequest<{ message?: string }>({
    method: "POST",
    path: authPaths.forgotPassword,
    body: { email },
  });
}

export async function verifyResetOtp(email: string, otp_code: string) {
  return apiRequest<{ reset_token: string }>({
    method: "POST",
    path: "/auth/verify-reset-otp",
    body: { email, otp_code },
  });
}

export async function resetPassword(new_password: string, token: string) {
  return apiRequest<{ message?: string }>({
    method: "POST",
    path: "/auth/reset-password",
    body: { new_password, confirm_password: new_password },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
