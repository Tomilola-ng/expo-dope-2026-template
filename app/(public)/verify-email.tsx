import { verifyOtp, resendVerificationOtp } from "@/api/auth";
import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { OtpInput } from "@/components/ui/OtpInput";
import { OtpResendPrompt } from "@/components/ui/OtpResendPrompt";
import { Screen } from "@/components/ui/Screen";
import { TextLink } from "@/components/ui/TextLink";
import { useAppAlert } from "@/providers/AlertProvider";
import {
  DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
  useOtpResendCooldown,
} from "@/hooks/useOtpResendCooldown";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Keyboard, View } from "react-native";

const OTP_LENGTH = 6;
const OTP_SEND_SUCCESS_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";
const OTP_VERIFY_FAILURE_MESSAGE = "Invalid or expired code.";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { showAlert } = useAppAlert();
  const email = useMemo(
    () => (typeof params.email === "string" ? params.email.trim() : ""),
    [params.email],
  );
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { countdown, canResend, startCooldown } = useOtpResendCooldown(
    DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
  );

  const submitVerification = async () => {
    Keyboard.dismiss();
    setOtpError(null);

    if (!email || otpCode.length !== OTP_LENGTH) {
      setOtpError("Enter the six-digit OTP code we sent before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOtp({
        email,
        otp_code: otpCode,
      });
      showAlert({
        title: "Email verified",
        message: "Your account is active now. Please log in to continue.",
        onPrimary: () => router.replace("/(public)/login"),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        showAlert({
          title: "Too many attempts",
          message: formatRateLimitMessage(error),
        });
        return;
      }

      setOtpError(OTP_VERIFY_FAILURE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    Keyboard.dismiss();

    if (!email) {
      showAlert({
        title: "Missing email",
        message:
          "We could not find the email address for this verification request.",
      });
      return;
    }

    if (!canResend) {
      return;
    }

    try {
      setIsResending(true);
      setOtpError(null);
      const response = await resendVerificationOtp(email);
      startCooldown(DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
      showAlert({
        title: "OTP sent",
        message: response.message || OTP_SEND_SUCCESS_MESSAGE,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        startCooldown(error.retryAfter ?? DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
        showAlert({
          title: "Please wait",
          message: formatRateLimitMessage(error),
        });
        return;
      }

      showAlert({
        title: "Could not resend OTP",
        message:
          error instanceof ApiError
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen scroll keyboardAware contentClassName="flex-grow py-6">
      <View className="flex-1 justify-between gap-8">
        <View className="gap-8">
          <View className="items-center gap-4">
            <Image
              accessibilityLabel="App logo"
              cachePolicy="memory-disk"
              contentFit="contain"
              source={require("../../assets/images/logo.png")}
              style={{ width: 120, height: 48 }}
            />
            <AppText align="center" variant="display">
              Verify your email
            </AppText>
            <AppText align="center" color="secondary">
              Enter the OTP we sent to{" "}
              <AppText style={{ fontWeight: "heavy" }}>{email}</AppText>, to
              activate your account before logging in.
            </AppText>
          </View>

          <View className="gap-4 mt-5">
            <OtpInput
              autoFocus
              length={OTP_LENGTH}
              onChange={(value) => {
                setOtpCode(value);
                if (otpError) {
                  setOtpError(null);
                }
              }}
              value={otpCode}
              error={otpError || undefined}
            />
            <OtpResendPrompt
              countdown={countdown}
              isResending={isResending}
              onResend={() => void resendOtp()}
            />
            <AppText align="center" color="secondary" variant="bodySmall">
              If you do not see the email, check spam or promotions, then
              request a fresh OTP.
            </AppText>
          </View>
        </View>

        <View className="gap-3 pb-2">
          <TextLink href="/(public)/sign-up" label="Use another email" />
          <AppButton
            disabled={otpCode.length !== OTP_LENGTH}
            label="Verify account"
            loading={isSubmitting}
            onPress={() => void submitVerification()}
          />
          <TextLink href="/(public)/login" label="Back to login" />
        </View>
      </View>
    </Screen>
  );
}
