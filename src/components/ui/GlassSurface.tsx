import {
  canUseLiquidGlass,
  GLASS_EDGE,
  GLASS_FALLBACK_FILL,
} from "@/components/ui/liquidGlass";
import { GlassView } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type GlassSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** Prefer interactive glass for tappable chrome. */
  interactive?: boolean;
  /** Native style; ignored on fallback. */
  glassEffectStyle?: "regular" | "clear";
  /**
   * Subtle cool glass rim (never brand-tinted).
   * Native glass still gets a soft hairline so cards read as edged chrome.
   */
  edged?: boolean;
}>;

/**
 * Native Liquid Glass on supported iOS; clean white + optional cool rim elsewhere.
 */
export function GlassSurface({
  children,
  style,
  interactive = false,
  glassEffectStyle = "regular",
  edged = false,
}: GlassSurfaceProps) {
  const edgeStyle = edged
    ? {
        borderWidth: 1,
        borderColor: canUseLiquidGlass()
          ? "rgba(255,255,255,0.45)"
          : GLASS_EDGE,
      }
    : null;

  if (canUseLiquidGlass()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive}
        style={[edgeStyle, style]}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[{ backgroundColor: GLASS_FALLBACK_FILL }, edgeStyle, style]}
    >
      {children}
    </View>
  );
}
