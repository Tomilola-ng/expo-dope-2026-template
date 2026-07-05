import designTokens from "@/constants/designTokens.json";

export const spacing = {
  xs: Number.parseInt(designTokens.spacing["1"], 10),
  sm: Number.parseInt(designTokens.spacing["2"], 10),
  md: Number.parseInt(designTokens.spacing["4"], 10),
  lg: Number.parseInt(designTokens.spacing["6"], 10),
  xl: Number.parseInt(designTokens.spacing["8"], 10),
  "2xl": Number.parseInt(designTokens.spacing["10"], 10),
} as const;
