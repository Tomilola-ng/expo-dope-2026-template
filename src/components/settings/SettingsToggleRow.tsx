import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { Switch, View } from "react-native";

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsToggleRow({
  label,
  description,
  value,
  disabled = false,
  onValueChange,
}: SettingsToggleRowProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between gap-4 rounded-xl border border-border-default bg-surface-card px-4 py-3.5",
        disabled && "opacity-60",
      )}
    >
      <View className="min-w-0 flex-1 gap-1">
        <AppText variant="label">{label}</AppText>
        {description ? (
          <AppText color="secondary" variant="bodySmall">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: "#D8CEC4", true: "#FF8A1F" }}
        value={value}
      />
    </View>
  );
}
