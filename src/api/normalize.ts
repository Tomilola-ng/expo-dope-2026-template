import type { FileUpload } from "@/api/types";

type FileLike = FileUpload | string | null | undefined;

export function sanitizeRemoteUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^`+|`+$/g, "");
}

export function getFileUrl(file?: FileLike) {
  if (typeof file === "string") {
    return sanitizeRemoteUrl(file);
  }

  if (file && typeof file === "object") {
    return sanitizeRemoteUrl(file.url ?? null);
  }

  return null;
}

export function getPreferredFileUrl(primary?: FileLike, fallback?: FileLike) {
  return getFileUrl(primary) ?? getFileUrl(fallback);
}
