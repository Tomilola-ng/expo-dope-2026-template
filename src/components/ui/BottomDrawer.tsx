// Reusable bottom sheet — OTP flows, forms, chat input, etc.
import { AppText } from "@/components/ui/AppText";
import { surfaceColors } from "@/constants/colors";
import { useEffect, useState, type ReactNode } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeightRatio?: number;
  minHeightRatio?: number;
};

export function BottomDrawer({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightRatio = 0.85,
  minHeightRatio,
}: BottomDrawerProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const windowHeight = Dimensions.get("window").height;
  const maxSheetHeight = windowHeight * maxHeightRatio;
  const minSheetHeight = minHeightRatio
    ? windowHeight * minHeightRatio
    : undefined;
  const handleHeight = 28;
  const titleHeight = title ? 52 : 0;
  const footerHeight = footer ? 68 : 0;
  const scrollMaxHeight =
    maxSheetHeight -
    handleHeight -
    titleHeight -
    footerHeight -
    Math.max(insets.bottom, 8);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <Pressable
          accessibilityLabel="Close drawer"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={onClose}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        />

        <View
          className="w-full overflow-hidden rounded-t-[20px]"
          style={{
            backgroundColor: surfaceColors.card,
            flexDirection: "column",
            maxHeight: maxSheetHeight,
            minHeight: minSheetHeight,
            paddingBottom:
              footer && isKeyboardVisible ? 4 : Math.max(insets.bottom, 8),
          }}
        >
          <Pressable
            accessibilityLabel="Close drawer"
            accessibilityRole="button"
            className="items-center py-3"
            hitSlop={12}
            onPress={onClose}
          >
            <View
              className="rounded-full"
              style={{
                width: 36,
                height: 4,
                backgroundColor: "#C9B8A8",
              }}
            />
          </Pressable>

          {title ? (
            <View className="border-b border-border-default px-4 pb-3">
              <AppText variant="h3">{title}</AppText>
            </View>
          ) : null}

          <View
            style={{
              flex: minSheetHeight ? 1 : undefined,
              maxHeight: Math.max(scrollMaxHeight, 120),
            }}
          >
            {children}
          </View>

          {footer}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
