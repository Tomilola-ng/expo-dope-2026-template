import { deleteNotificationDeviceToken } from "@/api/notifications";
import {
  clearStoredNotificationDeviceToken,
  getStoredNotificationDeviceToken,
} from "@/services/notification-settings";

export async function unregisterPushDeviceToken() {
  const storedToken = await getStoredNotificationDeviceToken();

  if (storedToken) {
    try {
      await deleteNotificationDeviceToken(storedToken);
    } catch {
      // Local cleanup still completes when server unregister fails.
    }
  }

  await clearStoredNotificationDeviceToken();
}
