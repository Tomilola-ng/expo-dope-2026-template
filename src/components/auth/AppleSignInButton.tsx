import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import {
  isAppleSignInAvailable,
  isAppleSignInCancelled,
  requestAppleIdentity,
} from "@/features/auth/apple-sign-in";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import { logDiagnostic } from "@/utils/telemetry";
import { UNEXPECTED_ERROR } from "@/utils/user-facing-error";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";

type AppleSignInButtonProps = {
  disabled?: boolean;
  showDivider?: boolean;
  size?: "md" | "lg";
  variant?: "button" | "icon";
  /**
   * Keep rendering when native Apple Sign-In is unavailable (Expo Go layout preview).
   * Press shows a short alert instead of starting the native sheet.
   */
  layoutPreview?: boolean;
  onBeforeSignIn?: () => Promise<void> | void;
};

export function AppleSignInButton({
  disabled = false,
  showDivider = true,
  size = "md",
  variant = "button",
  layoutPreview = false,
  onBeforeSignIn,
}: AppleSignInButtonProps) {
  const { loginWithApple } = useAuth();
  const { showAlert } = useAppAlert();
  const [available, setAvailable] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void isAppleSignInAvailable().then((isAvailable) => {
      if (!cancelled) {
        setAvailable(isAvailable);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePress = useCallback(async () => {
    if (disabled || isSubmitting) {
      return;
    }

    if (!available) {
      showAlert({
        title: "Needs a build",
        message:
          "Sign in with Apple works in a development or TestFlight build, not Expo Go.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      logDiagnostic("auth.apple.button_press");

      if (onBeforeSignIn) {
        await onBeforeSignIn();
      }

      const payload = await requestAppleIdentity();
      await loginWithApple(payload);
      router.replace("/(protected)/(tabs)");
    } catch (error) {
      if (isAppleSignInCancelled(error)) {
        logDiagnostic("auth.apple.button_cancelled");
        return;
      }

      logDiagnostic("auth.apple.button_failed", {
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof ApiError ? error.status : undefined,
      });

      if (error instanceof ApiError) {
        if (error.status === 503) {
          setHidden(true);
          showAlert({
            title: "Unavailable",
            message: "Sign in with Apple is not available right now.",
          });
          return;
        }

        if (error.status === 429) {
          showAlert({
            title: "Too many attempts",
            message: formatRateLimitMessage(error),
          });
          return;
        }

        if (error.status === 401) {
          showAlert({
            title: "Sign in failed",
            message: "Try Sign in with Apple again.",
          });
          return;
        }

        showAlert({
          title: "Sign in failed",
          message: UNEXPECTED_ERROR.message,
        });
        return;
      }

      showAlert({
        title: "Sign in failed",
        message: "Could not sign in with Apple. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    available,
    disabled,
    isSubmitting,
    loginWithApple,
    onBeforeSignIn,
    showAlert,
  ]);

  if (hidden || (!available && !(layoutPreview && Platform.OS === "ios"))) {
    return null;
  }

  if (variant === "icon") {
    const boxClass =
      size === "lg"
        ? "h-16 w-16 items-center justify-center rounded-full bg-black"
        : "h-[58px] w-[58px] items-center justify-center rounded-full bg-black";
    const glyphSize = size === "lg" ? 28 : 26;

    return (
      <View className="items-center gap-3">
        {showDivider ? (
          <View className="w-full flex-row items-center gap-3 py-1">
            <View className="h-px flex-1 bg-border-default" />
            <AppText color="secondary" variant="caption">
              or
            </AppText>
            <View className="h-px flex-1 bg-border-default" />
          </View>
        ) : null}
        <Pressable
          accessibilityLabel="Sign in with Apple"
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || isSubmitting }}
          className={boxClass}
          disabled={disabled || isSubmitting}
          hitSlop={8}
          onPress={() => void handlePress()}
          style={({ pressed }) =>
            pressed || disabled || isSubmitting ? { opacity: 0.72 } : undefined
          }
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons color="#FFFFFF" name="logo-apple" size={glyphSize} />
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {showDivider ? (
        <View className="flex-row items-center gap-3 py-1">
          <View className="h-px flex-1 bg-border-default" />
          <AppText color="secondary" variant="bodySmall">
            or
          </AppText>
          <View className="h-px flex-1 bg-border-default" />
        </View>
      ) : null}
      <AppButton
        className="rounded-full border-black bg-black"
        disabled={disabled}
        label="Continue with Apple"
        leftIcon={
          isSubmitting ? null : (
            <Ionicons color="#FFFFFF" name="logo-apple" size={18} />
          )
        }
        loading={isSubmitting}
        onPress={() => void handlePress()}
        size={size}
      />
    </View>
  );
}
