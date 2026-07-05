import { resetPassword } from "@/api/auth";
import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { useAppAlert } from "@/providers/AlertProvider";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, View } from "react-native";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { showAlert } = useAppAlert();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    Keyboard.dismiss();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(password, token || "");
      
      showAlert({
        title: "Password reset successful",
        message: "You can now log in with your new password.",
        onPrimary: () => {
          router.replace("/(public)/login");
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      keyboardAware
      scroll
      contentClassName="flex-grow justify-center gap-6 py-6"
    >
      <View className="gap-2">
        <AppText variant="display">New Password</AppText>
        <AppText color="secondary">
          Enter a new strong password for your account.
        </AppText>
      </View>

      <View className="gap-4">
        <PasswordInput
          label="New Password"
          onChangeText={setPassword}
          placeholder="Enter your new password"
          value={password}
          error={error || undefined}
          required
        />
        <PasswordInput
          label="Confirm Password"
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your new password"
          value={confirmPassword}
          required
        />
      </View>

      <View className="gap-3 mt-4">
        <AppButton
          label="Reset Password"
          loading={isSubmitting}
          onPress={() => void submit()}
        />
      </View>
    </Screen>
  );
}
