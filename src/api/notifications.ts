import { apiRequest, buildApiUrl, getAuthorizationHeaders } from "@/api/client";
import type {
  MarkNotificationReadResponse,
  NotificationMetadata,
  NotificationSummary,
  PaginatedResponse,
  PushDeviceTokenPayload,
  PushDeviceTokenRecord,
} from "@/api/types";

type NotificationListOptions = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

function buildNotificationQuery(options?: NotificationListOptions) {
  const searchParams = new URLSearchParams();

  if (typeof options?.page === "number") {
    searchParams.set("page", String(options.page));
  }

  if (typeof options?.pageSize === "number") {
    searchParams.set("page_size", String(options.pageSize));
  }

  if (options?.unreadOnly) {
    searchParams.set("unread_only", "true");
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getNotifications(options?: NotificationListOptions, signal?: AbortSignal) {
  const response = await apiRequest<PaginatedResponse<NotificationSummary>>({
    path: `/notifications${buildNotificationQuery(options)}`,
    auth: true,
    signal,
  });

  return {
    ...response,
    items: response.items.map(normalizeNotificationSummary),
  };
}

export async function getNotificationsPreview(signal?: AbortSignal) {
  return getNotifications({ page: 1, pageSize: 20 }, signal);
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await apiRequest<MarkNotificationReadResponse>({
    method: "PATCH",
    path: `/notifications/${notificationId}/read`,
    auth: true,
  });

  return normalizeNotificationSummary(response);
}

export async function getNotificationStreamRequest(cursor?: number | null) {
  const headers = await getAuthorizationHeaders();
  const url = new URL(buildApiUrl("/notifications/stream"));

  if (typeof cursor === "number" && Number.isFinite(cursor)) {
    url.searchParams.set("after", String(cursor));
    headers["Last-Event-ID"] = String(cursor);
  }

  return {
    url: url.toString(),
    headers,
  };
}

export async function registerNotificationDeviceToken(payload: PushDeviceTokenPayload) {
  return apiRequest<PushDeviceTokenRecord>({
    method: "POST",
    path: "/notifications/device-token",
    auth: true,
    body: payload,
  });
}

export async function deleteNotificationDeviceToken(token: string) {
  return apiRequest<{ success?: boolean; message?: string | null }>({
    method: "DELETE",
    path: "/notifications/device-token",
    auth: true,
    body: { token },
  });
}

export function normalizeNotificationSummary(
  notification: NotificationSummary,
): NotificationSummary {
  const metadata = normalizeNotificationMetadata(notification.metadata);
  const legacySequence =
    "sequence" in (notification as Record<string, unknown>) &&
    typeof (notification as Record<string, unknown>).sequence === "number"
      ? ((notification as Record<string, unknown>).sequence as number)
      : null;
  const sequenceId =
    typeof notification.sequence_id === "number"
      ? notification.sequence_id
      : typeof legacySequence === "number"
        ? legacySequence
        : null;

  return {
    ...notification,
    metadata,
    sequence_id: sequenceId,
    actor_account_id:
      notification.actor_account_id ??
      (typeof metadata?.actor_account_id === "string"
        ? metadata.actor_account_id
        : null),
  };
}

function normalizeNotificationMetadata(
  metadata: NotificationSummary["metadata"],
): NotificationMetadata | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  return metadata;
}
