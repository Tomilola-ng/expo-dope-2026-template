import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import type { RevenueCatSdkState } from "@/services/revenuecat";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type BillingUnavailableProps = {
  state?: Pick<RevenueCatSdkState, "status" | "message" | "unavailableReason">;
};

const DEFAULT_MESSAGE = "Purchases unavailable right now.";

function resolveCopy(state: BillingUnavailableProps["state"]) {
  if (!state) {
    return {
      title: "Billing unavailable",
      description: DEFAULT_MESSAGE,
    };
  }

  if (state.unavailableReason === "unsupported_platform") {
    return {
      title: "Billing unavailable",
      description: "Purchases available on iOS and Android.",
    };
  }

  // Never surface SDK/key/config diagnostics to the user.
  return {
    title: "Billing unavailable",
    description: DEFAULT_MESSAGE,
  };
}

/**
 * Shown when platform SDK keys are missing or configure failed.
 * Hide purchase CTAs when rendering this — do not invent store checkout.
 */
export function BillingUnavailable({ state }: BillingUnavailableProps) {
  const { title, description } = resolveCopy(state);

  return (
    <View className="items-center gap-3 rounded-2xl border border-border-default bg-surface-muted px-4 py-6">
      <Ionicons color={brandColors.primary} name="card-outline" size={28} />
      <AppText className="text-center" variant="h3">
        {title}
      </AppText>
      <AppText className="text-center" color="secondary" variant="bodySmall">
        {description}
      </AppText>
    </View>
  );
}
