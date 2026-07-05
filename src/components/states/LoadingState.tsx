import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import { ActivityIndicator, View } from "react-native";

type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
};

export function LoadingState({
  label = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <View
      className={
        fullScreen
          ? "flex-1 items-center justify-center gap-4"
          : "items-center gap-4 py-10"
      }
    >
      <ActivityIndicator color={brandColors.primary} size="small" />
      <AppText align="center" color="secondary" variant="bodySmall">
        {label}
      </AppText>
    </View>
  );
}
