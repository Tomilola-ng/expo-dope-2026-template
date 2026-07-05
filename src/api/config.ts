class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

const LOCAL_HTTP_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "10.0.2.2",
  "0.0.0.0",
]);

function isPrivateLanHost(hostname: string) {
  if (hostname.endsWith(".local")) {
    return true;
  }

  if (hostname.startsWith("192.168.")) {
    return true;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  const match = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);

  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function allowsInsecureHttpOrigin(hostname: string) {
  if (LOCAL_HTTP_HOSTS.has(hostname)) {
    return true;
  }

  return __DEV__ && isPrivateLanHost(hostname);
}

export function assertSecureApiOrigin(baseUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new ConfigError("EXPO_PUBLIC_API_BASE_URL must be a valid URL.");
  }

  if (parsedUrl.protocol === "https:") {
    return;
  }

  if (parsedUrl.protocol === "http:" && allowsInsecureHttpOrigin(parsedUrl.hostname)) {
    return;
  }

  if (parsedUrl.protocol === "http:" && process.env.EXPO_PUBLIC_ALLOW_INSECURE_HTTP === "true") {
    return;
  }

  throw new ConfigError(
    "EXPO_PUBLIC_API_BASE_URL must use HTTPS in release builds. Use http://localhost or a LAN IP only for local development.",
  );
}

function getRequiredApiBaseUrl() {
  // Expo only inlines EXPO_PUBLIC_* vars for static property access.
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new ConfigError("EXPO_PUBLIC_API_BASE_URL is required. Add it to your local .env file before using the API client.");
  }

  const normalized = value.replace(/\/+$/, "");
  assertSecureApiOrigin(normalized);

  return normalized;
}

function ensureLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getApiConfig() {
  return {
    baseUrl: getRequiredApiBaseUrl(),
    apiPrefix: ensureLeadingSlash(process.env.EXPO_PUBLIC_API_PREFIX?.trim() || "/api/v1"),
    authPaths: {
      register: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_REGISTER_PATH?.trim() || "/auth/register"),
      login: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH?.trim() || "/auth/login"),
      sendOtp: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_SEND_OTP_PATH?.trim() || "/auth/send-otp"),
      verifyOtp: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_VERIFY_OTP_PATH?.trim() || "/auth/verify-otp"),
      me: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_ME_PATH?.trim() || "/auth/me"),
      logout: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_LOGOUT_PATH?.trim() || "/auth/logout"),
      forgotPassword: ensureLeadingSlash(process.env.EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_PATH?.trim() || "/auth/forgot-password"),
    },
    tokenPrefix: (process.env.EXPO_PUBLIC_AUTH_TOKEN_PREFIX?.trim() || "Bearer"),
  } as const;
}

export { ConfigError };
