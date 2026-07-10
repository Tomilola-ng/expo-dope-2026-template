import { ErrorState } from "@/components/states/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { getApiConfig } from "@/api/config";
import { useAuth } from "@/providers/AuthProvider";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

const logoSource = require("../assets/images/logo.png");
const REDIRECT_DELAY_MS = 2000;

export default function IndexScreen() {
  const { isAuthenticated, isInitializing } = useAuth();

  const configError = useMemo(() => {
    try {
      getApiConfig();
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "A valid API base URL is required.";
    }
  }, []);

  useEffect(() => {
    if (isInitializing && !configError) {
      return;
    }

    void SplashScreen.hideAsync().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);

      if (!/No native splash screen registered/i.test(message)) {
        console.warn("Splash hide failed", error);
      }
    });
  }, [configError, isInitializing]);

  useEffect(() => {
    if (configError || isInitializing) {
      return;
    }

    const timeout = setTimeout(() => {
      router.replace(
        isAuthenticated ? "/(protected)/(tabs)" : "/(public)/onboarding",
      );
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [configError, isAuthenticated, isInitializing]);

  if (isInitializing && !configError) {
    return null;
  }

  if (configError) {
    return (
      <Screen
        className="bg-surface-background"
        contentClassName="items-center justify-center px-6"
      >
        <ErrorState
          message={configError}
          retryLabel="Reload app"
          title="Missing app config"
          onRetry={() => router.replace("/")}
        />
      </Screen>
    );
  }

  return (
    <Screen
      className="bg-surface-background"
      contentClassName="items-center justify-center px-6"
    >
      <View style={styles.logoWrap}>
        <Image
          accessibilityLabel="App logo"
          cachePolicy="memory-disk"
          contentFit="contain"
          source={logoSource}
          style={styles.logo}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: "100%",
  },
  logoWrap: {
    maxWidth: 200,
    width: "100%",
    aspectRatio: 1,
  },
});
