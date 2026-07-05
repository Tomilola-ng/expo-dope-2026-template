import { changePassword } from "@/api/auth";
import { ApiError } from "@/api/errors";
import {
  deleteAccount,
  getAccountSettings,
  sendDeleteAccountOtp,
  updateAccountSettings,
} from "@/api/settings";
import { queryKeys } from "@/api/queryKeys";
import type {
  ChangePasswordPayload,
  DeleteAccountPayload,
  UpdateAccountSettingsPayload,
} from "@/api/types";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import { unregisterPushDeviceToken } from "@/services/push-token-lifecycle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAccountSettings() {
  return useQuery({
    queryKey: queryKeys.settings.account,
    queryFn: ({ signal }) => getAccountSettings(signal),
  });
}

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();
  const { showAlert } = useAppAlert();

  return useMutation({
    mutationFn: (payload: UpdateAccountSettingsPayload) =>
      updateAccountSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.account, settings);
    },
    onError: (error) => {
      showAlert({
        title: "Settings not saved",
        message:
          error instanceof Error
            ? error.message
            : "We could not update your settings.",
      });
    },
  });
}

export function useSendDeleteAccountOtp() {
  return useMutation({
    mutationFn: () => sendDeleteAccountOtp(),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { showAlert } = useAppAlert();

  return useMutation({
    mutationFn: async (payload: DeleteAccountPayload) => {
      await unregisterPushDeviceToken();

      return deleteAccount(payload);
    },
    onSuccess: async () => {
      await signOut();
      queryClient.clear();
    },
    onError: async (error) => {
      if (
        error instanceof ApiError &&
        (error.status === 409 || /already deleted|deactivated/i.test(error.message))
      ) {
        await signOut();
        queryClient.clear();
        return;
      }

      showAlert({
        title: "Account not deleted",
        message:
          error instanceof Error
            ? error.message
            : "We could not delete your account.",
      });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { showAlert } = useAppAlert();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: async () => {
      await signOut("Sign in again with your new password.");
      queryClient.clear();
    },
    onError: (error) => {
      showAlert({
        title: "Password not changed",
        message:
          error instanceof Error
            ? error.message
            : "We could not change your password.",
      });
    },
  });
}
