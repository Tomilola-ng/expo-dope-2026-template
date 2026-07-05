import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
  compact?: boolean;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry,
  dismissLabel = "Dismiss",
  onDismiss,
  compact = false,
}: ErrorStateProps) {
  const actionHandler = onDismiss || onRetry;
  const actionLabel = onDismiss ? dismissLabel : retryLabel;
  const icon = compact ? null : (
    <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
      <Ionicons color={brandColors.primary} name="alert-circle-outline" size={28} />
    </View>
  );

  return (
    <View
      className={
        compact ? "gap-3 rounded-xl bg-white p-4" : "items-center gap-4 py-10"
      }
    >
      {icon}
      <AppText align={compact ? "left" : "center"} variant="h3">
        {title}
      </AppText>
      <AppText align={compact ? "left" : "center"} color="secondary">
        {message}
      </AppText>
      {actionHandler ? (
        <AppButton label={actionLabel} onPress={actionHandler} />
      ) : null}
    </View>
  );
}
