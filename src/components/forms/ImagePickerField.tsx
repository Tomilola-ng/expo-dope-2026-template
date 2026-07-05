import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { brandColors, feedbackColors, surfaceColors } from "@/constants/colors";
import { cn } from "@/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, ScrollView, View } from "react-native";

export type ImagePickerValue = {
  uri: string;
  label?: string;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadState?: "idle" | "uploading" | "uploaded" | "error";
  error?: string;
};

type ImagePickerFieldProps = {
  value?: ImagePickerValue | ImagePickerValue[] | null;
  error?: string;
  disabled?: boolean;
  helperText?: string;
  multiple?: boolean;
  maxItems?: number;
  variant?: "default" | "tapArea";
  previewShape?: "rounded" | "circle";
  previewAspect?: "landscape" | "square";
  emptyLabel?: string;
  onPress?: () => void;
  onRemove?: (index?: number) => void;
  selectionOverlay?: "remove" | "pencil";
};

const CIRCLE_PREVIEW_SIZE = 140;

export function ImagePickerField({
  value,
  error,
  disabled = false,
  helperText,
  multiple = false,
  maxItems,
  variant = "default",
  previewShape = "rounded",
  previewAspect = "landscape",
  emptyLabel,
  onPress,
  onRemove,
  selectionOverlay,
}: ImagePickerFieldProps) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  const hasSelection = items.length > 0;
  const canAddMore = multiple
    ? !maxItems || items.length < maxItems
    : items.length === 0;
  const isTapArea = variant === "tapArea";
  const isCircle = previewShape === "circle";
  const isHorizontalGallery = isTapArea && multiple && !isCircle;
  const previewRadius = isCircle ? CIRCLE_PREVIEW_SIZE / 2 : 20;
  const previewRatio = isCircle ? 1 : previewAspect === "square" ? 1 : 16 / 10;
  const defaultEmptyLabel = isCircle
    ? "Tap to add a profile photo"
    : multiple
      ? "Tap to add photos"
      : "Tap to add a photo";
  const galleryTileClassName = "w-40 shrink-0";
  const resolvedSelectionOverlay =
    selectionOverlay ?? (onRemove ? "remove" : undefined);
  const showUploadStatus = (state?: ImagePickerValue["uploadState"]) =>
    state === "uploading" || state === "error";

  const getUploadLabel = (item: ImagePickerValue, index: number) => {
    if (item.uploadState === "uploading") {
      return "Uploading image...";
    }

    if (item.uploadState === "uploaded") {
      return "Uploaded";
    }

    if (item.uploadState === "error") {
      return "Upload failed";
    }

    return item.label || `Image ${index + 1}`;
  };

  const previewCard = hasSelection ? (
    items.map((item, index) => {
      if (isTapArea) {
        return (
          <View
            key={`${item.uri}-${index}`}
            className={cn(
              "gap-2",
              isCircle
                ? "items-center self-center"
                : isHorizontalGallery
                  ? galleryTileClassName
                  : multiple
                    ? "w-[48.5%]"
                    : "w-full",
            )}
          >
            <View
              className={cn(isCircle && "self-center")}
              style={
                isCircle
                  ? {
                      width: CIRCLE_PREVIEW_SIZE,
                      height: CIRCLE_PREVIEW_SIZE,
                      borderRadius: CIRCLE_PREVIEW_SIZE / 2,
                      overflow: "hidden",
                    }
                  : undefined
              }
            >
              <Pressable
                accessibilityLabel={
                  resolvedSelectionOverlay === "pencil"
                    ? "Change profile photo"
                    : item.label || "Selected image preview"
                }
                accessibilityRole="button"
                disabled={disabled || !onPress}
                onPress={onPress}
                style={{
                  width: isCircle ? "100%" : "100%",
                  height: isCircle ? "100%" : undefined,
                  aspectRatio: isCircle ? undefined : previewRatio,
                }}
              >
                <Image
                  accessibilityLabel={item.label || "Selected image preview"}
                  cachePolicy="memory"
                  contentFit="cover"
                  source={{ uri: item.uri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: isCircle ? 0 : previewRadius,
                    backgroundColor: surfaceColors.accent,
                  }}
                />
                {resolvedSelectionOverlay === "pencil" ? (
                  <View
                    className="absolute inset-0 items-center justify-center"
                    pointerEvents="none"
                    style={{ backgroundColor: "rgba(43, 33, 24, 0.24)" }}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(43, 33, 24, 0.72)" }}
                    >
                      <Ionicons color="#FFF8F1" name="pencil" size={18} />
                    </View>
                  </View>
                ) : resolvedSelectionOverlay === "remove" && onRemove ? (
                  <Pressable
                    accessibilityLabel="Remove selected image"
                    accessibilityRole="button"
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full"
                    disabled={disabled}
                    hitSlop={8}
                    onPress={(event) => {
                      event.stopPropagation();
                      onRemove(index);
                    }}
                    style={{ backgroundColor: "rgba(43, 33, 24, 0.72)" }}
                  >
                    <Ionicons color="#FFF8F1" name="close" size={16} />
                  </Pressable>
                ) : null}
              </Pressable>
            </View>
            {showUploadStatus(item.uploadState) ? (
              <AppText
                align={isCircle ? "center" : "left"}
                color="secondary"
                variant="caption"
              >
                {getUploadLabel(item, index)}
              </AppText>
            ) : null}
            {item.error ? (
              <AppText
                align={isCircle ? "center" : "left"}
                style={{ color: feedbackColors.error }}
                variant="caption"
              >
                {item.error}
              </AppText>
            ) : null}
          </View>
        );
      }

      return (
        <View key={`${item.uri}-${index}`} className="gap-2">
          <Image
            accessibilityLabel={item.label || "Selected image preview"}
            cachePolicy="memory"
            contentFit="cover"
            source={{ uri: item.uri }}
            style={{
              width: "100%",
              aspectRatio: previewRatio,
              borderRadius: previewRadius,
              backgroundColor: surfaceColors.accent,
            }}
          />
          <View className="flex-row items-center justify-between">
            <AppText color="secondary" variant="caption">
              {getUploadLabel(item, index)}
            </AppText>
            {onRemove ? (
              <AppButton
                disabled={disabled}
                fullWidth={false}
                label="Remove"
                onPress={() => onRemove(index)}
                variant="ghost"
              />
            ) : null}
          </View>
          {item.error ? (
            <AppText style={{ color: feedbackColors.error }} variant="caption">
              {item.error}
            </AppText>
          ) : null}
        </View>
      );
    })
  ) : (
    <>
      <Ionicons color={brandColors.primary} name="camera" size={28} />
      {isTapArea ? (
        <AppText align="center" variant="bodySmall">
          {emptyLabel || defaultEmptyLabel}
        </AppText>
      ) : (
        <>
          <AppText className="mt-3" variant="label">
            Add a photo
          </AppText>
          <AppText align="center" color="secondary" variant="bodySmall">
            Pick from your device, preview it here, and upload it when you save.
          </AppText>
        </>
      )}
    </>
  );

  const addAnotherTile =
    isTapArea && hasSelection && canAddMore && !isCircle ? (
      <Pressable
        accessibilityLabel="Add another image"
        accessibilityRole="button"
        className={cn(
          "items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-accent px-4 py-4",
          isHorizontalGallery ? galleryTileClassName : "w-[48.5%]",
        )}
        disabled={disabled || !onPress}
        onPress={onPress}
        style={{ aspectRatio: previewRatio }}
      >
        <Ionicons color={brandColors.primary} name="add" size={26} />
        <AppText align="center" variant="bodySmall">
          Add another
        </AppText>
      </Pressable>
    ) : null;

  const emptyContainerClass = cn(
    "items-center justify-center gap-3 border border-dashed border-border-strong bg-surface-card p-4",
    isCircle
      ? "self-center overflow-hidden"
      : "min-h-[180px] rounded-xl",
  );

  const emptyContainerStyle = isCircle
    ? {
        width: CIRCLE_PREVIEW_SIZE,
        height: CIRCLE_PREVIEW_SIZE,
        borderRadius: CIRCLE_PREVIEW_SIZE / 2,
      }
    : undefined;

  const selectedContainerClass = cn(
    isCircle && isTapArea
      ? "items-center"
      : "border border-dashed border-border-strong bg-surface-card p-4",
    isHorizontalGallery
      ? "gap-3 rounded-xl"
      : isTapArea && !isCircle
        ? "flex-row flex-wrap gap-3 rounded-xl"
        : !isCircle
          ? "gap-2 rounded-xl"
          : undefined,
  );

  return (
    <View className="gap-3">
      {isTapArea && !hasSelection ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled || !onPress}
          onPress={onPress}
        >
          <View className={emptyContainerClass} style={emptyContainerStyle}>
            {previewCard}
          </View>
        </Pressable>
      ) : (
        <View className={selectedContainerClass}>
          {isHorizontalGallery ? (
            <ScrollView
              horizontal
              contentContainerClassName="gap-3 pr-1"
              showsHorizontalScrollIndicator={false}
            >
              {addAnotherTile}
              {previewCard}
            </ScrollView>
          ) : (
            <>
              {previewCard}
              {addAnotherTile}
            </>
          )}
        </View>
      )}

      {!isTapArea ? (
        <View className="flex-row gap-3">
          <AppButton
            disabled={disabled || !onPress}
            fullWidth={false}
            label={
              multiple
                ? hasSelection
                  ? canAddMore
                    ? "Add image"
                    : "Replace images"
                  : "Choose images"
                : hasSelection
                  ? "Replace image"
                  : "Choose image"
            }
            onPress={onPress}
            variant="secondary"
          />
          {!multiple && hasSelection && onRemove ? (
            <AppButton
              disabled={disabled}
              fullWidth={false}
              label="Remove"
              onPress={() => onRemove()}
              variant="ghost"
            />
          ) : null}
        </View>
      ) : null}

      {error ? (
        <AppText style={{ color: feedbackColors.error }} variant="caption">
          {error}
        </AppText>
      ) : !isTapArea && helperText ? (
        <AppText color="secondary" variant="caption">
          {helperText}
        </AppText>
      ) : isTapArea && helperText && !hasSelection ? (
        <AppText align="center" color="secondary" variant="caption">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
