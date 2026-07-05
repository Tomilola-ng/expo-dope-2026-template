import designTokens from "@/constants/designTokens.json";
import type { TextStyle } from "react-native";

type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodySmall"
  | "caption"
  | "button"
  | "label";

const fontFamilies = {
  system: "System",
  body: "NunitoSans",
  bodyMedium: "NunitoSansMedium",
  bodySemiBold: "NunitoSansSemiBold",
  bodyBold: "NunitoSansBold",
  fallback: "System",
} as const;

type VariantStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
};

export const typography = {
  fontFamilies,
  variants: {
    display: {
      fontFamily: fontFamilies.system,
      fontSize: designTokens.typography.fontSizes.display,
      lineHeight: designTokens.typography.lineHeights.display,
      fontWeight: "700" as const,
    },
    h1: {
      fontFamily: fontFamilies.system,
      fontSize: designTokens.typography.fontSizes.h1,
      lineHeight: designTokens.typography.lineHeights.h1,
      fontWeight: "700" as const,
    },
    h2: {
      fontFamily: fontFamilies.system,
      fontSize: designTokens.typography.fontSizes.h2,
      lineHeight: designTokens.typography.lineHeights.h2,
      fontWeight: "700" as const,
    },
    h3: {
      fontFamily: fontFamilies.system,
      fontSize: designTokens.typography.fontSizes.h3,
      lineHeight: designTokens.typography.lineHeights.h3,
      fontWeight: "600" as const,
    },
    body: {
      fontFamily: fontFamilies.body,
      fontSize: designTokens.typography.fontSizes.body,
      lineHeight: designTokens.typography.lineHeights.body,
      fontWeight: "400" as const,
    },
    bodySmall: {
      fontFamily: fontFamilies.body,
      fontSize: designTokens.typography.fontSizes.bodySmall,
      lineHeight: designTokens.typography.lineHeights.bodySmall,
      fontWeight: "400" as const,
    },
    caption: {
      fontFamily: fontFamilies.bodyMedium,
      fontSize: designTokens.typography.fontSizes.caption,
      lineHeight: designTokens.typography.lineHeights.caption,
      fontWeight: "500" as const,
    },
    button: {
      fontFamily: fontFamilies.bodyBold,
      fontSize: designTokens.typography.fontSizes.button,
      lineHeight: designTokens.typography.lineHeights.button,
      fontWeight: "700" as const,
    },
    label: {
      fontFamily: fontFamilies.bodySemiBold,
      fontSize: designTokens.typography.fontSizes.bodySmall,
      lineHeight: designTokens.typography.lineHeights.bodySmall,
      fontWeight: "600" as const,
    },
  } satisfies Record<TypographyVariant, VariantStyle>,
} as const;

export type { TypographyVariant };
