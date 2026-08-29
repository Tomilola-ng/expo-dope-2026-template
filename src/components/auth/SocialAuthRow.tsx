import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppText } from "@/components/ui/AppText";
import { isAppleSignInAvailable } from "@/features/auth/apple-sign-in";
import { isGoogleSignInAvailable } from "@/features/auth/google-sign-in";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { View } from "react-native";

type SocialAuthRowProps = {
  disabled?: boolean;
  /** Runs before a social sheet (e.g. mark onboarding complete). */
  onBeforeSignIn?: () => Promise<void> | void;
};

/** Expo Go lacks the Google native module — still render icons for layout preview. */
const LAYOUT_PREVIEW = Constants.appOwnership === "expo";

/**
 * Shared “or” divider + icon row for login / sign-up.
 * Google (iOS + Android when configured) and Apple (iOS when available).
 * Renders nothing when no social provider is available (except Expo Go preview).
 */
export function SocialAuthRow({ disabled, onBeforeSignIn }: SocialAuthRowProps) {
  const [hasProvider, setHasProvider] = useState(LAYOUT_PREVIEW);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([isGoogleSignInAvailable(), isAppleSignInAvailable()]).then(
      ([google, apple]) => {
        if (!cancelled) {
          setHasProvider(google || apple || LAYOUT_PREVIEW);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasProvider) {
    return null;
  }

  return (
    <View className="items-center gap-3">
      <View className="w-full flex-row items-center gap-3 py-1">
        <View className="h-px flex-1 bg-border-default" />
        <AppText color="secondary" variant="caption">
          or
        </AppText>
        <View className="h-px flex-1 bg-border-default" />
      </View>
      <View className="flex-row items-center justify-center gap-5">
        <GoogleSignInButton
          disabled={disabled}
          layoutPreview={LAYOUT_PREVIEW}
          onBeforeSignIn={onBeforeSignIn}
          showDivider={false}
          variant="icon"
        />
        <AppleSignInButton
          disabled={disabled}
          layoutPreview={LAYOUT_PREVIEW}
          onBeforeSignIn={onBeforeSignIn}
          showDivider={false}
          variant="icon"
        />
      </View>
    </View>
  );
}
