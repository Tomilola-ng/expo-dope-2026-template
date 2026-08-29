import { GlassIconButton } from "@/components/ui/GlassIconButton";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { GLASS_INK } from "@/components/ui/liquidGlass";
import { brandColors, textColors } from "@/constants/colors";
import { MAX_FONT_SIZE_MULTIPLIER } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, View, type TextInputProps } from "react-native";

type SearchFilterBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  onSubmitEditing?: () => void;
  onFocus?: TextInputProps["onFocus"];
  /** When provided, shows the filter button. */
  onFilterPress?: () => void;
  filterAccessibilityLabel?: string;
  /** Dot indicator when filters are active. */
  filtersActive?: boolean;
};

/**
 * Glass search field with optional filter button.
 */
export function SearchFilterBar({
  value,
  onChangeText,
  placeholder = "Search…",
  accessibilityLabel = "Search",
  onSubmitEditing,
  onFocus,
  onFilterPress,
  filterAccessibilityLabel = "Filters",
  filtersActive = false,
}: SearchFilterBarProps) {
  return (
    <View className="flex-row items-center gap-2">
      <GlassSurface
        edged
        interactive
        style={{
          flex: 1,
          minHeight: 48,
          borderRadius: 999,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        <Ionicons color={textColors.secondary} name="search-outline" size={18} />
        <TextInput
          accessibilityLabel={accessibilityLabel}
          className="flex-1 py-3 text-base text-text-primary"
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={textColors.secondary}
          returnKeyType="search"
          style={{ fontFamily: "NunitoSans", fontSize: 16 }}
          value={value}
        />
      </GlassSurface>
      {onFilterPress ? (
        <GlassIconButton
          accessibilityHint="Opens filters"
          accessibilityLabel={
            filtersActive
              ? `${filterAccessibilityLabel}, filters applied`
              : filterAccessibilityLabel
          }
          borderRadius={16}
          icon="options-outline"
          iconColor={filtersActive ? brandColors.primary : GLASS_INK}
          iconSize={20}
          onPress={onFilterPress}
          size={48}
        >
          {filtersActive ? (
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-primary" />
          ) : null}
        </GlassIconButton>
      ) : null}
    </View>
  );
}
