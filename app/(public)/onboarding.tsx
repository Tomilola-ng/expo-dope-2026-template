import { AppButton } from "@/components/ui/AppButton";
import { surfaceColors } from "@/constants/colors";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useAuth } from "@/providers/AuthProvider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const logoSource = require("../../assets/images/logo.png");
const heroSource = require("../../assets/images/onboarding.png");

export default function OnboardingScreen() {
  const onboarding = useOnboardingStatus();
  const { isAuthenticated } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const insets = useSafeAreaInsets();

  const finishOnboarding = async (
    nextRoute: "/(public)/login" | "/(public)/sign-up",
  ) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      await onboarding.markComplete();
      router.replace(isAuthenticated ? "/(protected)/(tabs)" : nextRoute);
    } catch {
      Alert.alert(
        "Onboarding failed",
        "We could not save your onboarding progress. Please try again.",
      );
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Welcome"
        cachePolicy="memory-disk"
        contentFit="cover"
        source={heroSource}
        style={styles.heroImage}
      />

      <View pointerEvents="none" style={styles.overlay} />

      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={styles.safeArea}
      >
        <View
          style={[
            styles.logoWrap,
            { paddingTop: Math.max(insets.top - 40, 0) },
          ]}
        >
          <Image
            accessibilityLabel="App logo"
            cachePolicy="memory-disk"
            contentFit="contain"
            source={logoSource}
            style={styles.logo}
          />
        </View>

        <View
          style={[
            styles.actionsWrap,
            { paddingBottom: Math.max(insets.bottom, 2) },
          ]}
        >
          <AppButton
            className="rounded-full"
            label="Get Started"
            loading={isNavigating}
            onPress={() => void finishOnboarding("/(public)/sign-up")}
            size="lg"
          />
          <AppButton
            className="rounded-full"
            disabled={isNavigating}
            label="I already have an account"
            onPress={() => void finishOnboarding("/(public)/login")}
            size="lg"
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsWrap: {
    gap: 12,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: surfaceColors.background,
    flex: 1,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  logo: {
    height: 60,
    marginLeft: -4,
    width: 180,
  },
  logoWrap: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 17, 17, 0.35)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
});
