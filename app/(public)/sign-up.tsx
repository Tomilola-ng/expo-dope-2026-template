import { ApiError, formatRateLimitMessage } from "@/api/errors";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getFieldError, validateRegister } from "@/features/auth/validation";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import { getSignupIpAddress } from "@/services/signup-ip";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";

export default function SignUpScreen() {
  const { register } = useAuth();
  const { showAlert } = useAppAlert();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    Keyboard.dismiss();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    const nextFieldErrors = validateRegister({
      fullName: trimmedFullName,
      email: trimmedEmail,
      password,
    });
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const ipAddress = await getSignupIpAddress();

      await register({
        email: trimmedEmail,
        password,
        full_name: trimmedFullName,
        ...(ipAddress ? { ip_address: ipAddress } : {}),
      });
      router.replace({
        pathname: "/verify-email",
        params: { email: trimmedEmail },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          showAlert({
            title: "Too many attempts",
            message: formatRateLimitMessage(error),
          });
          return;
        }

        setFieldErrors({
          fullName: getFieldError(error.fieldErrors, "full_name") || "",
          email: getFieldError(error.fieldErrors, "email") || "",
          password: getFieldError(error.fieldErrors, "password") || "",
        });
        showAlert({
          title: "Sign-up failed",
          message: error.message,
        });
      } else {
        showAlert({
          title: "Sign-up failed",
          message: "We could not create your account right now.",
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
        <AppText variant="display">Create your account</AppText>
        <AppText color="secondary">
          Save your place now, complete verification, then log in to get started.
        </AppText>
      </View>

      <View className="gap-4">
        <AppInput
          autoCapitalize="words"
          autoComplete="name"
          label="Full name"
          onChangeText={setFullName}
          placeholder="Your name"
          value={fullName}
          error={fieldErrors.fullName || undefined}
          required
        />
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
        <PasswordInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Create a strong password"
          value={password}
          error={fieldErrors.password || undefined}
          required
        />
      </View>

      <View className="gap-3">
        <AppButton
          label="Create account"
          loading={isSubmitting}
          onPress={() => void submit()}
        />
        <View className="flex-row items-center justify-center gap-1">
          <AppText color="secondary" variant="bodySmall">
            Already have an account?
          </AppText>
          <Link asChild href="/(public)/login">
            <Pressable>
              <AppText color="brand" variant="bodySmall">
                Log in
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
