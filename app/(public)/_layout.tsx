import { LoadingState } from "@/components/states/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function PublicLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Screen>
        <LoadingState fullScreen label="Checking your session..." />
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
