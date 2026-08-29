import { AppText } from "@/components/ui/AppText";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { GLASS_INK, GLASS_MUTED } from "@/components/ui/liquidGlass";
import { borderColors, brandColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";

export type SelectOption = {
  value: string;
  label: string;
};

type MultiSelectSheetProps = {
  visible: boolean;
  title: string;
  options: readonly SelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  /** When false, selecting one option replaces the selection. */
  multiple?: boolean;
};

/**
 * Flat multi/single-select list in a BottomDrawer (divider rows, display labels only).
 */
export function MultiSelectSheet({
  visible,
  title,
  options,
  selected,
  onChange,
  onClose,
  multiple = true,
}: MultiSelectSheetProps) {
  const selectedSet = new Set(selected);

  const toggle = (value: string) => {
    if (!multiple) {
      onChange([value]);
      onClose();
      return;
    }
    if (selectedSet.has(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <BottomDrawer onClose={onClose} title={title} visible={visible}>
      <ScrollView className="max-h-96">
        <View>
          {options.map((option, index) => {
            const isSelected = selectedSet.has(option.value);
            const isLast = index === options.length - 1;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option.value}
                onPress={() => toggle(option.value)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: borderColors.default,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Ionicons
                  color={isSelected ? brandColors.primary : GLASS_MUTED}
                  name={
                    multiple
                      ? isSelected
                        ? "checkbox"
                        : "square-outline"
                      : isSelected
                        ? "radio-button-on"
                        : "radio-button-off"
                  }
                  size={22}
                />
                <AppText style={{ color: GLASS_INK, flex: 1 }} variant="body">
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </BottomDrawer>
  );
}
