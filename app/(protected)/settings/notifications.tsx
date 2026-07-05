import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  useAccountSettings,
  useUpdateAccountSettings,
} from "@/hooks/useSettings";
import { RefreshControl, View } from "react-native";

export default function NotificationSettingsScreen() {
  const settingsQuery = useAccountSettings();
  const updateSettings = useUpdateAccountSettings();
  const settings = settingsQuery.data;
  const isSaving = updateSettings.isPending;

  const patchSettings = (payload: Parameters<typeof updateSettings.mutate>[0]) => {
    updateSettings.mutate(payload);
  };

  if (settingsQuery.isLoading && !settings) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading notification settings..." />
      </Screen>
    );
  }

  if (settingsQuery.isError && !settings) {
    return (
      <Screen>
        <ScreenHeader showBack title="Notifications" />
        <ErrorState
          message={settingsQuery.error.message}
          onRetry={() => void settingsQuery.refetch()}
          title="We couldn't load notification settings"
        />
      </Screen>
    );
  }

  if (!settings) {
    return null;
  }

  const notificationTogglesDisabled = !settings.push_enabled || isSaving;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          onRefresh={() => void settingsQuery.refetch()}
          refreshing={settingsQuery.isRefetching}
        />
      }
      scroll
      contentClassName="gap-4 py-4"
    >
      <ScreenHeader
        showBack
        subtitle="Choose which push alerts you receive."
        title="Notifications"
      />

      <View className="gap-2">
        <SettingsToggleRow
          description="Turn off to silence all push notifications."
          disabled={isSaving}
          label="Push notifications"
          onValueChange={(value) => patchSettings({ push_enabled: value })}
          value={settings.push_enabled}
        />
        <SettingsToggleRow
          disabled={notificationTogglesDisabled}
          label="Account activity"
          onValueChange={(value) =>
            patchSettings({ notify_account_followed: value })
          }
          value={settings.notify_account_followed}
        />
      </View>

      <AppText color="secondary" variant="caption">
        TODO(template): Add per-event toggles for your app&apos;s notification types.
      </AppText>
    </Screen>
  );
}
