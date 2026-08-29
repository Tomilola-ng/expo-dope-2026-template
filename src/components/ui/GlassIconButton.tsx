import { GlassSurface } from "@/components/ui/GlassSurface";
import { GLASS_INK } from "@/components/ui/liquidGlass";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

type GlassIconButtonProps = {
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  /** Overlay content (e.g. active filter dot). */
  children?: ReactNode;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Circular / rounded utility control with Liquid Glass chrome.
 */
export function GlassIconButton({
  accessibilityLabel,
  accessibilityHint,
  onPress,
  icon,
  iconSize = 20,
  iconColor = GLASS_INK,
  children,
  size = 44,
  borderRadius,
  style,
}: GlassIconButtonProps) {
  const radius = borderRadius ?? size / 2;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }, style]}
    >
      <GlassSurface
        interactive
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon ? (
          <Ionicons color={iconColor} name={icon} size={iconSize} />
        ) : null}
        {children}
      </GlassSurface>
    </Pressable>
  );
}
