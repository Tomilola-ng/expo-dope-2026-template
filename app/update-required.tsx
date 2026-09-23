import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getPendingAppUpdatePolicy } from "@/services/app-update";
import { router } from "expo-router";
import { Linking, View } from "react-native";

export default function UpdateRequiredScreen() {
  const policy = getPendingAppUpdatePolicy();

  return (
    <Screen contentClassName="items-center justify-center gap-5 px-6">
      <View className="w-full max-w-md gap-3">
        <AppText className="text-center" variant="h1">
          {policy?.title || "Update required"}
        </AppText>
        <AppText className="text-center" color="secondary">
          {policy?.message || "Install the latest version to keep using this app."}
        </AppText>
        <AppButton
          label="Update now"
          onPress={() => {
            if (policy?.storeUrl) void Linking.openURL(policy.storeUrl);
          }}
        />
        {!policy ? <AppButton label="Go back" variant="secondary" onPress={() => router.back()} /> : null}
      </View>
    </Screen>
  );
}
