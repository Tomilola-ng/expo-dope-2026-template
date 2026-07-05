import { LoadingState } from "@/components/states/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading your account..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
