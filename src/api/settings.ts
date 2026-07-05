import { apiRequest } from "@/api/client";
import type {
  AccountSettings,
  DeleteAccountPayload,
  UpdateAccountSettingsPayload,
} from "@/api/types";

const SETTINGS_PATH = "/settings";
const DELETE_ACCOUNT_PATH = "/account/delete";
const DELETE_ACCOUNT_SEND_OTP_PATH = "/account/delete/send-otp";

export async function getAccountSettings(signal?: AbortSignal) {
  return apiRequest<AccountSettings>({
    path: SETTINGS_PATH,
    auth: true,
    signal,
  });
}

export async function updateAccountSettings(payload: UpdateAccountSettingsPayload) {
  return apiRequest<AccountSettings>({
    method: "PATCH",
    path: SETTINGS_PATH,
    auth: true,
    body: payload,
  });
}

export async function sendDeleteAccountOtp() {
  return apiRequest<{ message?: string }>({
    method: "POST",
    path: DELETE_ACCOUNT_SEND_OTP_PATH,
    auth: true,
  });
}

export async function deleteAccount(payload: DeleteAccountPayload) {
  return apiRequest<null>({
    method: "POST",
    path: DELETE_ACCOUNT_PATH,
    auth: true,
    body: payload,
  });
}
