// Reusable bottom sheet — OTP flows, forms, filters, etc.
import { AppText } from "@/components/ui/AppText";
import { borderColors, surfaceColors } from "@/constants/colors";
import { useEffect, useState, type ReactNode } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeightRatio?: number;
  minHeightRatio?: number;
  /** Override sheet surface. */
  backgroundColor?: string;
  handleColor?: string;
  /**
   * When true, body scrolls and stays above the keyboard.
   * Leave false for short sheets or callers that manage their own ScrollView.
   */
  keyboardAware?: boolean;
};

export function BottomDrawer({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightRatio = 0.85,
  minHeightRatio,
  backgroundColor = surfaceColors.card,
  handleColor = borderColors.strong,
  keyboardAware = false,
}: BottomDrawerProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  /** Measured footer height — hard-coding 68 clipped multi-button footers on iPad. */
  const [footerHeight, setFooterHeight] = useState(0);

  const maxSheetHeight = windowHeight * maxHeightRatio;
  const minSheetHeight = minHeightRatio
    ? windowHeight * minHeightRatio
    : undefined;
  const handleHeight = 28;
  const titleHeight = title ? 64 : 0;
  const resolvedFooterHeight = footer ? Math.max(footerHeight, 56) : 0;
  const scrollMaxHeight = Math.max(
    maxSheetHeight -
      handleHeight -
      titleHeight -
      resolvedFooterHeight -
      Math.max(insets.bottom, 8),
    120,
  );

  useEffect(() => {
    if (!visible) {
      setFooterHeight(0);
    }
  }, [visible]);

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

  const onFooterLayout = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    setFooterHeight((prev) => (prev === next ? prev : next));
  };

  /**
   * Bound the body so nested ScrollViews scroll instead of expanding past the
   * sheet and getting clipped (App Store Guideline 4 on iPad).
   */
  const bodyStyle = {
    flexGrow: minSheetHeight ? 1 : 0,
    flexShrink: 1,
    minHeight: 0,
    maxHeight: scrollMaxHeight,
  } as const;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close drawer"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        />

        <View
          className="w-full overflow-hidden rounded-t-[20px]"
          style={{
            backgroundColor,
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
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
          >
            <View
              className="rounded-full"
              style={{
                width: 36,
                height: 4,
                backgroundColor: handleColor,
              }}
            />
          </Pressable>

          {title ? (
            <View className="border-b border-border-default px-5 pb-4 pt-1">
              <AppText variant="h3">{title}</AppText>
            </View>
          ) : null}

          {keyboardAware ? (
            <KeyboardAwareScrollView
              bottomOffset={24}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              style={bodyStyle}
            >
              {children}
            </KeyboardAwareScrollView>
          ) : (
            <View style={bodyStyle}>{children}</View>
          )}

          {footer ? <View onLayout={onFooterLayout}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
