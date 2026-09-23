import "../global.css";

import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { AppProviders } from "@/providers/AppProviders";
import { useAppFonts } from "@/hooks/useAppFonts";
import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { reportUnexpectedFailure, trackAppLaunch } from "@/utils/telemetry";

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("Splash auto-hide prevention skipped", error);
});

const startupImageAssets = [
  require("../assets/images/logo.png"),
  require("../assets/images/onboarding.png"),
];

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!fontsLoaded && !fontError) {
      return () => {
        isMounted = false;
      };
    }

    const prepareApp = async () => {
      try {
        await Asset.loadAsync(startupImageAssets);
        // Track app launch in the background
        void trackAppLaunch();
      } catch (error) {
        console.warn("Startup asset preload failed", error);
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    };

    void prepareApp();

    return () => {
      isMounted = false;
    };
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    const errorUtils = (
      globalThis as {
        ErrorUtils?: {
          getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
          setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
        };
      }
    ).ErrorUtils;
    if (!errorUtils?.getGlobalHandler || !errorUtils.setGlobalHandler) return;

    const previousHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      reportUnexpectedFailure("js.uncaught", error, {
        flow: "global_handler",
        metadata: { isFatal: Boolean(isFatal) },
      });
      previousHandler?.(error, isFatal);
    });
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <AppErrorBoundary>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="update-required" />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </AppErrorBoundary>
    </AppProviders>
  );
}
