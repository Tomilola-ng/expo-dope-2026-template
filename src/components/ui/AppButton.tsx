import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type PressableProps, type PressableStateCallbackType } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "md" | "lg";

type AppButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary border-brand-primary",
  secondary: "bg-surface-card border-border-strong",
  ghost: "bg-transparent border-transparent",
  destructive: "bg-feedback-error border-feedback-error",
};

const textColorMap: Record<ButtonVariant, "inverse" | "primary" | "brand"> = {
  primary: "inverse",
  secondary: "primary",
  ghost: "brand",
  destructive: "inverse",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-12 px-5 py-3",
  lg: "min-h-14 px-6 py-4",
};

export function AppButton({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth = true,
  leftIcon,
  className,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "items-center justify-center rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-60",
        className,
      )}
      disabled={isDisabled}
      style={(state: PressableStateCallbackType) => {
        const { pressed } = state;
        const pressedStyle = pressed && !isDisabled ? { transform: [{ scale: 0.98 }] } : undefined;
        const consumerStyle = typeof style === "function" ? style(state) : style;

        return consumerStyle ? [consumerStyle, pressedStyle] : pressedStyle;
      }}
      {...props}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading ? (
          <ActivityIndicator color={variant === "secondary" ? "#111111" : "#FFFFFF"} />
        ) : (
          leftIcon
        )}
        <AppText color={textColorMap[variant]} variant="button">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
