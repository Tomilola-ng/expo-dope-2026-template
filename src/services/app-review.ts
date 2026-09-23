import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";
import { hasReviewCooldownElapsed } from "./app-review-policy";

export { hasReviewCooldownElapsed } from "./app-review-policy";

const LAST_REQUESTED_AT_KEY = "template.appReview.lastRequestedAt";

export type AppReviewOptions = {
  /** Persisted cooldown for prompts initiated by product logic. */
  minimumDaysBetweenRequests?: number;
  /** User-initiated settings actions may bypass the cooldown. */
  ignoreCooldown?: boolean;
};

export async function canRequestAppReview(options: AppReviewOptions = {}) {
  if (Platform.OS === "web" || !(await StoreReview.isAvailableAsync())) return false;
  if (options.ignoreCooldown) return true;

  const raw = await AsyncStorage.getItem(LAST_REQUESTED_AT_KEY).catch(() => null);
  const lastRequestedAt = raw ? Number.parseInt(raw, 10) : null;
  return hasReviewCooldownElapsed(
    Number.isFinite(lastRequestedAt) ? lastRequestedAt : null,
    Date.now(),
    options.minimumDaysBetweenRequests ?? 90,
  );
}

/**
 * Requests the native rating sheet. Store policy decides whether it is shown.
 * The attempt is persisted first so callers cannot accidentally nag users.
 */
export async function requestAppReview(options: AppReviewOptions = {}) {
  try {
    if (!(await canRequestAppReview(options))) return false;
    await AsyncStorage.setItem(LAST_REQUESTED_AT_KEY, String(Date.now()));
    await StoreReview.requestReview();
    return true;
  } catch (error) {
    if (__DEV__) console.warn("[app-review] request failed", error);
    return false;
  }
}

export async function getLastAppReviewRequestAt() {
  const raw = await AsyncStorage.getItem(LAST_REQUESTED_AT_KEY).catch(() => null);
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(value) ? value : null;
}
