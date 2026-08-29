import { getApiConfig } from "@/api/config";
import { getStoredTokens } from "@/services/secure-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

export type ClientErrorReport = {
  /** Required human summary (1–4000 chars). Never include secrets. */
  message: string;
  /** Product area, e.g. `auth`, `push`, `billing`. */
  flow?: string;
  /** Screen / route label. */
  screen?: string;
  email?: string | null;
  accountId?: string | null;
  /** Optional short stack or detail — keep free of secrets. */
  stack?: string | null;
  /** Extra non-secret context. */
  metadata?: Record<string, unknown>;
};

function scrubValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (/bearer\s+|sk_|rc_|password|token|secret/i.test(value)) {
      return "[redacted]";
    }
    return value.slice(0, 500);
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map(scrubValue);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (/password|token|secret|authorization|api.?key/i.test(key)) {
        out[key] = "[redacted]";
      } else {
        out[key] = scrubValue(nested);
      }
    }
    return out;
  }
  return value;
}

/**
 * Report a client-side error for ops review (`POST /client-errors/`).
 * Fire-and-forget: never throws, never blocks UI.
 * No-ops quietly when the API is unreachable or the route is missing.
 */
export function reportClientError(report: ClientErrorReport): void {
  const message = report.message.trim().slice(0, 4000);
  if (!message) {
    return;
  }

  void (async () => {
    try {
      const { baseUrl, apiPrefix, tokenPrefix } = getApiConfig();
      const { accessToken } = await getStoredTokens();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (accessToken) {
        headers.Authorization = `${tokenPrefix} ${accessToken}`.trim();
      }

      const body = {
        message,
        flow: report.flow,
        screen: report.screen,
        email: report.email ?? undefined,
        account_id: report.accountId ?? undefined,
        stack:
          typeof report.stack === "string"
            ? report.stack.trim().slice(0, 4000)
            : undefined,
        metadata: report.metadata
          ? (scrubValue(report.metadata) as Record<string, unknown>)
          : undefined,
        platform: Platform.OS,
        app_version: Constants.expoConfig?.version ?? null,
      };

      await fetch(`${baseUrl}${apiPrefix}/client-errors/`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } catch {
      // Never block UI on reporting failures.
    }
  })();
}
