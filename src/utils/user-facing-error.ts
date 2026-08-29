/**
 * User-facing copy for unexpected failures.
 * Never put Expo/APNs/SDK/project-id/stack details in the UI.
 */
export const UNEXPECTED_ERROR = {
  title: "Something went wrong",
  message: "We've told the team. They're looking into it.",
} as const;

export const UNEXPECTED_ERROR_EMAIL_LABEL = "Email us";

const TECHNICAL_MESSAGE_PATTERN =
  /expo|project.?id|aps.?environment|entitlement|stack|traceback|errno|econnrefused|status code|http\/|jwt|bearer|revenuecat|sdk key|metro|hermes|typescript|undefined is not|null is not|exception|nsurlerror|cfnetwork|missing .+ for |development build|testflight|eas\b|`[a-z][a-z0-9_]*`/i;

/** True when a string looks like eng/diagnostic text, not product copy. */
export function looksLikeTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return true;
  }
  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed)) {
    return true;
  }
  // Raw JSON / opaque codes
  if (/^[\{\[]/.test(trimmed) || /^[a-z]+_[a-z0-9_]+$/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Sanitize a message before showing it in the UI.
 * Actionable product copy passes through; eng noise becomes the unexpected copy.
 */
export function sanitizeUserFacingMessage(
  message: string | null | undefined,
  fallback: string = UNEXPECTED_ERROR.message,
): string {
  const trimmed = message?.trim();
  if (!trimmed || looksLikeTechnicalMessage(trimmed)) {
    return fallback;
  }
  return trimmed;
}
