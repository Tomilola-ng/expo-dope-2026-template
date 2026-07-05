import { apiUploadRequest } from "@/api/client";
import type { FileUpload } from "@/api/types";

export type UploadableAsset = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function getFilename(asset: UploadableAsset) {
  if (asset.name?.trim()) {
    return asset.name.trim();
  }

  const pathSegment = asset.uri.split("/").pop();

  return pathSegment?.trim() || `upload-${Date.now()}.jpg`;
}

function getMimeType(asset: UploadableAsset) {
  if (asset.mimeType?.trim()) {
    return asset.mimeType.trim().toLowerCase();
  }

  const filename = getFilename(asset).toLowerCase();

  if (filename.endsWith(".png")) {
    return "image/png";
  }

  if (filename.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

function validateAsset(asset: UploadableAsset) {
  if (typeof asset.fileSize === "number" && asset.fileSize > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Each image must be 10 MiB or smaller.");
  }

  const mimeType = getMimeType(asset);

  if (!ALLOWED_UPLOAD_MIME_TYPES.has(mimeType)) {
    throw new Error("Only JPEG, PNG, and WebP images can be uploaded.");
  }
}

export async function uploadFile(asset: UploadableAsset, folder: "profile" = "profile") {
  validateAsset(asset);

  const formData = new FormData();

  formData.append("folder", folder);
  formData.append("file", {
    uri: asset.uri,
    name: getFilename(asset),
    type: getMimeType(asset),
  } as unknown as Blob);

  return apiUploadRequest<FileUpload>({
    method: "POST",
    path: "/files/upload",
    auth: true,
    body: formData,
  });
}
