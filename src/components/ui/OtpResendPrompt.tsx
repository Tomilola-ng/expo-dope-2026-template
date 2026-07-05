import { AppText } from "@/components/ui/AppText";
import { Pressable, View } from "react-native";

type OtpResendPromptProps = {
  countdown: number;
  isResending: boolean;
  onResend: () => void;
};

export function OtpResendPrompt({
  countdown,
  isResending,
  onResend,
}: OtpResendPromptProps) {
  const disabled = isResending || countdown > 0;
  const actionLabel =
    countdown > 0 ? `Resend in ${countdown}s` : isResending ? "Sending..." : "Resend";

  return (
    <View className="items-center">
      <Pressable disabled={disabled} onPress={onResend}>
        <AppText align="center" color="secondary" variant="bodySmall">
          Didn&apos;t receive a code?{" "}
          <AppText
            color="brand"
            variant="bodySmall"
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            {actionLabel}
          </AppText>
        </AppText>
      </Pressable>
    </View>
  );
}
