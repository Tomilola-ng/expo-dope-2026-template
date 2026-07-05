import { AppText } from "@/components/ui/AppText";
import type { ReactNode } from "react";
import { View } from "react-native";

export function SettingsSectionDivider() {
  return <View className="h-px bg-border-default" />;
}

export function SettingsSection({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <View className="gap-3">
      {title ? <AppText variant="h3">{title}</AppText> : null}
      <View className="gap-2">{children}</View>
    </View>
  );
}
