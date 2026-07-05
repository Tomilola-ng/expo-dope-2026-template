import type {
  NotificationSummary,
  PaginatedResponse,
} from "@/api/types";
import type {
  InfiniteData,
  QueryClient,
} from "@tanstack/react-query";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNotificationPage(
  value: unknown,
): value is PaginatedResponse<NotificationSummary> {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    isObject(value.meta)
  );
}

function isInfiniteNotificationList(
  value: unknown,
): value is InfiniteData<PaginatedResponse<NotificationSummary>> {
  return (
    isObject(value) &&
    Array.isArray(value.pages) &&
    value.pages.every((page) => isNotificationPage(page))
  );
}

export function markNotificationReadInCache(
  queryClient: QueryClient,
  notificationId: string,
) {
  queryClient.setQueriesData(
    {
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "notifications",
    },
    (currentData) => {
      if (isNotificationPage(currentData)) {
        return {
          ...currentData,
          items: currentData.items.map((item) =>
            item.id === notificationId ? { ...item, is_read: true } : item,
          ),
        };
      }

      if (isInfiniteNotificationList(currentData)) {
        return {
          ...currentData,
          pages: currentData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === notificationId ? { ...item, is_read: true } : item,
            ),
          })),
        };
      }

      return currentData;
    },
  );
}

export function upsertNotificationInCache(
  queryClient: QueryClient,
  notification: NotificationSummary,
) {
  queryClient.setQueriesData(
    {
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "notifications",
    },
    (currentData) => {
      if (!currentData) {
        return {
          items: [notification],
          meta: {
            page: 1,
            page_size: 20,
            has_next: false,
          },
        };
      }

      if (isNotificationPage(currentData)) {
        return {
          ...currentData,
          items: upsertNotificationArray(currentData.items, notification),
        };
      }

      if (isInfiniteNotificationList(currentData)) {
        if (currentData.pages.length === 0) {
          return currentData;
        }

        return {
          ...currentData,
          pages: currentData.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  items: upsertNotificationArray(page.items, notification),
                }
              : page,
          ),
        };
      }

      return currentData;
    },
  );
}

function upsertNotificationArray(
  notifications: NotificationSummary[],
  incomingNotification: NotificationSummary,
) {
  const existingIndex = notifications.findIndex((item) => item.id === incomingNotification.id);

  if (existingIndex === 0) {
    return notifications.map((item, index) =>
      index === 0 ? { ...item, ...incomingNotification } : item,
    );
  }

  if (existingIndex > 0) {
    const next = notifications.filter((item) => item.id !== incomingNotification.id);
    return [{ ...notifications[existingIndex], ...incomingNotification }, ...next];
  }

  return [incomingNotification, ...notifications];
}
