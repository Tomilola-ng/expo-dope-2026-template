import { AlertProvider } from "@/providers/AlertProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { KeyboardProvider } from "react-native-keyboard-controller";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <QueryProvider>
          <AlertProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationsProvider>{children}</NotificationsProvider>
              </AuthProvider>
            </ToastProvider>
          </AlertProvider>
        </QueryProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
