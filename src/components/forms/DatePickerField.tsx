import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
};

function parseDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date();
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DatePickerField({
  value,
  onChange,
  label,
  error,
  placeholder = "Select date of birth",
  maximumDate = new Date(),
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = formatDisplayDate(value);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    onChange(formatDateValue(selectedDate));
  };

  return (
    <View className="gap-2">
      {label ? <AppText variant="label">{label}</AppText> : null}

      <Pressable
        accessibilityRole="button"
        className={cn(
          "min-h-12 justify-center rounded-lg border bg-surface-card px-4 py-3",
          error ? "border-feedback-error" : "border-border-default",
        )}
        onPress={() => setShowPicker(true)}
      >
        <AppText color={displayValue ? "primary" : "secondary"} variant="body">
          {displayValue ?? placeholder}
        </AppText>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          mode="date"
          onChange={handleChange}
          value={parseDateValue(value)}
        />
      ) : null}

      {Platform.OS === "ios" && showPicker ? (
        <Pressable
          accessibilityRole="button"
          className="self-end"
          onPress={() => setShowPicker(false)}
        >
          <AppText color="brand" variant="caption">
            Done
          </AppText>
        </Pressable>
      ) : null}

      {error ? (
        <AppText style={{ color: "#FF5A5F" }} variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
