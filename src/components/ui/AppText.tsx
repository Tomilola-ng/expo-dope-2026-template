import { textColors } from "@/constants/colors";
import { typography, type TypographyVariant } from "@/constants/typography";
import { cn } from "@/utils/cn";
import { PropsWithChildren } from "react";
import { Text, type TextProps } from "react-native";

type TextColor = keyof typeof textColors | "brand";

const colorMap: Record<TextColor, string> = {
  primary: textColors.primary,
  secondary: textColors.secondary,
  inverse: textColors.inverse,
  brand: "#111111",
};

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: TypographyVariant;
    color?: TextColor;
    align?: "left" | "center" | "right";
    className?: string;
  }
>;

export function AppText({
  children,
  variant = "body",
  color = "primary",
  align = "left",
  className,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={cn(className)}
      style={[
        typography.variants[variant],
        {
          color: colorMap[color],
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
