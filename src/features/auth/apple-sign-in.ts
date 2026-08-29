import { logDiagnostic } from "@/utils/telemetry";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

export type AppleTokenPayload = {
  identity_token: string;
  full_name?: string;
  email?: string;
};

export async function isAppleSignInAvailable() {
  if (Platform.OS !== "ios") {
    logDiagnostic("auth.apple.available", { available: false, reason: "not_ios" });
    return false;
  }

  try {
    const available = await AppleAuthentication.isAvailableAsync();
    logDiagnostic("auth.apple.available", { available });
    return available;
  } catch (error) {
    logDiagnostic("auth.apple.available_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function formatAppleFullName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
): string | undefined {
  if (!fullName) {
    return undefined;
  }

  const parts = [fullName.givenName, fullName.familyName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(" ");
}

export class AppleSignInCancelledError extends Error {
  constructor() {
    super("Apple Sign In was cancelled.");
    this.name = "AppleSignInCancelledError";
  }
}

export function isAppleSignInCancelled(error: unknown) {
  if (error instanceof AppleSignInCancelledError) {
    return true;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ERR_REQUEST_CANCELED"
  ) {
    return true;
  }

  return false;
}

export async function requestAppleIdentity(): Promise<AppleTokenPayload> {
  logDiagnostic("auth.apple.native_start");

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      logDiagnostic("auth.apple.native_missing_token", {
        hasEmail: Boolean(credential.email),
        hasFullName: Boolean(credential.fullName),
        user: credential.user ? "present" : "missing",
      });
      throw new Error("Apple did not return an identity token.");
    }

    const fullName = formatAppleFullName(credential.fullName);
    const email = credential.email?.trim() || undefined;

    logDiagnostic("auth.apple.native_ok", {
      hasEmail: Boolean(email),
      hasFullName: Boolean(fullName),
      identityTokenLength: credential.identityToken.length,
      user: credential.user ? "present" : "missing",
    });

    return {
      identity_token: credential.identityToken,
      ...(fullName ? { full_name: fullName } : {}),
      ...(email ? { email } : {}),
    };
  } catch (error) {
    if (isAppleSignInCancelled(error)) {
      logDiagnostic("auth.apple.native_cancelled");
      throw new AppleSignInCancelledError();
    }

    logDiagnostic("auth.apple.native_failed", {
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
