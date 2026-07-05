import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { ReactNode, useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
};

export function AppInput({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  rightAction,
  className,
  onBlur,
  onFocus,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={cn("gap-2", className)}>
      {label ? (
        <AppText variant="label">
          {label}
          {required ? " *" : ""}
        </AppText>
      ) : null}

      <View
        className={cn(
          "min-h-12 flex-row items-center rounded-full border bg-surface-card px-4",
          error
            ? "border-feedback-error bg-feedback-error/5"
            : isFocused
              ? "border-brand-primary"
              : "border-border-default",
        )}
      >
        {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 py-3 font-body text-base text-text-primary"
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor="#7A6A5D"
          {...props}
        />
        {rightIcon ? (
          <View className="ml-2">{rightIcon}</View>
        ) : rightAction ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={rightAction.onPress} className="ml-2">
            <AppText variant="caption" color="brand">
              {rightAction.label}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" style={{ color: "#FF5A5F" }}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText color="secondary" variant="caption">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
