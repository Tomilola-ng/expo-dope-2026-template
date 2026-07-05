import { AccountProfileSection } from "@/components/accounts/AccountProfileSection";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAccountSummary } from "@/hooks/useAccounts";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RefreshControl, Pressable } from "react-native";

export default function ProfileTabScreen() {
  const { user } = useAuth();
  const profileQuery = useProfile();
  const accountSummaryQuery = useAccountSummary(user?.id);
  const profile = profileQuery.data;
  const name =
    profile?.display_name ||
    user?.profile?.display_name ||
    user?.full_name ||
    "User";
  const username = profile?.username || user?.profile?.username;
  const account = {
    id: user?.id ?? "",
    display_name: name,
    username: username ?? accountSummaryQuery.data?.username ?? null,
    bio:
      profile?.bio ||
      accountSummaryQuery.data?.bio ||
      user?.profile?.bio ||
      null,
    avatar_url:
      profile?.avatar_url ||
      accountSummaryQuery.data?.avatar_url ||
      user?.profile?.avatar_url ||
      null,
  };
  const isRefreshing =
    profileQuery.isRefetching || accountSummaryQuery.isRefetching;

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading your account..." />
      </Screen>
    );
  }

  if (profileQuery.isError) {
    return (
      <Screen>
        <ScreenHeader title="Account" />
        <ErrorState
          message={profileQuery.error.message}
          onRetry={() => profileQuery.refetch().catch(() => undefined)}
          title="We couldn't load your account"
        />
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            Promise.all([
              profileQuery.refetch(),
              accountSummaryQuery.refetch(),
            ]).catch(() => undefined);
          }}
          refreshing={isRefreshing}
        />
      }
      scroll
      contentClassName="gap-6 pb-10 pt-2"
    >
      <ScreenHeader
        className="mb-0 min-h-12"
        rightAction={
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-accent"
            hitSlop={8}
            onPress={() => router.push("/(protected)/settings")}
          >
            <Ionicons color="#111111" name="settings-outline" size={20} />
          </Pressable>
        }
        title="Account"
      />

      <AccountProfileSection
        account={account}
        isCurrentUser
        onEditProfile={() => router.push("/(protected)/profile/edit")}
      />
    </Screen>
  );
}
