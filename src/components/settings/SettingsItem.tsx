import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";

const rowShadow = {
  shadowColor: "#2B2118",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

type SettingsItemProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  badge?: string;
  subtitle?: string;
  variant?: "default" | "destructive";
  showChevron?: boolean;
};

export function SettingsItem({
  label,
  icon,
  onPress,
  badge,
  subtitle,
  variant = "default",
  showChevron = true,
}: SettingsItemProps) {
  const isDestructive = variant === "destructive";
  const iconColor = isDestructive ? "#FF5A5F" : "#FF8A1F";
  const iconBackground = isDestructive ? "#FFECEC" : undefined;
  const hasSubtitle = Boolean(subtitle);

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[60px] flex-row items-center gap-3 rounded-2xl bg-surface-card px-4 py-3"
      onPress={onPress}
      style={({ pressed }) => [
        rowShadow,
        pressed ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null,
      ]}
    >
      <View
        className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-accent"
        style={iconBackground ? { backgroundColor: iconBackground } : undefined}
      >
        <Ionicons color={iconColor} name={icon} size={18} />
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <AppText
          style={isDestructive ? { color: "#FF5A5F" } : undefined}
          variant="label"
        >
          {label}
        </AppText>
        {hasSubtitle ? (
          <AppText
            color="secondary"
            numberOfLines={1}
            style={{ marginTop: 1 }}
            variant="caption"
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {badge ? (
        <View className="rounded-full bg-brand-primary px-2 py-0.5">
          <AppText color="inverse" variant="caption">
            {badge}
          </AppText>
        </View>
      ) : null}
      {showChevron ? (
        <Ionicons color="#7A6A5D" name="chevron-forward" size={18} />
      ) : null}
    </Pressable>
  );
}
