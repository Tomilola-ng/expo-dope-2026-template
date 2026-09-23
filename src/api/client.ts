import { ApiError, normalizeFieldErrors, parseRetryAfterHeader } from "@/api/errors";
import { getApiConfig, ConfigError } from "@/api/config";
import type { ApiEnvelope, RequestOptions, UploadRequestOptions } from "@/api/types";
import { clearTokens, getStoredTokens, saveTokens } from "@/services/secure-storage";

type UnauthorizedHandler = () => Promise<void> | void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const DEFAULT_TIMEOUT_MS = 12_000;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

function buildUrl(path: string) {
  const apiConfig = getApiConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const resolvedPath =
    normalizedPath === apiConfig.apiPrefix || normalizedPath.startsWith(`${apiConfig.apiPrefix}/`)
    ? normalizedPath
    : `${apiConfig.apiPrefix}${normalizedPath}`;

  return `${apiConfig.baseUrl}${resolvedPath}`;
}

export function buildApiUrl(path: string) {
  return buildUrl(path);
}

async function getAuthHeader() {
  const apiConfig = getApiConfig();
  const { accessToken } = await getStoredTokens();

  if (!accessToken) {
    return {} as Record<string, string>;
  }

  return {
    Authorization: `${apiConfig.tokenPrefix} ${accessToken}`,
  };
}

export async function getAuthorizationHeaders() {
  return getAuthHeader();
}

function resolveApiError<T>(response: Response, json: ApiEnvelope<T> | null) {
  const fieldErrors = normalizeFieldErrors(json?.errors);
  const retryAfter = parseRetryAfterHeader(response);
  let detail: string | undefined;
  let apiCode: string | undefined;

  if (json && typeof json === "object" && "detail" in json) {
    const rawDetail = json.detail;
    if (Array.isArray(rawDetail)) {
      detail = rawDetail
        .map((item) => (typeof item === "string" ? item : null))
        .filter(Boolean)
        .join(", ");
    } else if (typeof rawDetail === "string") {
      detail = rawDetail;
    } else if (rawDetail && typeof rawDetail === "object") {
      detail = rawDetail.message;
      apiCode = rawDetail.code;
    }
  }

  apiCode ||= typeof json?.code === "string" ? json.code : undefined;

  const message =
    response.status === 429
      ? "Too many attempts. Please try again shortly."
      : json?.message || detail || "Something went wrong. Please try again.";

  return new ApiError({
    message,
    status: response.status,
    fieldErrors,
    retryAfter,
    apiCode,
  });
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const { refreshToken } = await getStoredTokens();
      if (!refreshToken) return false;

      const { authPaths } = getApiConfig();
      const response = await fetch(buildUrl(authPaths.refresh), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const json = (await response.json().catch(() => null)) as ApiEnvelope<{
        access?: string;
        access_token?: string;
        refresh?: string | null;
        refresh_token?: string | null;
      }> | null;
      if (!response.ok) return false;

      const data = (json?.data ?? json) as {
        access?: string;
        access_token?: string;
        refresh?: string | null;
        refresh_token?: string | null;
      } | null;
      const accessToken = data?.access ?? data?.access_token;
      if (!accessToken) return false;
      await saveTokens(
        accessToken,
        data?.refresh ?? data?.refresh_token ?? refreshToken,
      );
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function handleUnauthorized(path: string, retried: boolean) {
  const { authPaths } = getApiConfig();
  if (path === authPaths.refresh || path.endsWith(authPaths.refresh)) {
    await clearTokens();
    await unauthorizedHandler?.();
    return false;
  }
  if (!retried && (await refreshAccessToken())) return true;
  await clearTokens();
  await unauthorizedHandler?.();
  return false;
}

export async function apiRequest<T>({
  method = "GET",
  path,
  body,
  auth = false,
  headers,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  _retriedAfterRefresh = false,
}: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const apiConfig = getApiConfig();
    const url = buildUrl(path);

    if (__DEV__) {
      console.log("[DEBUG] API request config", {
        auth,
        baseUrl: apiConfig.baseUrl,
        hasBody: Boolean(body),
        method,
        path,
        url,
      });
    }

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? await getAuthHeader() : {}),
        ...headers,
      } as Record<string, string>,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    const isSuccessfulResponse = response.ok && (typeof json?.success === "boolean" ? json.success : true);

    if (!isSuccessfulResponse) {
      if (auth && response.status === 401) {
        const shouldRetry = await handleUnauthorized(path, _retriedAfterRefresh);
        if (shouldRetry) {
          return apiRequest<T>({
            method, path, body, auth, headers, signal, timeoutMs,
            _retriedAfterRefresh: true,
          });
        }
      }

      throw resolveApiError(response, json);
    }

    return (json?.data ?? json) as T;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw new ApiError({
        message: error.message,
        status: 0,
        code: "config",
      });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (__DEV__) {
      console.warn("API network error", {
        auth,
        baseUrl: getApiConfig().baseUrl,
        error,
        method,
        path,
        url: buildUrl(path),
      });
    }

    const timedOut = error instanceof Error && error.name === "AbortError";
    throw new ApiError({
      message: timedOut
        ? "The request timed out. Please try again."
        : "We could not reach the server right now. Please try again.",
      status: 0,
      code: "network",
    });
  } finally {
    if (timeout) clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function apiUploadRequest<T>({
  method = "POST",
  path,
  body,
  auth = false,
  headers,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  _retriedAfterRefresh = false,
}: UploadRequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: "application/json",
        ...(auth ? await getAuthHeader() : {}),
        ...headers,
      },
      body,
      signal: controller.signal,
    });

    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    const isSuccessfulResponse = response.ok && (typeof json?.success === "boolean" ? json.success : true);

    if (!isSuccessfulResponse) {
      if (auth && response.status === 401) {
        const shouldRetry = await handleUnauthorized(path, _retriedAfterRefresh);
        if (shouldRetry) {
          return apiUploadRequest<T>({
            method, path, body, auth, headers, signal, timeoutMs,
            _retriedAfterRefresh: true,
          });
        }
      }

      throw resolveApiError(response, json);
    }

    return (json?.data ?? json) as T;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw new ApiError({
        message: error.message,
        status: 0,
        code: "config",
      });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (__DEV__) {
      console.error("API upload error", error);
    }

    throw new ApiError({
      message: "We could not upload your file right now. Please try again.",
      status: 0,
      code: "network",
    });
  } finally {
    if (timeout) clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
