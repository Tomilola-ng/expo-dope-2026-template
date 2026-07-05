import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import { getFieldError, validateLogin } from "@/features/auth/validation";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";

export default function LoginScreen() {
  const params = useLocalSearchParams<{ signedOut?: string }>();
  const { login, authNotice, clearAuthNotice } = useAuth();
  const { showAlert } = useAppAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justSignedOut = params.signedOut === "1";

  const requiresVerification = (error: ApiError) =>
    error.status === 403 &&
    /verify|verified|verification|activation|activated|inactive|pending/i.test(
      error.message,
    );

  useEffect(() => {
    if (!authNotice) {
      return;
    }

    showAlert({
      title: "Session ended",
      message: authNotice,
      onPrimary: clearAuthNotice,
    });
  }, [authNotice, clearAuthNotice, showAlert]);

  const submit = async () => {
    Keyboard.dismiss();
    clearAuthNotice();

    const nextFieldErrors = validateLogin({ email, password });
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        email: email.trim(),
        password,
      });
      router.replace("/(protected)/(tabs)");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          showAlert({
            title: "Too many attempts",
            message: formatRateLimitMessage(error),
          });
          return;
        }

        if (requiresVerification(error)) {
          router.replace({
            pathname: "/verify-email",
            params: { email: email.trim() },
          });
          return;
        }

        setFieldErrors({
          email: getFieldError(error.fieldErrors, "email") || "",
          password: getFieldError(error.fieldErrors, "password") || "",
        });
        showAlert({
          title: "Login failed",
          message: error.message,
        });
      } else {
        showAlert({
          title: "Login failed",
          message: "We could not log you in right now.",
        });
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
        <AppText variant="display">Welcome back</AppText>
        {justSignedOut ? (
          <AppText color="secondary">
            You&apos;ve been signed out. Log in again whenever you&apos;re ready.
          </AppText>
        ) : (
          <AppText color="secondary">
            Log in to access your account, settings, and notifications.
          </AppText>
        )}
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
          error={fieldErrors.email || undefined}
          required
        />
        <View className="gap-2">
          <PasswordInput
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter your password"
            value={password}
            error={fieldErrors.password || undefined}
            required
          />
          <Link asChild href="/(public)/forgot-password">
            <Pressable className="self-end">
              <AppText color="brand" variant="bodySmall">
                Forgot password?
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>

      <View className="gap-3">
        <AppButton
          label="Log in"
          loading={isSubmitting}
          onPress={() => void submit()}
        />
        <View className="flex-row items-center justify-center gap-1">
          <AppText color="secondary" variant="bodySmall">
            New here?
          </AppText>
          <Link asChild href="/(public)/sign-up">
            <Pressable>
              <AppText color="brand" variant="bodySmall">
                Create an account
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
