import { reportClientError } from "@/services/client-error-log";
import { logDiagnostic } from "@/utils/telemetry";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

/**
 * Distinguishes RevenueCat SDK readiness without product/checkout logic.
 * Wire identity bind + offerings in your app after keys exist.
 */
export type RevenueCatSdkStatus =
  | "unavailable"
  | "configured"
  | "initialization_failed"
  | "initialized";

export type RevenueCatUnavailableReason =
  | "missing_platform_key"
  | "unsupported_platform";

export type RevenueCatSdkState = {
  status: RevenueCatSdkStatus;
  platform: typeof Platform.OS;
  /** True when configure succeeded — still gate purchases on your identity bind. */
  canShowPurchaseButtons: boolean;
  unavailableReason?: RevenueCatUnavailableReason;
  /** Safe, non-secret message for diagnostics / billing-unavailable UI. */
  message?: string;
};

type ResolvedKey =
  | { ok: true; apiKey: string; platform: "ios" | "android" }
  | {
      ok: false;
      reason: RevenueCatUnavailableReason;
      platform: typeof Platform.OS;
      message: string;
    };

let sdkState: RevenueCatSdkState = buildConfiguredOrUnavailableState();
let configurePromise: Promise<RevenueCatSdkState> | null = null;

function redactKeyHint(apiKey: string): string {
  if (apiKey.length < 8) {
    return "[redacted]";
  }
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-2)}`;
}

function readEnvKey(
  name:
    | "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"
    | "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY",
) {
  // Expo only inlines static property access on process.env.
  if (name === "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() || "";
  }
  return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() || "";
}

function resolvePlatformApiKey(): ResolvedKey {
  if (Platform.OS === "ios") {
    const apiKey = readEnvKey("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        reason: "missing_platform_key",
        platform: "ios",
        message:
          "Billing is unavailable because the iOS RevenueCat public SDK key is not configured.",
      };
    }
    return { ok: true, apiKey, platform: "ios" };
  }

  if (Platform.OS === "android") {
    const apiKey = readEnvKey("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        reason: "missing_platform_key",
        platform: "android",
        message:
          "Billing is unavailable because the Android RevenueCat public SDK key is not configured.",
      };
    }
    return { ok: true, apiKey, platform: "android" };
  }

  return {
    ok: false,
    reason: "unsupported_platform",
    platform: Platform.OS,
    message: "Billing is only available on iOS and Android.",
  };
}

function buildConfiguredOrUnavailableState(): RevenueCatSdkState {
  const resolved = resolvePlatformApiKey();
  if (!resolved.ok) {
    return {
      status: "unavailable",
      platform: resolved.platform,
      canShowPurchaseButtons: false,
      unavailableReason: resolved.reason,
      message: resolved.message,
    };
  }

  return {
    status: "configured",
    platform: resolved.platform,
    canShowPurchaseButtons: false,
    message:
      "RevenueCat public SDK key is present; native configure has not run yet.",
  };
}

function setState(next: RevenueCatSdkState): RevenueCatSdkState {
  sdkState = next;
  return sdkState;
}

/**
 * Read-only snapshot. Does not call the native SDK.
 * Safe when keys are missing — returns unavailable, never throws.
 */
export function getRevenueCatSdkState(): RevenueCatSdkState {
  if (
    sdkState.status === "initialized" ||
    sdkState.status === "initialization_failed"
  ) {
    return sdkState;
  }
  return buildConfiguredOrUnavailableState();
}

export function isRevenueCatSdkInitialized(): boolean {
  return getRevenueCatSdkState().status === "initialized";
}

/**
 * Configure RevenueCat once when keys exist. Missing keys → unavailable (no crash).
 * Does not bind identity, purchase, or check entitlements.
 *
 * Call from authenticated billing flows. Real store IAP requires a
 * development/preview native build (not Expo Go alone).
 */
export async function initializeRevenueCatSdk(): Promise<RevenueCatSdkState> {
  const current = getRevenueCatSdkState();
  if (current.status === "initialized") {
    return current;
  }
  if (current.status === "unavailable") {
    logDiagnostic("revenuecat.sdk_unavailable", {
      reason: current.unavailableReason,
      platform: current.platform,
    });
    return setState(current);
  }

  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = (async () => {
    const resolved = resolvePlatformApiKey();
    if (!resolved.ok) {
      return setState({
        status: "unavailable",
        platform: resolved.platform,
        canShowPurchaseButtons: false,
        unavailableReason: resolved.reason,
        message: resolved.message,
      });
    }

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey: resolved.apiKey });

      logDiagnostic("revenuecat.sdk_initialized", {
        platform: resolved.platform,
        keyHint: redactKeyHint(resolved.apiKey),
      });

      return setState({
        status: "initialized",
        platform: resolved.platform,
        canShowPurchaseButtons: true,
        message: "RevenueCat SDK configured.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "RevenueCat SDK failed to initialize.";

      logDiagnostic("revenuecat.sdk_initialization_failed", {
        platform: resolved.platform,
        keyHint: redactKeyHint(resolved.apiKey),
        error: message,
      });
      reportClientError({
        message,
        flow: "billing",
        screen: "RevenueCat",
        metadata: {
          code: "revenuecat.sdk_initialization_failed",
          platform: resolved.platform,
        },
      });

      return setState({
        status: "initialization_failed",
        platform: resolved.platform,
        canShowPurchaseButtons: false,
        message: "Purchases unavailable right now.",
      });
    } finally {
      configurePromise = null;
    }
  })();

  return configurePromise;
}

/**
 * Log into a stable app-user id after your backend bind. Requires prior configure.
 */
export async function loginRevenueCatUser(appUserId: string): Promise<string> {
  const trimmed = appUserId.trim();
  if (!trimmed) {
    throw new Error("RevenueCat app user id is required.");
  }
  if (!isRevenueCatSdkInitialized()) {
    throw new Error("RevenueCat SDK is not initialized.");
  }

  const { customerInfo } = await Purchases.logIn(trimmed);
  logDiagnostic("revenuecat.login_ok", {
    appUserIdPresent: Boolean(customerInfo.originalAppUserId),
  });
  return customerInfo.originalAppUserId;
}

/** Clear the SDK user on logout. Safe no-op when not initialized. */
export async function logoutRevenueCatUser(): Promise<void> {
  if (!isRevenueCatSdkInitialized()) {
    return;
  }
  try {
    await Purchases.logOut();
    logDiagnostic("revenuecat.logout_ok");
  } catch (error) {
    logDiagnostic("revenuecat.logout_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Reset module state after tests or identity teardown. */
export function resetRevenueCatSdkState(): void {
  sdkState = buildConfiguredOrUnavailableState();
  configurePromise = null;
}
