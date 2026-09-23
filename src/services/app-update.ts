import { apiRequest } from "@/api/client";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { isUpdateRequired } from "./app-update-policy";

export { compareVersions, isUpdateRequired } from "./app-update-policy";

export type AppUpdatePolicy = {
  minimumVersion?: string | null;
  minimumBuild?: number | null;
  latestVersion?: string | null;
  latestBuild?: number | null;
  required?: boolean;
  title?: string | null;
  message?: string | null;
  storeUrl: string;
};

let pendingPolicy: AppUpdatePolicy | null = null;

export function getCurrentAppRuntime() {
  const rawBuild = Platform.OS === "ios"
    ? Constants.expoConfig?.ios?.buildNumber
    : Constants.expoConfig?.android?.versionCode;
  return {
    version: Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "0.0.0",
    build: Number.parseInt(String(rawBuild ?? Constants.nativeBuildVersion ?? "0"), 10) || 0,
    platform: Platform.OS,
  };
}

/**
 * Backend-agnostic update check. Configure a normal API path through
 * EXPO_PUBLIC_UPDATE_POLICY_PATH; omit it to disable the feature.
 */
export async function checkAppUpdatePolicy() {
  const path = process.env.EXPO_PUBLIC_UPDATE_POLICY_PATH?.trim();
  if (!path || Platform.OS === "web") return null;
  const runtime = getCurrentAppRuntime();
  const separator = path.includes("?") ? "&" : "?";
  const policy = await apiRequest<AppUpdatePolicy>({
    path: `${path}${separator}platform=${runtime.platform}&version=${encodeURIComponent(runtime.version)}&build=${runtime.build}`,
    timeoutMs: 6000,
  });
  if (!isUpdateRequired(runtime, policy)) return null;
  pendingPolicy = policy;
  return policy;
}

export function getPendingAppUpdatePolicy() {
  return pendingPolicy;
}
