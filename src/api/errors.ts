import type { ApiFieldErrors } from "@/api/types";

export class ApiError extends Error {
  status: number;
  code: "network" | "config" | "http";
  fieldErrors?: ApiFieldErrors;
  retryAfter?: number;

  constructor(params: {
    message: string;
    status: number;
    code?: "network" | "config" | "http";
    fieldErrors?: ApiFieldErrors;
    retryAfter?: number;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code || "http";
    this.fieldErrors = params.fieldErrors;
    this.retryAfter = params.retryAfter;
  }
}

export function normalizeFieldErrors(raw?: Record<string, string[] | string>) {
  if (!raw) {
    return undefined;
  }

  return Object.entries(raw).reduce<ApiFieldErrors>((accumulator, [key, value]) => {
    accumulator[key] = Array.isArray(value) ? value : [value];
    return accumulator;
  }, {});
}

export function parseRetryAfterHeader(response: Response): number | undefined {
  const header = response.headers.get("Retry-After");

  if (!header) {
    return undefined;
  }

  const seconds = Number(header);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds);
  }

  const retryAt = Date.parse(header);

  if (Number.isFinite(retryAt)) {
    return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  }

  return undefined;
}

export function formatRateLimitMessage(error: ApiError) {
  if (error.status !== 429) {
    return error.message;
  }

  if (typeof error.retryAfter === "number" && error.retryAfter > 0) {
    return `Too many attempts. Please try again in ${error.retryAfter} seconds.`;
  }

  return "Too many attempts. Please try again shortly.";
}
