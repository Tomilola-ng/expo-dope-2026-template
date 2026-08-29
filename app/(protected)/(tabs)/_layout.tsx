import {
  brandColors,
  feedbackColors,
  surfaceColors,
  textColors,
} from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

/**
 * Native system tabs (iOS liquid glass on supported builds; Material on Android).
 * Liquid glass appearance needs a native build with Xcode 26+ on iOS 26+.
 * To revert to JS Tabs, see `prompts/05-ios-glass-native-tabs.md`.
 */
export default function TabsLayout() {
  const isAndroid = Platform.OS === "android";

  return (
    <NativeTabs
      backgroundColor={surfaceColors.card}
      badgeBackgroundColor={feedbackColors.error}
      iconColor={{
        default: textColors.secondary,
        // Android Material indicator is brand primary — selected icon must contrast.
        // iOS has no filled indicator pill; keep selected icons brand primary.
        selected: isAndroid ? textColors.inverse : brandColors.primary,
      }}
      indicatorColor={isAndroid ? brandColors.primary : undefined}
      labelStyle={{
        default: {
          color: textColors.secondary,
          fontFamily: "NunitoSansMedium",
          fontSize: 11,
        },
        selected: {
          color: brandColors.primary,
          fontFamily: "NunitoSansMedium",
          fontSize: 11,
        },
      }}
      labelVisibilityMode="labeled"
      rippleColor={`${brandColors.primary}22`}
      tintColor={brandColors.primary}
    >
      <NativeTabs.Trigger name="index">
        <Icon
          androidSrc={{
            default: (
              <VectorIcon family={MaterialCommunityIcons} name="home-outline" />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="home" />
            ),
          }}
          sf={{ default: "house", selected: "house.fill" }}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          androidSrc={{
            default: (
              <VectorIcon
                family={MaterialCommunityIcons}
                name="account-outline"
              />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="account" />
            ),
          }}
          sf={{ default: "person", selected: "person.fill" }}
        />
        <Label>Account</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
