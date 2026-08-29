import { GlassSurface } from "@/components/ui/GlassSurface";
import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

type GlassCardProps = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Outer corner radius. */
  borderRadius?: number;
  /** Content padding via NativeWind. */
  contentClassName?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

/**
 * Glass card chrome — frosted surface with cool glass rim (never brand-tinted).
 */
export function GlassCard({
  children,
  className,
  style,
  borderRadius = 16,
  contentClassName,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: GlassCardProps) {
  const surface = (
    <GlassSurface
      edged
      interactive={Boolean(onPress)}
      style={[
        {
          borderRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View className={cn(contentClassName, className)}>{children}</View>
    </GlassSurface>
  );

  if (!onPress) {
    return surface;
  }

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.92 } : null)}
    >
      {surface}
    </Pressable>
  );
}
