import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

type AppCardProps = ViewProps & {
  className?: string;
  padding?: "md" | "lg";
  children: ReactNode;
  onPress?: () => void;
};

export function AppCard({
  className,
  padding = "lg",
  children,
  onPress,
  style,
  ...props
}: AppCardProps) {
  const sharedClassName = cn(
    "rounded-xl border border-border-default bg-surface-card",
    padding === "lg" ? "p-5" : "p-4",
    className,
  );

  if (onPress) {
    return (
      <Pressable
        className={sharedClassName}
        onPress={onPress}
        {...props}
        style={({ pressed }) => [
          style,
          pressed ? { transform: [{ scale: 0.99 }] } : undefined,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={sharedClassName} style={style} {...props}>
      {children}
    </View>
  );
}
