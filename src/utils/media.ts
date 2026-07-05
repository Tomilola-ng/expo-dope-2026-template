import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type SelectedImageAsset = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

const maxImageUploadBytes = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function normalizeMimeType(asset: ImagePicker.ImagePickerAsset) {
  if (asset.mimeType?.trim()) {
    return asset.mimeType.trim().toLowerCase();
  }

  const filename = asset.fileName?.trim().toLowerCase() || asset.uri.toLowerCase();

  if (filename.endsWith(".png")) {
    return "image/png";
  }

  if (filename.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

function validateAsset(asset: ImagePicker.ImagePickerAsset) {
  if (typeof asset.fileSize === "number" && asset.fileSize > maxImageUploadBytes) {
    throw new Error("Each image must be 10 MiB or smaller.");
  }

  const mimeType = normalizeMimeType(asset);

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Only JPEG, PNG, and WebP images can be selected.");
  }
}

function mapAssets(assets: ImagePicker.ImagePickerAsset[]) {
  assets.forEach(validateAsset);

  return assets.map<SelectedImageAsset>((asset) => ({
    uri: asset.uri,
    name: asset.fileName,
    mimeType: normalizeMimeType(asset),
    fileSize: asset.fileSize,
  }));
}

const imagePickerOptions = {
  mediaTypes: ["images"] as ImagePicker.MediaType[],
  quality: 0.9,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
} as const;

export async function requestMediaLibraryPermission() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Photo library access is required to pick images.");
  }
}

export async function requestCameraPermission() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Camera access is required to take photos.");
  }
}

export async function pickImages(options?: { multiple?: boolean; maxItems?: number }) {
  await requestMediaLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    ...imagePickerOptions,
    allowsEditing: !(options?.multiple ?? false),
    allowsMultipleSelection: options?.multiple ?? false,
    aspect: options?.multiple ? undefined : [1, 1],
    selectionLimit: options?.maxItems,
  });

  if (result.canceled) {
    return [];
  }

  return mapAssets(result.assets);
}

export async function takePhoto() {
  await requestCameraPermission();

  const result = await ImagePicker.launchCameraAsync({
    ...imagePickerOptions,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) {
    return [];
  }

  return mapAssets(result.assets);
}

export function pickProfileImage(): Promise<SelectedImageAsset | null> {
  return new Promise((resolve, reject) => {
    Alert.alert("Add photo", "Choose a source", [
      {
        text: "Take photo",
        onPress: () => {
          void takePhoto()
            .then((assets) => resolve(assets[0] ?? null))
            .catch(reject);
        },
      },
      {
        text: "Choose from library",
        onPress: () => {
          void pickImages({ maxItems: 1 })
            .then((assets) => resolve(assets[0] ?? null))
            .catch(reject);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => resolve(null),
      },
    ]);
  });
}
