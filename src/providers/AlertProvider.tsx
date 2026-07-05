import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";

type AlertOptions = {
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

type AlertState = AlertOptions & {
  visible: boolean;
};

type AlertContextValue = {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: PropsWithChildren) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    primaryLabel: "OK",
  });

  const hideAlert = useCallback(() => {
    setAlertState((current) => ({ ...current, visible: false }));
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      title: options.title,
      message: options.message,
      primaryLabel: options.primaryLabel || "OK",
      onPrimary: options.onPrimary,
    });
  }, []);

  const handlePrimary = useCallback(() => {
    const onPrimary = alertState.onPrimary;
    hideAlert();
    onPrimary?.();
  }, [alertState.onPrimary, hideAlert]);

  const value = useMemo(
    () => ({
      showAlert,
      hideAlert,
    }),
    [hideAlert, showAlert],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Modal
        animationType="fade"
        onRequestClose={hideAlert}
        transparent
        visible={alertState.visible}
      >
        <View className="flex-1 items-center justify-center bg-black/45 px-6">
          <Pressable className="absolute inset-0" onPress={hideAlert} />
          <View className="w-full max-w-md gap-4 rounded-2xl bg-white p-5">
            <View className="gap-2">
              <AppText variant="h3">{alertState.title}</AppText>
              <AppText color="secondary">{alertState.message}</AppText>
            </View>
            <AppButton
              label={alertState.primaryLabel || "OK"}
              onPress={handlePrimary}
            />
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAppAlert must be used within AlertProvider.");
  }

  return context;
}
