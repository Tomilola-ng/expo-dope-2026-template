import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { useRef, useState } from "react";
import { TextInput, View, Pressable } from "react-native";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

const OTP_SLOT_SIZE = 52;

export function OtpInput({
  value,
  onChange,
  length = 6,
  label,
  helperText,
  error,
  disabled = false,
  autoFocus = false,
  className,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const handleChangeText = (text: string) => {
    const sanitized = text.replace(/\D/g, "");
    onChange(sanitized.slice(0, length));
  };

  return (
    <View className={cn("gap-3", className)}>
      {label ? <AppText variant="label">{label}</AppText> : null}

      <Pressable
        onPress={() => {
          if (!disabled) inputRef.current?.focus();
        }}
        className="relative flex-row items-center justify-center gap-2"
      >
        {digits.map((digit, index) => {
          const isCurrentDigit = isFocused && value.length === index;
          const isLastDigitFilled =
            isFocused && value.length === length && index === length - 1;
          const isSlotFocused = isCurrentDigit || isLastDigitFilled;

          let borderClass = "border-border-default bg-surface-card";

          if (error) {
            borderClass = "border-feedback-error bg-feedback-error/10";
          } else if (isSlotFocused) {
            borderClass = "border-brand-primary bg-surface-card";
          }

          return (
            <View
              key={`otp-slot-${index}`}
              className={cn(
                "items-center justify-center rounded-full border",
                borderClass,
                disabled && "opacity-60",
              )}
              style={{
                height: OTP_SLOT_SIZE,
                width: OTP_SLOT_SIZE,
              }}
            >
              <AppText className="text-center font-body text-xl text-text-primary">
                {digit}
              </AppText>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          className="absolute h-full w-full opacity-0"
          caretHidden
          contextMenuHidden={false}
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectTextOnFocus
          textContentType="oneTimeCode"
          value={value}
        />
      </Pressable>

      {error ? (
        <AppText align="center" variant="caption" style={{ color: "#FF5A5F" }}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText align="center" color="secondary" variant="caption">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
