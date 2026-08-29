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
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<
  ViewProps & {
    scroll?: boolean;
    keyboardAware?: boolean;
    refreshControl?: ReactElement<RefreshControlProps>;
    contentClassName?: string;
    safeEdges?: Edge[];
    /** Extra space above the keyboard for focused fields (KeyboardAwareScrollView). */
    keyboardBottomOffset?: number;
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
  keyboardBottomOffset = 88,
  style,
  ...props
}: ScreenProps) {
  let content;

  if (keyboardAware && scroll) {
    content = (
      <KeyboardAwareScrollView
        bottomOffset={keyboardBottomOffset}
        className="flex-1"
        contentContainerClassName={cn("px-3", contentClassName)}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  } else if (scroll) {
    content = (
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn("px-3", contentClassName)}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  } else if (keyboardAware) {
    content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
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
