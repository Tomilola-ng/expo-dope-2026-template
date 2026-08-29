import { AppText } from "@/components/ui/AppText";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { GLASS_MUTED } from "@/components/ui/liquidGlass";
import { brandColors } from "@/constants/colors";
import { cn } from "@/utils/cn";
import { Pressable, View } from "react-native";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * Compact segmented control: glass track, brand-primary selected pill.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View className={cn(className)}>
      <GlassSurface
        interactive
        style={{
          height: 44,
          borderRadius: 999,
          overflow: "hidden",
          padding: 4,
          flexDirection: "row",
          width: "100%",
        }}
      >
        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="tablist"
          style={{ flex: 1, flexDirection: "row", height: "100%" }}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={option.value}
                onPress={() => onChange(option.value)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  backgroundColor: active ? brandColors.primary : "transparent",
                }}
              >
                <AppText
                  style={{
                    color: active ? "#FFFFFF" : GLASS_MUTED,
                    fontWeight: active ? "600" : "500",
                  }}
                  variant="bodySmall"
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}
