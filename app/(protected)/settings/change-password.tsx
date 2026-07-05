import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getFieldError } from "@/features/auth/validation";
import { useChangePassword } from "@/hooks/useSettings";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";

function validateChangePassword(values: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const errors: Record<string, string> = {};

  if (!values.oldPassword) {
    errors.oldPassword = "Current password is required.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Use at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function ChangePasswordScreen() {
  const { isAuthenticated } = useAuth();
  const changePasswordMutation = useChangePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    router.replace("/(public)/login");
  }, [isAuthenticated]);

  const submit = async () => {
    Keyboard.dismiss();
    setFormError(null);

    const nextFieldErrors = validateChangePassword({
      oldPassword,
      newPassword,
      confirmPassword,
    });
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors({
          oldPassword: getFieldError(error.fieldErrors, "old_password") || "",
          newPassword: getFieldError(error.fieldErrors, "new_password") || "",
          confirmPassword: getFieldError(error.fieldErrors, "confirm_password") || "",
        });
      }
    }
  };

  return (
    <Screen scroll contentClassName="gap-5 py-4">
      <ScreenHeader
        showBack
        subtitle="You will be signed out on this device after your password changes."
        title="Change password"
      />

      <AppCard className="gap-4">
        <PasswordInput
          autoCapitalize="none"
          error={fieldErrors.oldPassword}
          label="Current password"
          onChangeText={setOldPassword}
          required
          textContentType="password"
          value={oldPassword}
        />
        <PasswordInput
          autoCapitalize="none"
          error={fieldErrors.newPassword}
          helperText="Use at least 8 characters."
          label="New password"
          onChangeText={setNewPassword}
          required
          textContentType="newPassword"
          value={newPassword}
        />
        <PasswordInput
          autoCapitalize="none"
          error={fieldErrors.confirmPassword}
          label="Confirm new password"
          onChangeText={setConfirmPassword}
          required
          textContentType="newPassword"
          value={confirmPassword}
        />

        {formError ? (
          <View className="rounded-xl bg-feedback-error/10 px-4 py-3">
            <AppText style={{ color: "#FF5A5F" }} variant="bodySmall">
              {formError}
            </AppText>
          </View>
        ) : null}

        <AppButton
          label="Update password"
          loading={changePasswordMutation.isPending}
          onPress={() => void submit()}
        />
      </AppCard>
    </Screen>
  );
}
