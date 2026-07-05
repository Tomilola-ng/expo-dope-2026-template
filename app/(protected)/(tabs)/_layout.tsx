import { BottomTabIcon } from "@/components/navigation/BottomTabIcon";
import {
  borderColors,
  brandColors,
  surfaceColors,
  textColors,
} from "@/constants/colors";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColors.primary,
        tabBarInactiveTintColor: textColors.secondary,
        tabBarStyle: {
          backgroundColor: surfaceColors.card,
          borderTopColor: borderColors.default,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "NunitoSansMedium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, size }) => (
            <BottomTabIcon focused={focused} name="home" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ focused, size }) => (
            <BottomTabIcon focused={focused} name="profile" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
