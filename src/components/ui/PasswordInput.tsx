import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { AppInput } from "./AppInput";
import { brandColors } from "@/constants/colors";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof AppInput>,
  "secureTextEntry" | "rightAction"
> & {
  // Add any custom props if needed
};

export function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((current) => !current);
  };

  const eyeIcon = (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={toggleShowPassword}
      className="p-1"
    >
      <Ionicons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={22}
        color={brandColors.primary}
      />
    </Pressable>
  );

  return (
    <AppInput
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={eyeIcon}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}
