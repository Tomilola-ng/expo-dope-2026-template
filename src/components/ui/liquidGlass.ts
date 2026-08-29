import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Platform } from "react-native";

/** Near-black icon / selected label on light glass. */
export const GLASS_INK = "#1C1C1E";
/** System-gray for inactive labels on glass controls. */
export const GLASS_MUTED = "#8E8E93";
/**
 * Clean white fallback when native Liquid Glass is unavailable.
 * Avoid translucent white-on-tint (reads muddy on colored backgrounds).
 */
export const GLASS_FALLBACK_FILL = "#FFFFFF";
/**
 * Subtle cool rim for glass chrome on non-native platforms.
 * Not brand-tinted — reads as frosted glass edge.
 */
export const GLASS_EDGE = "rgba(60, 60, 67, 0.14)";

/**
 * True only when the native iOS Liquid Glass API can safely be used.
 * Always false on Android / web / unsupported iOS.
 */
export function canUseLiquidGlass(): boolean {
  if (Platform.OS !== "ios") {
    return false;
  }
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}
