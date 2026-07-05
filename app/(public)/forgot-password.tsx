import { forgotPassword } from "@/api/auth";
import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { TextLink } from "@/components/ui/TextLink";
import { useAppAlert } from "@/providers/AlertProvider";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, View } from "react-native";

export default function ForgotPasswordScreen() {
  const { showAlert } = useAppAlert();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPassword(email.trim());

      showAlert({
        title: "Check your email",
        message: response.message || "We've sent an OTP to your email.",
        onPrimary: () => {
          router.replace({
            pathname: "/(public)/verify-reset-otp",
            params: { email: email.trim() },
          });
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
        <AppText variant="display">Forgot Password?</AppText>
        <AppText color="secondary">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </AppText>
      </View>

      <View className="gap-4">
        <AppInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
          error={error || undefined}
          required
        />
      </View>

      <View className="gap-3">
        <AppButton
          label="Send reset code"
          loading={isSubmitting}
          onPress={() => void submit()}
        />
        <TextLink href="/(public)/login" label="Back to login" />
      </View>
    </Screen>
  );
}
