import { ApiError, normalizeFieldErrors, parseRetryAfterHeader } from "@/api/errors";
import { getApiConfig, ConfigError } from "@/api/config";
import type { ApiEnvelope, RequestOptions, UploadRequestOptions } from "@/api/types";
import { clearTokens, getStoredTokens } from "@/services/secure-storage";

type UnauthorizedHandler = () => Promise<void> | void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

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

  if (json && typeof json === "object" && "detail" in json) {
    if (Array.isArray(json.detail)) {
      detail = json.detail
        .map((item) => (typeof item === "string" ? item : null))
        .filter(Boolean)
        .join(", ");
    } else if (typeof json.detail === "string") {
      detail = json.detail;
    }
  }

  const message =
    response.status === 429
      ? "Too many attempts. Please try again shortly."
      : json?.message || detail || "Something went wrong. Please try again.";

  return new ApiError({
    message,
    status: response.status,
    fieldErrors,
    retryAfter,
  });
}

export async function apiRequest<T>({
  method = "GET",
  path,
  body,
  auth = false,
  headers,
  signal,
}: RequestOptions): Promise<T> {
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
      signal,
    });

    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    const isSuccessfulResponse = response.ok && (typeof json?.success === "boolean" ? json.success : true);

    if (!isSuccessfulResponse) {
      if (auth && response.status === 401) {
        await clearTokens();
        await unauthorizedHandler?.();
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

    throw new ApiError({
      message: "We could not reach the server right now. Please try again.",
      status: 0,
      code: "network",
    });
  }
}

export async function apiUploadRequest<T>({
  method = "POST",
  path,
  body,
  auth = false,
  headers,
  signal,
}: UploadRequestOptions): Promise<T> {
  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: "application/json",
        ...(auth ? await getAuthHeader() : {}),
        ...headers,
      },
      body,
      signal,
    });

    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    const isSuccessfulResponse = response.ok && (typeof json?.success === "boolean" ? json.success : true);

    if (!isSuccessfulResponse) {
      if (response.status === 401) {
        await clearTokens();
        await unauthorizedHandler?.();
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
  }
}
