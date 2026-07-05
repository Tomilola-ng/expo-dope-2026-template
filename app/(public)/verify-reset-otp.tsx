import { forgotPassword, verifyResetOtp } from "@/api/auth";
import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { OtpResendPrompt } from "@/components/ui/OtpResendPrompt";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { TextLink } from "@/components/ui/TextLink";
import { useAppAlert } from "@/providers/AlertProvider";
import {
  DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
  useOtpResendCooldown,
} from "@/hooks/useOtpResendCooldown";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, View } from "react-native";

const OTP_LENGTH = 6;

export default function VerifyResetOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { showAlert } = useAppAlert();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { countdown, canResend, startCooldown } = useOtpResendCooldown(
    DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
  );

  const submit = async (code: string) => {
    Keyboard.dismiss();
    setError(null);

    if (code.length !== OTP_LENGTH) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyResetOtp(email || "", code);

      router.replace({
        pathname: "/(public)/reset-password",
        params: { token: response.reset_token },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        showAlert({
          title: "Too many attempts",
          message: formatRateLimitMessage(err),
        });
        return;
      }

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) {
      return;
    }

    try {
      setIsResending(true);
      setError(null);
      const response = await forgotPassword(email);
      startCooldown(
        DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
      );
      showAlert({
        title: "OTP sent",
        message: response.message || "A new OTP has been sent to your email.",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        startCooldown(err.retryAfter ?? DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
        showAlert({
          title: "Please wait",
          message: formatRateLimitMessage(err),
        });
        return;
      }

      showAlert({
        title: "Could not resend OTP",
        message:
          err instanceof ApiError
            ? err.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen
      keyboardAware
      scroll
      contentClassName="flex-grow justify-center gap-6 py-6"
    >
      <View className="gap-2">
        <AppText variant="display">Enter OTP</AppText>
        <AppText color="secondary">
          Please enter the 6-digit code sent to{" "}
          <AppText color="brand" variant="bodySmall" className="font-bold">
            {email}
          </AppText>
        </AppText>
      </View>

      <View className="gap-4">
        <OtpInput
          autoFocus
          length={OTP_LENGTH}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (error) {
              setError(null);
            }
          }}
          error={error || undefined}
        />
        <OtpResendPrompt
          countdown={countdown}
          isResending={isResending}
          onResend={() => void handleResend()}
        />
      </View>

      <View className="gap-3">
        <AppButton
          label="Verify OTP"
          loading={isSubmitting}
          onPress={() => void submit(otp)}
        />
        <TextLink href="/(public)/login" label="Back to login" />
      </View>
    </Screen>
  );
}
