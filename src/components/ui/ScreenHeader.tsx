import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  titleContent?: ReactNode;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  transparent?: boolean;
  className?: string;
};

export function ScreenHeader({
  title,
  titleContent,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = true,
  className,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        "min-h-14 flex-row items-center justify-between",
        !transparent && "rounded-xl bg-surface-card px-4 py-3",
        className,
      )}
    >
      <View className="flex-1 flex-row items-center gap-3">
        {showBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-accent"
            onPress={onBack || (() => router.back())}
          >
            <Ionicons color="#2B2118" name="arrow-back" size={20} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          {titleContent ?? (
            <AppText numberOfLines={1} variant="h3">
              {title}
            </AppText>
          )}
          {subtitle ? (
            <AppText color="secondary" numberOfLines={2} variant="caption">
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {rightAction}
    </View>
  );
}
