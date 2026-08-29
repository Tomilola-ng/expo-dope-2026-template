import { logDiagnostic } from "@/utils/telemetry";
import { NativeModules, Platform, TurboModuleRegistry } from "react-native";

export type GoogleTokenPayload = {
  id_token: string;
  full_name?: string;
  email?: string;
};

type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

let configureAttempted = false;
let configureSucceeded = false;
let cachedModule: GoogleSignInModule | null | undefined;

function isGoogleNativeModulePresent() {
  try {
    if (TurboModuleRegistry.get("RNGoogleSignin") != null) {
      return true;
    }
  } catch {
    // Fall through to NativeModules.
  }

  return Boolean(NativeModules.RNGoogleSignin);
}

/**
 * Lazy-load so Expo Go / binaries without the Google Sign-In native module
 * do not crash on import (TurboModuleRegistry.getEnforcing).
 */
function getGoogleSignInModule(): GoogleSignInModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  if (!isGoogleNativeModulePresent()) {
    cachedModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("@react-native-google-signin/google-signin") as GoogleSignInModule;
    return cachedModule;
  } catch (error) {
    cachedModule = null;
    logDiagnostic("auth.google.native_module_load_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function googleWebClientId() {
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || "";
}

function googleIosClientId() {
  return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "";
}

function ensureGoogleConfigured() {
  if (configureAttempted) {
    return configureSucceeded;
  }

  configureAttempted = true;
  const module = getGoogleSignInModule();
  if (!module) {
    logDiagnostic("auth.google.configure_skipped", { reason: "native_module_missing" });
    configureSucceeded = false;
    return false;
  }

  const webClientId = googleWebClientId();
  if (!webClientId) {
    logDiagnostic("auth.google.configure_skipped", { reason: "missing_web_client_id" });
    configureSucceeded = false;
    return false;
  }

  try {
    const iosClientId = googleIosClientId();
    module.GoogleSignin.configure({
      webClientId,
      scopes: ["profile", "email"],
      ...(Platform.OS === "ios" && iosClientId ? { iosClientId } : {}),
    });
    configureSucceeded = true;
    logDiagnostic("auth.google.configure_ok", {
      hasIosClientId: Boolean(iosClientId),
      platform: Platform.OS,
    });
    return true;
  } catch (error) {
    configureSucceeded = false;
    logDiagnostic("auth.google.configure_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function isGoogleSignInAvailable() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    logDiagnostic("auth.google.available", {
      available: false,
      reason: "unsupported_platform",
      platform: Platform.OS,
    });
    return false;
  }

  if (!getGoogleSignInModule()) {
    logDiagnostic("auth.google.available", {
      available: false,
      reason: "native_module_missing",
      platform: Platform.OS,
    });
    return false;
  }

  if (!ensureGoogleConfigured()) {
    logDiagnostic("auth.google.available", {
      available: false,
      reason: "not_configured",
      platform: Platform.OS,
    });
    return false;
  }

  const module = getGoogleSignInModule();
  if (!module) {
    return false;
  }

  if (Platform.OS === "android") {
    try {
      await module.GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: false,
      });
    } catch (error) {
      logDiagnostic("auth.google.available", {
        available: false,
        reason: "play_services",
        code:
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : undefined,
      });
      return false;
    }
  }

  logDiagnostic("auth.google.available", { available: true, platform: Platform.OS });
  return true;
}

function formatGoogleFullName(user: {
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
}): string | undefined {
  const fromParts = [user.givenName, user.familyName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (fromParts.length > 0) {
    return fromParts.join(" ");
  }

  const name = user.name?.trim();
  return name || undefined;
}

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google Sign In was cancelled.");
    this.name = "GoogleSignInCancelledError";
  }
}

export function isGoogleSignInCancelled(error: unknown) {
  if (error instanceof GoogleSignInCancelledError) {
    return true;
  }

  const module = getGoogleSignInModule();
  if (
    module &&
    module.isErrorWithCode(error) &&
    error.code === module.statusCodes.SIGN_IN_CANCELLED
  ) {
    return true;
  }

  return false;
}

export async function requestGoogleIdentity(): Promise<GoogleTokenPayload> {
  logDiagnostic("auth.google.native_start");

  const module = getGoogleSignInModule();
  if (!module || !ensureGoogleConfigured()) {
    throw new Error("Google Sign In is not configured.");
  }

  const { GoogleSignin, isSuccessResponse } = module;

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      logDiagnostic("auth.google.native_cancelled");
      throw new GoogleSignInCancelledError();
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      logDiagnostic("auth.google.native_missing_token", {
        hasEmail: Boolean(response.data.user.email),
        hasName: Boolean(response.data.user.name),
      });
      throw new Error("Google did not return an id token.");
    }

    const fullName = formatGoogleFullName(response.data.user);
    const email = response.data.user.email?.trim() || undefined;

    logDiagnostic("auth.google.native_ok", {
      hasEmail: Boolean(email),
      hasFullName: Boolean(fullName),
      idTokenLength: idToken.length,
    });

    return {
      id_token: idToken,
      ...(fullName ? { full_name: fullName } : {}),
      ...(email ? { email } : {}),
    };
  } catch (error) {
    if (isGoogleSignInCancelled(error)) {
      logDiagnostic("auth.google.native_cancelled");
      throw new GoogleSignInCancelledError();
    }

    logDiagnostic("auth.google.native_failed", {
      code:
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : undefined,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : typeof error,
    });

    throw error;
  }
}
