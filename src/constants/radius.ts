import designTokens from "@/constants/designTokens.json";

export const radius = {
  sm: Number.parseInt(designTokens.radius.sm, 10),
  md: Number.parseInt(designTokens.radius.md, 10),
  lg: Number.parseInt(designTokens.radius.lg, 10),
  xl: Number.parseInt(designTokens.radius.xl, 10),
  full: Number.parseInt(designTokens.radius.full, 10),
} as const;
