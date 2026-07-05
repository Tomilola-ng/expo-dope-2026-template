import type { Href } from "expo-router";
import {
  parseNotificationActionUrl,
  type ParsedNotificationAction,
} from "@/utils/routes";

export type PushNotificationData = {
  notification_id?: string | null;
  type?: string | null;
  event_type?: string | null;
  action_url?: string | null;
  actor_account_id?: string | null;
  actor_id?: string | null;
  user_id?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parsePushNotificationData(
  value: unknown,
): PushNotificationData | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    notification_id: readString(record, "notification_id"),
    type: readString(record, "type") ?? readString(record, "event_type"),
    event_type: readString(record, "event_type"),
    action_url: readString(record, "action_url"),
    actor_account_id: readString(record, "actor_account_id"),
    actor_id: readString(record, "actor_id"),
    user_id: readString(record, "user_id"),
  };
}

export function resolvePushNotificationAction(
  data: PushNotificationData,
): ParsedNotificationAction | null {
  const parsedAction = parseNotificationActionUrl(data.action_url);
  if (parsedAction) {
    return parsedAction;
  }

  const accountId = data.actor_account_id ?? data.actor_id ?? data.user_id;
  if (accountId) {
    return { type: "account", accountId };
  }

  return null;
}

export function pushNotificationActionHref(
  action: ParsedNotificationAction,
): Href {
  return `/(protected)/accounts/${action.accountId}`;
}
