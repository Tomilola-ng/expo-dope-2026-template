import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { Pressable, View } from "react-native";

type SettingsRadioOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type SettingsRadioGroupProps<T extends string> = {
  options: SettingsRadioOption<T>[];
  selected: T;
  disabled?: boolean;
  onSelect: (value: T) => void;
};

export function SettingsRadioGroup<T extends string>({
  options,
  selected,
  disabled = false,
  onSelect,
}: SettingsRadioGroupProps<T>) {
  return (
    <View className="gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            className={cn(
              "flex-row items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3.5",
              disabled && "opacity-60",
            )}
            disabled={disabled}
            onPress={() => onSelect(option.value)}
          >
            <View
              className={cn(
                "h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                isSelected ? "border-brand-primary" : "border-border-strong",
              )}
            >
              {isSelected ? (
                <View className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
              ) : null}
            </View>
            <View className="min-w-0 flex-1">
              <AppText variant="label">{option.label}</AppText>
              {option.description ? (
                <AppText color="secondary" variant="bodySmall">
                  {option.description}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
