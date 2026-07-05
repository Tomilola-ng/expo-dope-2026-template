// TODO(template): Replace with your app home screen.
import { AppText } from "@/components/ui/AppText";
import { TextLink } from "@/components/ui/TextLink";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

export default function HomeTabScreen() {
  return (
    <Screen scroll contentClassName="gap-6 py-4">
      <ScreenHeader
        className="mb-0 min-h-12"
        rightAction={
          <Pressable
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-brand-primary"
            onPress={() => router.push("/(protected)/notifications")}
          >
            <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
          </Pressable>
        }
        title="Home"
      />

      <View className="gap-4 rounded-3xl bg-surface-muted px-5 py-8">
        <AppText variant="h2">Welcome</AppText>
        <AppText color="secondary" variant="body">
          TODO: Build your app home screen here.
        </AppText>
        <View className="gap-2 pt-2">
          <TextLink
            label="View notifications"
            onPress={() => router.push("/(protected)/notifications")}
          />
          <TextLink
            label="Go to account"
            onPress={() => router.push("/(protected)/(tabs)/profile")}
          />
        </View>
      </View>
    </Screen>
  );
}
