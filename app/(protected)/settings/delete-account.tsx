import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { OtpInput } from "@/components/ui/OtpInput";
import { OtpResendPrompt } from "@/components/ui/OtpResendPrompt";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  useDeleteAccount,
  useSendDeleteAccountOtp,
} from "@/hooks/useSettings";
import {
  DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
  useOtpResendCooldown,
} from "@/hooks/useOtpResendCooldown";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Keyboard, View } from "react-native";

const OTP_LENGTH = 6;

export default function DeleteAccountScreen() {
  const { isAuthenticated, user } = useAuth();
  const { showAlert } = useAppAlert();
  const sendOtpMutation = useSendDeleteAccountOtp();
  const deleteAccountMutation = useDeleteAccount();
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const { countdown, canResend, startCooldown } = useOtpResendCooldown(0);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    router.replace("/(public)/onboarding");
  }, [isAuthenticated]);

  const sendVerificationCode = async () => {
    Keyboard.dismiss();
    setFieldError(null);

    try {
      const response = await sendOtpMutation.mutateAsync();
      setOtpSent(true);
      startCooldown(DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
      showAlert({
        title: "Code sent",
        message:
          response.message ||
          "We sent a confirmation code to your email address.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        startCooldown(error.retryAfter ?? DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
        showAlert({
          title: "Please wait",
          message: formatRateLimitMessage(error),
        });
      }
    }
  };

  const resendVerificationCode = async () => {
    if (!canResend) {
      return;
    }

    try {
      setIsResending(true);
      setFieldError(null);
      const response = await sendOtpMutation.mutateAsync();
      startCooldown(DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
      showAlert({
        title: "Code sent",
        message:
          response.message ||
          "We sent a new confirmation code to your email address.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        startCooldown(error.retryAfter ?? DEFAULT_OTP_RESEND_COOLDOWN_SECONDS);
        showAlert({
          title: "Please wait",
          message: formatRateLimitMessage(error),
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const confirmDelete = () => {
    Keyboard.dismiss();
    setFieldError(null);

    if (!otpSent) {
      setFieldError("Send a confirmation code to your email first.");
      return;
    }

    if (otpCode.length !== OTP_LENGTH) {
      setFieldError("Enter the 6-digit confirmation code from your email.");
      return;
    }

    Alert.alert(
      "Delete your account?",
      "This permanently removes your account and profile data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteAccountMutation.mutateAsync({ otp_code: otpCode });
              } catch (error) {
                if (error instanceof ApiError) {
                  setFieldError(error.message);
                }
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentClassName="gap-5 py-4">
      <ScreenHeader showBack title="Delete account" />

      <AppCard className="gap-4">
        <View className="gap-2 rounded-full bg-feedback-error/10 px-4 py-3">
          <AppText variant="label">What happens next</AppText>
          <AppText color="secondary" variant="bodySmall">
            Your email and username become available again, your sessions are revoked, and your
            personal profile details are removed.
          </AppText>
        </View>

        <View className="gap-2">
          <AppText variant="label">Confirm with email OTP</AppText>
          <AppText color="secondary" variant="bodySmall">
            We&apos;ll send a 6-digit code to{" "}
            <AppText color="brand" variant="bodySmall">
              {user?.email || "your account email"}
            </AppText>
            .
          </AppText>
        </View>

        {!otpSent ? (
          <AppButton
            label="Send verification code"
            loading={sendOtpMutation.isPending}
            onPress={() => void sendVerificationCode()}
          />
        ) : (
          <View className="gap-4">
            <OtpInput
              autoFocus
              length={OTP_LENGTH}
              onChange={(value) => {
                setOtpCode(value);
                if (fieldError) {
                  setFieldError(null);
                }
              }}
              value={otpCode}
              error={fieldError ?? undefined}
            />
            <OtpResendPrompt
              countdown={countdown}
              isResending={isResending || sendOtpMutation.isPending}
              onResend={() => void resendVerificationCode()}
            />
            <AppButton
              label="Delete my account"
              loading={deleteAccountMutation.isPending}
              onPress={confirmDelete}
              variant="destructive"
            />
          </View>
        )}
      </AppCard>
    </Screen>
  );
}
