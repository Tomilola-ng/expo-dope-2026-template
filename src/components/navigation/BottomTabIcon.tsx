import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { textColors } from "@/constants/colors";
import { View } from "react-native";

type TabIconName = "home" | "profile";

type BottomTabIconProps = {
  name: TabIconName;
  focused: boolean;
  color?: string;
  size?: number;
  badgeCount?: number;
};

const iconMap: Record<TabIconName, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  profile: "person",
};

export function BottomTabIcon({
  name,
  focused,
  color,
  size = 22,
  badgeCount = 0,
}: BottomTabIconProps) {
  const iconColor = color || (focused ? "#111111" : textColors.secondary);
  const baseIconSize = Math.max(18, size - 2);

  return (
    <View>
      <Ionicons color={iconColor} name={iconMap[name]} size={baseIconSize} />
      {badgeCount > 0 ? (
        <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-feedback-error px-1">
          <AppText color="inverse" variant="caption">
            {badgeCount > 9 ? "9+" : badgeCount}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
