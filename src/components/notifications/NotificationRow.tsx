import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type NotificationRowProps = {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  };
  onPress?: () => void;
  onMarkRead?: () => void;
  markReadDisabled?: boolean;
  showDivider?: boolean;
};

export function NotificationRow({
  notification,
  onPress,
  onMarkRead,
  markReadDisabled = false,
  showDivider = false,
}: NotificationRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "py-4 border-border-default",
        // notification.isRead ? "bg-surface-card" : "bg-surface-accent",
        showDivider ? "border-b" : "border-b-0",
      )}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.96 : 1,
      })}
    >
      <View className="flex-row items-start gap-2.5">
        <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons
            color={brandColors.primary}
            name={getNotificationIcon(notification.type)}
            size={17}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <View className="flex-row items-start gap-2">
            <View className="flex-1 gap-1">
              <AppText
                numberOfLines={1}
                style={{ fontWeight: notification.isRead ? "600" : "700" }}
                variant="label"
              >
                {notification.title}
              </AppText>
              <AppText
                color={notification.isRead ? "secondary" : "primary"}
                numberOfLines={2}
                variant="bodySmall"
              >
                {notification.message}
              </AppText>
            </View>

            <View className="items-end gap-2">
              <AppText color="secondary" variant="caption">
                {formatRelativeTime(notification.createdAt)}
              </AppText>
              {notification.isRead ? null : (
                <View
                  className="h-2.5 w-2.5 rounded-full bg-brand-primary"
                  accessibilityLabel="Unread notification"
                />
              )}
            </View>
          </View>

          {!notification.isRead && onMarkRead ? (
            <Pressable
              accessibilityRole="button"
              disabled={markReadDisabled}
              hitSlop={8}
              onPress={onMarkRead}
            >
              <AppText color="brand" variant="caption">
                Mark read
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function getNotificationIcon(type: string): keyof typeof Ionicons.glyphMap {
  if (type.includes("follow")) {
    return "person-outline";
  }

  if (type.includes("comment")) {
    return "chatbubble-outline";
  }

  if (type.includes("tag")) {
    return "at-outline";
  }

  if (type.includes("like")) {
    return "heart-outline";
  }

  if (type.includes("owner") || type.includes("co_owner")) {
    return "people-outline";
  }

  if (type.includes("subscrib") || type.includes("pet")) {
    return "paw-outline";
  }

  switch (type) {
    case "account_followed":
      return "person-outline";
    case "pet_owner_added":
      return "people-outline";
    case "pet_subscribed":
      return "paw-outline";
    case "post_liked":
      return "heart-outline";
    case "post_commented":
      return "chatbubble-outline";
    case "direct_message_received":
      return "chatbubbles-outline";
    case "user_tagged":
      return "at-outline";
    case "success":
      return "checkmark-circle-outline";
    case "warning":
      return "alert-circle-outline";
    case "error":
      return "warning-outline";
    case "info":
      return "information-circle-outline";
    case "system":
      return "sparkles-outline";
    default:
      return "notifications-outline";
  }
}
