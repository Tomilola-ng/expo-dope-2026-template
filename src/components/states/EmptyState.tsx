import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center gap-4 px-5 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <Ionicons color={brandColors.primary} name="albums-outline" size={28} />
      </View>
      <View className="gap-2">
        <AppText align="center" variant="h2">
          {title}
        </AppText>
        <AppText align="center" color="secondary">
          {description}
        </AppText>
      </View>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
