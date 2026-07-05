import { ApiError } from "@/api/errors";
import { AccountProfileSection } from "@/components/accounts/AccountProfileSection";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAccountSummary } from "@/hooks/useAccounts";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { RefreshControl } from "react-native";

export default function PublicAccountProfileScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { user } = useAuth();
  const summaryQuery = useAccountSummary(accountId);
  const account = summaryQuery.data;
  const isCurrentUser = account?.is_me === true || accountId === user?.id;

  if (summaryQuery.isLoading) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading profile..." />
      </Screen>
    );
  }

  if (summaryQuery.isError && !account) {
    const isNotFound =
      summaryQuery.error instanceof ApiError &&
      summaryQuery.error.status === 404;

    return (
      <Screen contentClassName="gap-4 py-4">
        <ScreenHeader showBack title="Profile" />
        <ErrorState
          message={
            isNotFound
              ? "This account is no longer available."
              : summaryQuery.error.message
          }
          onRetry={() => void summaryQuery.refetch()}
          title={
            isNotFound ? "Account unavailable" : "We couldn't load this profile"
          }
        />
      </Screen>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          onRefresh={() => void summaryQuery.refetch()}
          refreshing={summaryQuery.isRefetching}
        />
      }
      scroll
      contentClassName="gap-6 pb-10 pt-2"
    >
      <ScreenHeader className="mb-0 min-h-12" showBack title="Profile" />

      <AccountProfileSection
        account={account}
        isCurrentUser={isCurrentUser}
        onEditProfile={
          isCurrentUser
            ? () => router.push("/(protected)/profile/edit")
            : undefined
        }
      />
    </Screen>
  );
}
