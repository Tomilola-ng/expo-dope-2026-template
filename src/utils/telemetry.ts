import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getApiConfig } from "@/api/config";

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
