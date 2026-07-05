import { surfaceColors } from "@/constants/colors";
import { cn } from "@/utils/cn";
import { type PropsWithChildren, type ReactElement } from "react";
import {
  Platform,
  ScrollView,
  View,
  type RefreshControlProps,
  type ViewProps,
} from "react-native";
import { KeyboardAvoidingView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<
  ViewProps & {
    scroll?: boolean;
    keyboardAware?: boolean;
    refreshControl?: ReactElement<RefreshControlProps>;
    contentClassName?: string;
    safeEdges?: Edge[];
  }
>;

export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  refreshControl,
  className,
  contentClassName,
  safeEdges = ["top", "left", "right", "bottom"],
  style,
  ...props
}: ScreenProps) {
  let content;

  if (keyboardAware && scroll) {
    content = (
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName={cn("px-3", contentClassName)}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={60}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  } else if (scroll) {
    content = (
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn("px-3", contentClassName)}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  } else if (keyboardAware) {
    content = (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className={cn("flex-1 px-3", contentClassName)}>
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  } else {
    content = (
      <View className={cn("flex-1 px-3", contentClassName)}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView
      className={cn("flex-1", className)}
      edges={safeEdges}
      style={[{ backgroundColor: surfaceColors.background }, style]}
      {...props}
    >
      {content}
    </SafeAreaView>
  );
}
