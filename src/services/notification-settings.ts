import * as SecureStore from "expo-secure-store";

const DEVICE_TOKEN_KEY = "myapp.notifications.deviceToken";
const PROMPTED_AT_KEY = "myapp.notifications.promptedAt";

export async function getStoredNotificationDeviceToken() {
  return SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
}

export async function saveNotificationDeviceToken(token: string) {
  await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
}

export async function clearStoredNotificationDeviceToken() {
  await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
}

export async function getNotificationPromptedAt() {
  const value = await SecureStore.getItemAsync(PROMPTED_AT_KEY);
  const timestamp = value ? Number(value) : Number.NaN;

  return Number.isFinite(timestamp) ? timestamp : null;
}

export async function markNotificationPromptShown() {
  await SecureStore.setItemAsync(PROMPTED_AT_KEY, String(Date.now()));
}

export async function clearNotificationPromptState() {
  await SecureStore.deleteItemAsync(PROMPTED_AT_KEY);
}
