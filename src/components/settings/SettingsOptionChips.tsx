import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { Pressable, ScrollView, View } from "react-native";

type SettingsOption<T extends string> = {
  value: T;
  label: string;
};

type SettingsOptionChipsProps<T extends string> = {
  label: string;
  description?: string;
  options: SettingsOption<T>[];
  selected: T;
  disabled?: boolean;
  onSelect: (value: T) => void;
};

export function SettingsOptionChips<T extends string>({
  label,
  description,
  options,
  selected,
  disabled = false,
  onSelect,
}: SettingsOptionChipsProps<T>) {
  return (
    <View className="gap-2">
      <AppText variant="label">{label}</AppText>
      {description ? (
        <AppText color="secondary" variant="bodySmall">
          {description}
        </AppText>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pr-4">
          {options.map((option) => {
            const isSelected = selected === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected: isSelected }}
                className={cn(
                  "rounded-full border px-4 py-2",
                  isSelected
                    ? "border-brand-primary bg-brand-primary"
                    : "border-border-default bg-surface-card",
                  disabled && "opacity-60",
                )}
                disabled={disabled}
                onPress={() => onSelect(option.value)}
              >
                <AppText color={isSelected ? "inverse" : "primary"} variant="bodySmall">
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
