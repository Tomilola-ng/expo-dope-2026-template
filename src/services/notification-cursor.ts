import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_CURSOR_KEY = "myapp.notifications.latestSequence";

export async function getStoredNotificationCursor() {
  const rawValue = await AsyncStorage.getItem(NOTIFICATION_CURSOR_KEY);
  const parsedValue = rawValue ? Number(rawValue) : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export async function saveNotificationCursor(sequence: number) {
  await AsyncStorage.setItem(NOTIFICATION_CURSOR_KEY, String(sequence));
}

export async function clearNotificationCursor() {
  await AsyncStorage.removeItem(NOTIFICATION_CURSOR_KEY);
}
