import {
  getNotificationsPreview,
  registerNotificationDeviceToken,
} from "@/api/notifications";
import { queryKeys } from "@/api/queryKeys";
import type { NotificationSummary } from "@/api/types";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  getNotificationPromptedAt,
  markNotificationPromptShown,
  saveNotificationDeviceToken,
} from "@/services/notification-settings";
import { upsertNotificationInCache } from "@/utils/notification-cache";
import {
  parsePushNotificationData,
  pushNotificationActionHref,
  resolvePushNotificationAction,
} from "@/utils/push-notification";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Linking, Platform, type AppStateStatus } from "react-native";

type PushPermissionState = "unknown" | "undetermined" | "denied" | "granted";

type NotificationsContextValue = {
  /** Kept for inbox compatibility; live updates use poll + push (no SSE). */
  connectionState: "idle" | "polling";
  latestSequence: number | null;
  pushPermissionState: PushPermissionState;
  deviceTokenRegistered: boolean;
  /** True while permission / token registration is in flight. */
  pushRegistrationBusy: boolean;
  /** Last registration failure copy for internals; never shown as eng copy. */
  pushRegistrationMessage: string | null;
  requestPushPermission: () => Promise<void>;
  /** Soft skip so the OS prompt is not forced again this session. */
  dismissPushPrompt: () => void;
  pushPromptDismissed: boolean;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Push registration + inbox refresh. No SSE — live updates use poll + push.
 * The list refreshes on foreground and push delivery.
 */
export function NotificationsProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { showAlert } = useAppAlert();
  const { isAuthenticated, isInitializing } = useAuth();
  const [pushPermissionState, setPushPermissionState] =
    useState<PushPermissionState>("unknown");
  const [deviceTokenRegistered, setDeviceTokenRegistered] = useState(false);
  const [pushRegistrationBusy, setPushRegistrationBusy] = useState(false);
  const [pushRegistrationMessage, setPushRegistrationMessage] = useState<
    string | null
  >(null);
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isPromptingForPushRef = useRef(false);
  const requestPushPermissionRef = useRef<(() => Promise<void>) | null>(null);
  const handledInitialNotificationRef = useRef(false);

  const refreshNotificationQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const navigateFromPushData = useCallback(
    (rawData: unknown) => {
      if (!isAuthenticated) {
        return;
      }

      const data = parsePushNotificationData(rawData);
      if (!data) {
        return;
      }

      const action = resolvePushNotificationAction(data);
      if (!action) {
        return;
      }

      router.push(pushNotificationActionHref(action));
    },
    [isAuthenticated],
  );

  const handlePushDelivery = useCallback(
    (rawData: unknown) => {
      const data = parsePushNotificationData(rawData);
      if (!data) {
        return;
      }

      refreshNotificationQueries();

      if (data.notification_id) {
        upsertNotificationInCache(queryClient, {
          id: data.notification_id,
          title: "New notification",
          message: "",
          type: data.type ?? "info",
          is_read: false,
          action_url: data.action_url,
          created_at: new Date().toISOString(),
          actor_account_id: data.actor_account_id,
        } satisfies NotificationSummary);
      }
    },
    [queryClient, refreshNotificationQueries],
  );

  const promptForPushPermission = useCallback(
    async (canAskAgain: boolean) => {
      if (isPromptingForPushRef.current || pushPromptDismissed) {
        return;
      }

      // Only skip when the user previously tapped “Not now”.
      const dismissedAt = await getNotificationPromptedAt();
      if (dismissedAt !== null) {
        setPushPromptDismissed(true);
        return;
      }

      isPromptingForPushRef.current = true;
      showAlert({
        title: canAskAgain ? "Stay in the loop" : "Turn on notifications",
        message: canAskAgain
          ? "Enable notifications to get account updates even when the app is closed."
          : "Notifications are currently blocked. Open your device settings to turn them back on.",
        primaryLabel: canAskAgain ? "Enable notifications" : "Open settings",
        onPrimary: () => {
          if (canAskAgain) {
            void requestPushPermissionRef.current?.();
            return;
          }

          void Linking.openSettings();
        },
        secondaryLabel: "Not now",
        onSecondary: () => {
          setPushPromptDismissed(true);
          void markNotificationPromptShown();
        },
      });
      isPromptingForPushRef.current = false;
    },
    [pushPromptDismissed, showAlert],
  );

  const syncPushPermissionAndToken = useCallback(
    async (
      allowPrompt = false,
      /** When true, show a generic alert (user tapped Enable). */
      notifyUserOnFailure = false,
    ): Promise<{
      status: "registered" | "denied" | "failed";
      message: string | null;
    }> => {
      if (
        !isAuthenticated ||
        isInitializing ||
        appStateRef.current !== "active"
      ) {
        return { status: "failed", message: null };
      }

      const failQuietly = () => {
        setDeviceTokenRegistered(false);
        setPushRegistrationMessage(
          "Could not register this device for alerts.",
        );
        if (notifyUserOnFailure) {
          showAlert({
            title: "Could not enable notifications",
            message:
              "Something went wrong while connecting this device. Try again in a moment.",
          });
        }
        return {
          status: "failed" as const,
          message: "Could not register this device for alerts.",
        };
      };

      try {
        const permissions = await Notifications.getPermissionsAsync();
        const permissionState = resolvePushPermissionState(permissions);
        setPushPermissionState(permissionState);

        if (permissionState !== "granted") {
          setDeviceTokenRegistered(false);
          setPushRegistrationMessage(null);

          if (allowPrompt) {
            await promptForPushPermission(Boolean(permissions.canAskAgain));
          }

          return { status: "denied", message: null };
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const projectId = getExpoProjectId();
        if (!projectId) {
          return failQuietly();
        }

        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = normalizePushToken(expoPushToken.data);

        if (!token) {
          return failQuietly();
        }

        await registerNotificationDeviceToken({
          token,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        await saveNotificationDeviceToken(token);
        setDeviceTokenRegistered(true);
        setPushRegistrationMessage(null);
        return { status: "registered", message: null };
      } catch {
        return failQuietly();
      }
    },
    [isAuthenticated, isInitializing, promptForPushPermission, showAlert],
  );

  const requestPushPermission = useCallback(async () => {
    setPushPromptDismissed(false);
    setPushRegistrationBusy(true);
    setPushRegistrationMessage(null);
    try {
      const permissions = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      const permissionState = resolvePushPermissionState(permissions);
      setPushPermissionState(permissionState);

      if (permissionState === "granted") {
        await syncPushPermissionAndToken(false, true);
        return;
      }

      if (!permissions.canAskAgain) {
        showAlert({
          title: "Turn on notifications",
          message:
            "The app cannot ask again from here right now. Open your device settings if you want to enable notifications later.",
          primaryLabel: "Open settings",
          onPrimary: () => {
            void Linking.openSettings();
          },
          secondaryLabel: "Not now",
          onSecondary: () => {
            setPushPromptDismissed(true);
            void markNotificationPromptShown();
          },
        });
        return;
      }

      showAlert({
        title: "Permission needed",
        message: "Allow notifications to get account updates.",
      });
    } finally {
      setPushRegistrationBusy(false);
    }
  }, [showAlert, syncPushPermissionAndToken]);

  const dismissPushPrompt = useCallback(() => {
    setPushPromptDismissed(true);
    void markNotificationPromptShown();
  }, []);

  useEffect(() => {
    requestPushPermissionRef.current = requestPushPermission;
  }, [requestPushPermission]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated) {
      void syncPushPermissionAndToken(true);
      void queryClient.fetchQuery({
        queryKey: queryKeys.notifications.preview,
        queryFn: ({ signal }) => getNotificationsPreview(signal),
      });
      return;
    }

    setPushPermissionState("unknown");
    setDeviceTokenRegistered(false);
    setPushPromptDismissed(false);
  }, [
    isAuthenticated,
    isInitializing,
    queryClient,
    syncPushPermissionAndToken,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;

      if (nextState === "active" && isAuthenticated) {
        refreshNotificationQueries();
        void syncPushPermissionAndToken(false);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, refreshNotificationQueries, syncPushPermissionAndToken]);

  useEffect(() => {
    if (!isAuthenticated || isInitializing) {
      return;
    }

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        handlePushDelivery(notification.request.content.data);
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigateFromPushData(response.notification.request.content.data);
      });

    if (!handledInitialNotificationRef.current) {
      handledInitialNotificationRef.current = true;
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) {
          return;
        }

        navigateFromPushData(response.notification.request.content.data);
      });
    }

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [
    handlePushDelivery,
    isAuthenticated,
    isInitializing,
    navigateFromPushData,
  ]);

  const connectionState =
    isAuthenticated && !isInitializing ? ("polling" as const) : ("idle" as const);

  const value = useMemo(
    () => ({
      connectionState,
      latestSequence: null,
      pushPermissionState,
      deviceTokenRegistered,
      pushRegistrationBusy,
      pushRegistrationMessage,
      requestPushPermission,
      dismissPushPrompt,
      pushPromptDismissed,
    }),
    [
      connectionState,
      deviceTokenRegistered,
      dismissPushPrompt,
      pushPermissionState,
      pushPromptDismissed,
      pushRegistrationBusy,
      pushRegistrationMessage,
      requestPushPermission,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsConnection() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsConnection must be used within NotificationsProvider.",
    );
  }

  return context;
}

function resolvePushPermissionState(
  permissions: Notifications.NotificationPermissionsStatus,
): PushPermissionState {
  if (permissions.granted) {
    return "granted";
  }

  if (permissions.status === Notifications.PermissionStatus.UNDETERMINED) {
    return "undetermined";
  }

  if (permissions.status === Notifications.PermissionStatus.DENIED) {
    return "denied";
  }

  return "unknown";
}

function getExpoProjectId() {
  const fromEasConfig = Constants.easConfig?.projectId;
  if (typeof fromEasConfig === "string" && fromEasConfig.trim()) {
    return fromEasConfig.trim();
  }
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId;
  return typeof fromExtra === "string" && fromExtra.trim()
    ? fromExtra.trim()
    : undefined;
}

function normalizePushToken(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "token" in value) {
    return typeof value.token === "string" ? value.token : null;
  }

  return null;
}
