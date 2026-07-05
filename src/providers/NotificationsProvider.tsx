import {
  getNotificationsPreview,
  getNotificationStreamRequest,
  normalizeNotificationSummary,
  registerNotificationDeviceToken,
} from "@/api/notifications";
import { queryKeys } from "@/api/queryKeys";
import type { NotificationSummary } from "@/api/types";
import { useAppAlert } from "@/providers/AlertProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  clearNotificationCursor,
  getStoredNotificationCursor,
  saveNotificationCursor,
} from "@/services/notification-cursor";
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
import EventSource, {
  type ErrorEvent,
  type EventSourceListener,
  type MessageEvent,
} from "react-native-sse";

type NotificationConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "degraded";

type PushPermissionState = "unknown" | "undetermined" | "denied" | "granted";

type NotificationsContextValue = {
  connectionState: NotificationConnectionState;
  latestSequence: number | null;
  pushPermissionState: PushPermissionState;
  deviceTokenRegistered: boolean;
  requestPushPermission: () => Promise<void>;
};

type NotificationEventType = "connected" | "heartbeat" | "notification";

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

const MAX_RECONNECT_DELAY_MS = 30_000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationsProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { showAlert } = useAppAlert();
  const { isAuthenticated, isInitializing, logout } = useAuth();
  const [connectionState, setConnectionState] =
    useState<NotificationConnectionState>("idle");
  const [latestSequence, setLatestSequence] = useState<number | null>(null);
  const [pushPermissionState, setPushPermissionState] =
    useState<PushPermissionState>("unknown");
  const [deviceTokenRegistered, setDeviceTokenRegistered] = useState(false);
  const sourceRef = useRef<EventSource<NotificationEventType> | null>(null);
  const connectRef = useRef<(() => Promise<void>) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptsRef = useRef(0);
  const SSE_RATE_LIMIT_BACKOFF_MS = 30_000;
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const latestSequenceRef = useRef<number | null>(null);
  const isPromptingForPushRef = useRef(false);
  const requestPushPermissionRef = useRef<(() => Promise<void>) | null>(null);
  const handledInitialNotificationRef = useRef(false);

  const navigateFromPushData = useCallback((rawData: unknown) => {
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
  }, [isAuthenticated]);

  const handlePushDelivery = useCallback(
    (rawData: unknown) => {
      const data = parsePushNotificationData(rawData);
      if (!data) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [queryClient],
  );

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const closeSource = useCallback(() => {
    sourceRef.current?.removeAllEventListeners();
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  const storeSequence = useCallback(async (sequence?: number | null) => {
    if (typeof sequence !== "number" || !Number.isFinite(sequence)) {
      return;
    }

    latestSequenceRef.current = sequence;
    setLatestSequence(sequence);
    await saveNotificationCursor(sequence);
  }, []);

  const handleIncomingNotification = useCallback(
    async (
      payload: Partial<{
        sequence: number;
        notification: NotificationSummary | null;
        type: string;
        heartbeat: boolean;
      }>,
    ) => {
      const nextSequence =
        typeof payload.sequence === "number"
          ? payload.sequence
          : typeof payload.notification?.sequence_id === "number"
            ? payload.notification.sequence_id
            : null;

      if (typeof nextSequence === "number") {
        await storeSequence(nextSequence);
      }

      if (payload.heartbeat || payload.type === "heartbeat") {
        return;
      }

      if (!payload.notification?.id) {
        return;
      }

      upsertNotificationInCache(queryClient, payload.notification);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preview,
      });
    },
    [queryClient, storeSequence],
  );

  const promptForPushPermission = useCallback(
    async (canAskAgain: boolean) => {
      if (isPromptingForPushRef.current) {
        return;
      }

      const promptedAt = await getNotificationPromptedAt();

      if (promptedAt !== null) {
        return;
      }

      isPromptingForPushRef.current = true;
      await markNotificationPromptShown();
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
      });
      isPromptingForPushRef.current = false;
    },
    [showAlert],
  );

  const syncPushPermissionAndToken = useCallback(
    async (allowPrompt = false) => {
      if (
        !isAuthenticated ||
        isInitializing ||
        appStateRef.current !== "active"
      ) {
        return;
      }

      try {
        const permissions = await Notifications.getPermissionsAsync();
        const permissionState = resolvePushPermissionState(permissions);
        setPushPermissionState(permissionState);

        if (permissionState !== "granted") {
          setDeviceTokenRegistered(false);

          if (allowPrompt) {
            await promptForPushPermission(Boolean(permissions.canAskAgain));
          }

          return;
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: getExpoProjectId(),
        });
        const token = normalizePushToken(expoPushToken.data);

        if (!token) {
          setDeviceTokenRegistered(false);
          return;
        }

        await registerNotificationDeviceToken({
          token,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        await saveNotificationDeviceToken(token);
        setDeviceTokenRegistered(true);
      } catch {
        setDeviceTokenRegistered(false);
      }
    },
    [isAuthenticated, isInitializing, promptForPushPermission],
  );

  const requestPushPermission = useCallback(async () => {
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
      await syncPushPermissionAndToken(false);
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
      });
    }
  }, [showAlert, syncPushPermissionAndToken]);

  useEffect(() => {
    requestPushPermissionRef.current = requestPushPermission;
  }, [requestPushPermission]);

  const scheduleReconnect = useCallback(
    (delayOverrideMs?: number) => {
      if (!isAuthenticated || appStateRef.current !== "active") {
        return;
      }

      clearReconnectTimer();
      reconnectAttemptsRef.current += 1;
      const exponentialDelay = Math.min(
        MAX_RECONNECT_DELAY_MS,
        1000 * 2 ** Math.max(0, reconnectAttemptsRef.current - 1),
      );
      const delay = Math.min(
        MAX_RECONNECT_DELAY_MS,
        delayOverrideMs ?? exponentialDelay,
      );

      setConnectionState("reconnecting");
      reconnectTimeoutRef.current = setTimeout(() => {
        void connectRef.current?.();
      }, delay);
    },
    [clearReconnectTimer, isAuthenticated],
  );

  const connect = useCallback(async () => {
    if (
      !isAuthenticated ||
      isInitializing ||
      appStateRef.current !== "active"
    ) {
      return;
    }

    clearReconnectTimer();
    closeSource();
    setConnectionState(
      reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting",
    );

    const cursor =
      latestSequenceRef.current ?? (await getStoredNotificationCursor());

    if (cursor !== null && latestSequenceRef.current === null) {
      latestSequenceRef.current = cursor;
      setLatestSequence(cursor);
    }

    const request = await getNotificationStreamRequest(cursor);
    const source = new EventSource<NotificationEventType>(request.url, {
      headers: request.headers,
      pollingInterval: 0,
      timeout: 30_000,
      timeoutBeforeConnection: 0,
    });

    const openListener: EventSourceListener<
      NotificationEventType,
      "open"
    > = () => {
      reconnectAttemptsRef.current = 0;
      setConnectionState("connected");
      void queryClient.fetchQuery({
        queryKey: queryKeys.notifications.preview,
        queryFn: ({ signal }) => getNotificationsPreview(signal),
      });
    };

    const notificationListener: EventSourceListener<
      NotificationEventType,
      "notification"
    > = (event) => {
      if (!event.data) {
        return;
      }

      void handleEventPayload(event.data, false, getNumericLastEventId(event));
    };

    const heartbeatListener: EventSourceListener<
      NotificationEventType,
      "heartbeat"
    > = (event) => {
      if (!event.data) {
        return;
      }

      void handleEventPayload(event.data, true, getNumericLastEventId(event));
    };

    const messageListener: EventSourceListener<
      NotificationEventType,
      "message"
    > = (event) => {
      if (!event.data) {
        return;
      }

      void handleEventPayload(event.data, false, getNumericLastEventId(event));
    };

    const errorListener: EventSourceListener<NotificationEventType, "error"> = (
      event,
    ) => {
      const normalizedError = event as ErrorEvent;

      if (
        normalizedError.xhrStatus === 401 ||
        normalizedError.xhrStatus === 403
      ) {
        setConnectionState("degraded");
        closeSource();
        void logout();
        return;
      }

      if (normalizedError.xhrStatus === 429) {
        setConnectionState("degraded");
        closeSource();
        scheduleReconnect(SSE_RATE_LIMIT_BACKOFF_MS);
        return;
      }

      setConnectionState("degraded");
      closeSource();
      scheduleReconnect();
    };

    const closeListener: EventSourceListener<
      NotificationEventType,
      "close"
    > = () => {
      closeSource();
      scheduleReconnect();
    };

    const handleEventPayload = async (
      rawData: MessageEvent["data"],
      forceHeartbeat = false,
      eventSequence?: number,
    ) => {
      if (!rawData) {
        return;
      }

      try {
        const parsedData = JSON.parse(rawData) as Record<string, unknown>;
        const notificationCandidate = getNotificationCandidate(parsedData);
        await handleIncomingNotification({
          sequence:
            typeof parsedData.sequence_id === "number"
              ? parsedData.sequence_id
              : typeof parsedData.sequence === "number"
                ? parsedData.sequence
                : typeof parsedData.seq === "number"
                  ? parsedData.seq
                  : eventSequence,
          notification: notificationCandidate
            ? normalizeNotificationSummary(notificationCandidate)
            : null,
          type:
            typeof parsedData.type === "string"
              ? parsedData.type
              : forceHeartbeat
                ? "heartbeat"
                : undefined,
          heartbeat:
            forceHeartbeat ||
            parsedData.heartbeat === true ||
            parsedData.type === "heartbeat",
        });
      } catch {
        if (forceHeartbeat) {
          return;
        }
      }
    };

    source.addEventListener("open", openListener);
    source.addEventListener("message", messageListener);
    source.addEventListener("notification", notificationListener);
    source.addEventListener("heartbeat", heartbeatListener);
    source.addEventListener("error", errorListener);
    source.addEventListener("close", closeListener);
    sourceRef.current = source;
  }, [
    clearReconnectTimer,
    closeSource,
    handleIncomingNotification,
    isAuthenticated,
    isInitializing,
    logout,
    queryClient,
    scheduleReconnect,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated) {
      void connect();
      void syncPushPermissionAndToken(true);
      return;
    }

    clearReconnectTimer();
    closeSource();
    reconnectAttemptsRef.current = 0;
    latestSequenceRef.current = null;
    setLatestSequence(null);
    setConnectionState("idle");
    setPushPermissionState("unknown");
    setDeviceTokenRegistered(false);
    void clearNotificationCursor();
  }, [
    clearReconnectTimer,
    closeSource,
    connect,
    isAuthenticated,
    isInitializing,
    syncPushPermissionAndToken,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;

      if (nextState === "active" && isAuthenticated) {
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        void queryClient.invalidateQueries({ queryKey: ["messages"] });
        void connect();
        void syncPushPermissionAndToken(true);
        return;
      }

      if (nextState !== "active") {
        clearReconnectTimer();
        closeSource();
        setConnectionState("idle");
      }
    });

    return () => subscription.remove();
  }, [
    clearReconnectTimer,
    closeSource,
    connect,
    isAuthenticated,
    queryClient,
    syncPushPermissionAndToken,
  ]);

  useEffect(() => {
    return () => {
      clearReconnectTimer();
      closeSource();
    };
  }, [clearReconnectTimer, closeSource]);

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

  const value = useMemo(
    () => ({
      connectionState,
      latestSequence,
      pushPermissionState,
      deviceTokenRegistered,
      requestPushPermission,
    }),
    [
      connectionState,
      deviceTokenRegistered,
      latestSequence,
      pushPermissionState,
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

function isNotificationSummary(value: unknown): value is NotificationSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function getNotificationCandidate(
  parsedData: Record<string, unknown>,
): NotificationSummary | null {
  if (isNotificationSummary(parsedData.notification)) {
    return parsedData.notification;
  }

  if (isNotificationSummary(parsedData.data)) {
    return parsedData.data;
  }

  if (isNotificationSummary(parsedData)) {
    return parsedData;
  }

  return null;
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
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  return typeof projectId === "string" ? projectId : undefined;
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

function getNumericLastEventId(event: { lastEventId?: string | null }) {
  if (typeof event.lastEventId !== "string") {
    return undefined;
  }

  const lastEventId = Number(event.lastEventId);
  return Number.isFinite(lastEventId) ? lastEventId : undefined;
}
