import type { Href } from "expo-router";

export function accountProfileHref(accountId: string): Href {
  return `/(protected)/accounts/${accountId}`;
}

export type ParsedNotificationAction = { type: "account"; accountId: string };

export function parseNotificationActionUrl(
  actionUrl?: string | null,
): ParsedNotificationAction | null {
  if (!actionUrl?.trim()) {
    return null;
  }

  const path = actionUrl.trim().replace(/^\/+/, "");

  const accountMatch = path.match(/^accounts\/([^/]+)(?:\/summary)?$/);
  if (accountMatch?.[1]) {
    return { type: "account", accountId: accountMatch[1] };
  }

  return null;
}
