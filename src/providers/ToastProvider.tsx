import { AppText } from "@/components/ui/AppText";
import { brandColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  View,
  type PanResponderGestureState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ShowToastOptions = {
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;
const SWIPE_DISMISS_THRESHOLD = 72;

function ToastBanner({
  toast,
  topInset,
  onDismiss,
}: {
  toast: ToastItem;
  topInset: number;
  onDismiss: (id: string) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const dragOffsetRef = useRef(0);

  const dismiss = useCallback(() => {
    const exitDirection = dragOffsetRef.current >= 0 ? 120 : -120;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: exitDirection,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  }, [onDismiss, opacity, toast.id, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 8,
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        dragOffsetRef.current = gestureState.dx;
        translateX.setValue(gestureState.dx);
        opacity.setValue(Math.max(0.35, 1 - Math.abs(gestureState.dx) / 220));
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        dragOffsetRef.current = gestureState.dx;

        if (Math.abs(gestureState.dx) >= SWIPE_DISMISS_THRESHOLD) {
          dismiss();
          return;
        }

        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  const isSuccess = toast.variant === "success";
  const isError = toast.variant === "error";

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        opacity,
        transform: [{ translateX }],
        marginTop: topInset + 8,
        marginHorizontal: 12,
      }}
    >
      <View
        className="flex-row items-center gap-3 rounded-xl px-4 py-3"
        style={{
          backgroundColor: isError ? "#FFE8E8" : isSuccess ? "#E8F8EC" : "#FBF4EA",
          borderWidth: 1,
          borderColor: isError ? "#FFB4B4" : isSuccess ? "#B8E6C1" : "#E7D8C7",
          shadowColor: "#2B2118",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Ionicons
          color={isError ? "#D64545" : isSuccess ? "#2E8B45" : brandColors.primary}
          name={isError ? "alert-circle" : isSuccess ? "checkmark-circle" : "information-circle"}
          size={20}
        />
        <AppText className="flex-1" variant="bodySmall">
          {toast.message}
        </AppText>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);

  const dismissToast = useCallback((id: string) => {
    setActiveToast((current) => (current?.id === id ? null : current));
  }, []);

  const showToast = useCallback((message: string, options?: ShowToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setActiveToast({
      id,
      message,
      variant: options?.variant ?? "success",
    });
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        >
          {activeToast ? (
            <ToastBanner
              key={activeToast.id}
              onDismiss={dismissToast}
              toast={activeToast}
              topInset={insets.top}
            />
          ) : null}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
