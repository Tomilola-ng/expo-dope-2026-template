import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { SettingsItem } from "@/components/settings/SettingsItem";
import {
  SettingsSection,
  SettingsSectionDivider,
} from "@/components/settings/SettingsSection";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAccountSettings } from "@/hooks/useSettings";
import { useAuth } from "@/providers/AuthProvider";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, RefreshControl, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const settingsQuery = useAccountSettings();
  const settings = settingsQuery.data;

  const handleLogout = () => {
    Alert.alert("Log out?", "You can sign back in anytime with your email and password.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  if (settingsQuery.isLoading && !settings) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading settings..." />
      </Screen>
    );
  }

  if (settingsQuery.isError && !settings) {
    return (
      <Screen>
        <ScreenHeader showBack title="Settings" />
        <ErrorState
          message={settingsQuery.error.message}
          onRetry={() => void settingsQuery.refetch()}
          title="We couldn't load settings"
        />
      </Screen>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          onRefresh={() => void settingsQuery.refetch()}
          refreshing={settingsQuery.isRefetching}
        />
      }
      scroll
      contentClassName="gap-5 py-4 pb-24"
    >
      <ScreenHeader showBack title="Settings" />

      <SettingsSection title="Account">
        <SettingsItem
          icon="person-outline"
          label="Edit profile"
          onPress={() => router.push("/(protected)/profile/edit")}
        />
        <SettingsItem
          icon="key-outline"
          label="Change password"
          onPress={() => router.push("/(protected)/settings/change-password")}
        />
        <SettingsItem
          icon="log-out-outline"
          label="Log out"
          onPress={handleLogout}
          showChevron={false}
        />
      </SettingsSection>

      <SettingsSectionDivider />

      <SettingsSection title="Notifications">
        <SettingsItem
          icon="notifications-outline"
          label="Notification preferences"
          onPress={() => router.push("/(protected)/settings/notifications")}
          subtitle={settings.push_enabled ? "Push on" : "Push off"}
        />
      </SettingsSection>

      <SettingsSectionDivider />

      <SettingsSection title="Danger zone">
        <SettingsItem
          icon="trash-outline"
          label="Delete account"
          onPress={() => router.push("/(protected)/settings/delete-account")}
          subtitle="Permanently remove your account"
          variant="destructive"
        />
      </SettingsSection>

      <SettingsSectionDivider />

      <View className="gap-2">
        <AppText variant="h3">About My App</AppText>
        <AppText color="secondary">
          Version {Constants.expoConfig?.version || Constants.nativeAppVersion || "1.0.0"}
        </AppText>
      </View>
    </Screen>
  );
}
