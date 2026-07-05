import { NotificationRow } from "@/components/notifications/NotificationRow";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { brandColors, feedbackColors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import { cn } from "@/utils/cn";
import {
  useNotificationsList,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import { useNotificationsConnection } from "@/providers/NotificationsProvider";
import type { NotificationSummary } from "@/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { parseNotificationActionUrl } from "@/utils/routes";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";
import { useAppAlert } from "@/providers/AlertProvider";

export default function NotificationsScreen() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const notificationsQuery = useNotificationsList(20, showUnreadOnly);
  const markReadMutation = useMarkNotificationRead();
  const { deviceTokenRegistered, pushPermissionState, requestPushPermission } =
    useNotificationsConnection();
  const { showAlert } = useAppAlert();
  const isFocused = useIsFocused();
  const autoReadIdsRef = useRef(new Set<string>());
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 70,
    minimumViewTime: 1200,
  });
  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.items) || [];
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const showPushPrompt =
    pushPermissionState !== "granted" || !deviceTokenRegistered;

  const handleMarkRead = useCallback(
    (notificationId: string) => {
      if (autoReadIdsRef.current.has(notificationId)) {
        return;
      }

      autoReadIdsRef.current.add(notificationId);
      markReadMutation.mutate(notificationId, {
        onSettled: () => {
          autoReadIdsRef.current.delete(notificationId);
        },
      });
    },
    [markReadMutation],
  );

  const handleNotificationPress = useCallback(
    (notification: NotificationSummary) => {
      if (!notification.is_read) {
        handleMarkRead(notification.id);
      }

      const parsedAction = parseNotificationActionUrl(notification.action_url);
      if (parsedAction?.type === "account") {
        router.push(`/(protected)/accounts/${parsedAction.accountId}`);
        return;
      }

      const accountId = notification.actor_account_id ?? notification.actor_id;
      if (accountId) {
        router.push(`/(protected)/accounts/${accountId}`);
        return;
      }

      if (__DEV__) {
        console.log(
          "TODO(template): handle notification action_url",
          notification.action_url,
          notification.type,
        );
      }

      showAlert({
        title: "Navigation not configured",
        message:
          "TODO(template): Map this notification action_url to an in-app route.",
      });
    },
    [handleMarkRead, showAlert],
  );

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<NotificationSummary>[];
    }) => {
      if (!isFocused) {
        return;
      }

      viewableItems.forEach((viewableItem) => {
        const notification = viewableItem.item;

        if (!viewableItem.isViewable || !notification || notification.is_read) {
          return;
        }

        handleMarkRead(notification.id);
      });
    },
    [handleMarkRead, isFocused],
  );

  const renderNotification = useCallback(
    ({ item, index }: ListRenderItemInfo<NotificationSummary>) => (
      <NotificationRow
        markReadDisabled={markReadMutation.isPending}
        notification={{
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type,
          isRead: item.is_read,
          createdAt: item.created_at,
        }}
        onMarkRead={item.is_read ? undefined : () => handleMarkRead(item.id)}
        onPress={() => handleNotificationPress(item)}
        showDivider={index < notifications.length - 1}
      />
    ),
    [
      handleMarkRead,
      handleNotificationPress,
      markReadMutation.isPending,
      notifications.length,
    ],
  );

  const listHeader = useMemo(
    () => (
      <View className="gap-4 pb-5">
        <ScreenHeader
          className="mb-0 min-h-12"
          showBack
          subtitle="Stay up to date with your account."
          title="Notifications"
        />

        <View
          className="flex-row rounded-full bg-surface-card p-1"
          style={shadows.soft}
        >
          <FilterChip
            active={!showUnreadOnly}
            label="All"
            onPress={() => setShowUnreadOnly(false)}
          />
          <FilterChip
            active={showUnreadOnly}
            label="Unread"
            onPress={() => setShowUnreadOnly(true)}
          />
        </View>

        {!showUnreadOnly && unreadCount === 0 && notifications.length > 0 ? (
          <View className="flex-row items-center gap-2 px-1">
            <Ionicons
              color={feedbackColors.success}
              name="checkmark-circle"
              size={16}
            />
            <AppText color="secondary" variant="caption">
              You&apos;re all caught up.
            </AppText>
          </View>
        ) : null}

        {showPushPrompt ? (
          <AppCard
            className="gap-3 border-transparent px-4 py-3"
            padding="md"
            style={[shadows.soft, { borderWidth: 0 }]}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-accent">
                <Ionicons
                  color={brandColors.primary}
                  name="notifications-outline"
                  size={18}
                />
              </View>
              <View className="flex-1 gap-1">
                <AppText variant="label">Push alerts</AppText>
                <AppText color="secondary" numberOfLines={2} variant="caption">
                  {pushPermissionState === "granted" && !deviceTokenRegistered
                    ? "Finish connecting this device to receive alerts."
                    : "Turn on push alerts for account updates."}
                </AppText>
              </View>
              <AppButton
                className="px-4 py-2"
                fullWidth={false}
                label={
                  pushPermissionState === "granted" && !deviceTokenRegistered
                    ? "Try again"
                    : "Turn on"
                }
                onPress={() => {
                  requestPushPermission();
                }}
                size="md"
              />
            </View>
          </AppCard>
        ) : null}
      </View>
    ),
    [
      deviceTokenRegistered,
      notifications.length,
      pushPermissionState,
      requestPushPermission,
      showPushPrompt,
      showUnreadOnly,
      unreadCount,
    ],
  );

  if (notificationsQuery.isLoading) {
    return (
      <Screen>
        <ScreenHeader
          className="mb-2 min-h-12"
          showBack
          subtitle="Stay up to date with your account."
          title="Notifications"
        />
        <LoadingState fullScreen label="Loading notifications..." />
      </Screen>
    );
  }

  if (notificationsQuery.isError && notifications.length === 0) {
    return (
      <Screen>
        <ScreenHeader
          className="mb-2 min-h-12"
          showBack
          subtitle="Stay up to date with your account."
          title="Notifications"
        />
        <ErrorState
          message={notificationsQuery.error.message}
          onRetry={() => {
            notificationsQuery.refetch();
          }}
          title="We couldn't load notifications"
        />
      </Screen>
    );
  }

  return (
    <Screen contentClassName="px-0 pb-0">
      <FlatList
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 12,
          paddingTop: 14,
        }}
        data={notifications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          showUnreadOnly ? (
            <View
              className="mt-4 items-center gap-2 rounded-2xl bg-white px-5 py-6"
              style={shadows.soft}
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-accent">
                <Ionicons
                  color={brandColors.primary}
                  name="checkmark-done-outline"
                  size={22}
                />
              </View>
              <AppText align="center" variant="h3">
                No unread notifications
              </AppText>
              <AppText align="center" color="secondary" variant="bodySmall">
                You&apos;re all caught up for now.
              </AppText>
            </View>
          ) : (
            <EmptyState
              description="Account updates and alerts will show up here."
              title="No notifications yet"
            />
          )
        }
        ListFooterComponent={
          <View className="gap-4 pt-5">
            {notificationsQuery.hasNextPage ? (
              <AppButton
                label="Load more notifications"
                loading={notificationsQuery.isFetchingNextPage}
                onPress={() => {
                  notificationsQuery.fetchNextPage();
                }}
                variant="secondary"
              />
            ) : null}

            {notificationsQuery.isError && notifications.length > 0 ? (
              <ErrorState
                compact
                message={notificationsQuery.error.message}
                onRetry={() => {
                  notificationsQuery.refetch();
                }}
              />
            ) : null}
          </View>
        }
        ListHeaderComponent={listHeader}
        onRefresh={() => {
          notificationsQuery.refetch();
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshing={notificationsQuery.isRefetching}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfigRef.current}
      />
    </Screen>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};
function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        "flex-1 items-center justify-center rounded-full px-5 py-3",
        active ? "bg-brand-primary" : "bg-transparent",
      )}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <AppText color={active ? "inverse" : "primary"} variant="label">
        {label}
      </AppText>
    </Pressable>
  );
}
