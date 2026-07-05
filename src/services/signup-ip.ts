const DEFAULT_SIGNUP_IP_LOOKUP_URL = "https://api.ipify.org?format=json";
const DEFAULT_SIGNUP_IP_LOOKUP_TIMEOUT_MS = 1500;

type PublicIpLookupResponse = {
  ip?: string;
};

function getSignupIpLookupUrl() {
  return process.env.EXPO_PUBLIC_SIGNUP_IP_LOOKUP_URL?.trim() || DEFAULT_SIGNUP_IP_LOOKUP_URL;
}

function getSignupIpLookupTimeoutMs() {
  const value = Number(process.env.EXPO_PUBLIC_SIGNUP_IP_LOOKUP_TIMEOUT_MS?.trim());

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return DEFAULT_SIGNUP_IP_LOOKUP_TIMEOUT_MS;
}

function isLikelyIpAddress(value: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) || /^[a-fA-F0-9:]+$/.test(value);
}

function normalizeLookupResponse(value: unknown) {
  if (typeof value === "string") {
    const ipAddress = value.trim();
    return isLikelyIpAddress(ipAddress) ? ipAddress : undefined;
  }

  if (value && typeof value === "object" && "ip" in value && typeof value.ip === "string") {
    const ipAddress = value.ip.trim();
    return isLikelyIpAddress(ipAddress) ? ipAddress : undefined;
  }

  return undefined;
}

export async function getSignupIpAddress() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getSignupIpLookupTimeoutMs());

  try {
    const response = await fetch(getSignupIpLookupUrl(), {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") || "";

    if (/json/i.test(contentType)) {
      return normalizeLookupResponse((await response.json().catch(() => null)) as PublicIpLookupResponse | null);
    }

    return normalizeLookupResponse(await response.text().catch(() => ""));
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}
