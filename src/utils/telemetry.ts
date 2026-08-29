import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getApiConfig } from "@/api/config";
import { reportClientError } from "@/services/client-error-log";

/** Dev-only diagnostic breadcrumb — never show to users. */
export function logDiagnostic(message: string, payload?: unknown): void {
  if (!__DEV__) {
    return;
  }
  if (payload === undefined) {
    console.log(`[diagnostic] ${message}`);
    return;
  }
  console.log(`[diagnostic] ${message}`, payload);
}

/**
 * Unexpected failure path: diagnostic log + optional ops report.
 * Never surfaces eng details to the UI — callers show UNEXPECTED_ERROR copy.
 */
export function reportUnexpectedFailure(
  code: string,
  error: unknown,
  context?: {
    flow?: string;
    screen?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  const message = error instanceof Error ? error.message : String(error);
  const { flow, screen, metadata, ...metadataRest } = context ?? {};
  logDiagnostic(code, { message, flow, screen, ...metadataRest, ...metadata });
  reportClientError({
    message: `${code}: ${message}`.slice(0, 4000),
    flow,
    screen,
    stack: error instanceof Error ? error.stack : undefined,
    metadata: {
      code,
      ...(metadata ?? {}),
      ...metadataRest,
    },
  });
}

export async function trackAppLaunch() {
  try {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }

    let deviceId: string | null = null;
    if (Platform.OS === "ios") {
      deviceId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === "android") {
      deviceId = Device.osBuildId;
    }

    if (!deviceId) {
      return;
    }

    const payload = {
      deviceId,
      platform: Platform.OS,
      appVersion: Application.nativeApplicationVersion || "1.0.0",
    };

    const { baseUrl, apiPrefix } = getApiConfig();

    const response = await fetch(
      `${baseUrl}${apiPrefix}/telemetry/app-launch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      if (__DEV__) {
        console.warn(`Telemetry skipped: HTTP ${response.status}`);
      }
      return;
    }

    const data = await response.json();
    if (__DEV__) {
      console.log("App launch tracked:", data.success);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("Telemetry error:", error);
    }
  }
}
