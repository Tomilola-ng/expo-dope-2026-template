import { updateMyProfile } from "@/api/profile";
import { getPreferredFileUrl } from "@/api/normalize";
import { queryKeys } from "@/api/queryKeys";
import type { UpdateProfilePayload } from "@/api/types";
import { uploadFile } from "@/api/files";
import {
  type ImagePickerValue,
  ImagePickerField,
} from "@/components/forms/ImagePickerField";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { feedbackColors } from "@/constants/colors";
import { useAccountSummary } from "@/hooks/useAccounts";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";
import { pickProfileImage } from "@/utils/media";
import { invalidateAccountSummaryCache } from "@/utils/account-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function EditProfileScreen() {
  const { updateUserProfile, user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useProfile();
  const accountSummaryQuery = useAccountSummary(user?.id);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<ImagePickerValue | null | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const resolvedDisplayName =
    displayName ?? profileQuery.data?.display_name ?? "";
  const resolvedUsername = username ?? profileQuery.data?.username ?? "";
  const resolvedBio = bio ?? profileQuery.data?.bio ?? "";
  const existingAvatarUrl =
    getPreferredFileUrl(
      profileQuery.data?.avatar,
      profileQuery.data?.avatar_url,
    ) ||
    accountSummaryQuery.data?.avatar_url ||
    getPreferredFileUrl(user?.avatar, user?.profile?.avatar_url) ||
    user?.profile?.avatar ||
    null;
  const existingAvatar = existingAvatarUrl
    ? {
        uri: existingAvatarUrl,
        label: "Current avatar",
      }
    : null;
  const resolvedAvatar = avatar === undefined ? existingAvatar : avatar;

  const saveMutation = useMutation({
    mutationFn: async () => {
      let avatarFileId: UpdateProfilePayload["avatar_file_id"];

      if (
        avatar?.uploadState !== "uploaded" &&
        avatar?.uri &&
        !avatar.uri.startsWith("http")
      ) {
        setAvatar((currentAvatar) =>
          currentAvatar
            ? {
                ...currentAvatar,
                uploadState: "uploading",
                error: undefined,
              }
            : currentAvatar,
        );

        const uploadedAvatar = await uploadFile(
          {
            uri: avatar.uri,
            name: avatar.label,
            mimeType: avatar.mimeType,
            fileSize: avatar.fileSize,
          },
          "profile",
        );

        avatarFileId = uploadedAvatar.id;

        setAvatar((currentAvatar) =>
          currentAvatar
            ? {
                ...currentAvatar,
                uploadState: "uploaded",
              }
            : currentAvatar,
        );
      }

      const payload: UpdateProfilePayload = {
        display_name: resolvedDisplayName.trim() || null,
        username: resolvedUsername.trim() || null,
        bio: resolvedBio.trim() || null,
        avatar_file_id: avatarFileId,
      };

      return updateMyProfile(payload);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.me, profile);
      invalidateAccountSummaryCache(queryClient, user?.id);
      updateUserProfile(profile);
      router.back();
    },
  });

  const handlePickAvatar = async () => {
    try {
      const selectedImage = await pickProfileImage();

      if (!selectedImage) {
        return;
      }

      setAvatar({
        uri: selectedImage.uri,
        label: selectedImage.name || "Selected avatar",
        mimeType: selectedImage.mimeType,
        fileSize: selectedImage.fileSize,
        uploadState: "idle",
      });
    } catch (error) {
      Alert.alert(
        "Image selection failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleSave = async () => {
    setFormError(null);

    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not save your profile right now.",
      );
    }
  };

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <LoadingState fullScreen label="Loading your profile editor..." />
      </Screen>
    );
  }

  if (profileQuery.isError) {
    return (
      <Screen>
        <ScreenHeader showBack title="Edit Profile" />
        <ErrorState
          message={profileQuery.error.message}
          onRetry={() => {
            profileQuery.refetch();
          }}
          title="We couldn't load your profile"
        />
      </Screen>
    );
  }

  return (
    <Screen keyboardAware scroll contentClassName="gap-5 py-4">
      <ScreenHeader
        showBack
        title="Edit Profile"
        subtitle="Keep the basics warm, simple, and recognizable."
      />

      <View className="gap-5">
        <ImagePickerField
          emptyLabel="Tap to add a profile photo"
          onPress={handlePickAvatar}
          previewShape="circle"
          selectionOverlay="pencil"
          value={resolvedAvatar}
          variant="tapArea"
        />

        <AppInput
          autoCapitalize="words"
          helperText="Optional"
          label="Display name"
          onChangeText={(value) => setDisplayName(value)}
          value={resolvedDisplayName}
        />

        <AppInput
          autoCapitalize="none"
          label="Username"
          onChangeText={(value) => setUsername(value)}
          placeholder="yourname"
          value={resolvedUsername}
        />

        <AppInput
          helperText="Optional"
          label="Bio"
          multiline
          numberOfLines={4}
          onChangeText={(value) => setBio(value)}
          placeholder="A short bio about you."
          style={{ minHeight: 120, textAlignVertical: "top" }}
          value={resolvedBio}
        />

        {formError ? (
          <AppText color="secondary" style={{ color: feedbackColors.error }}>
            {formError}
          </AppText>
        ) : null}

        <View className="gap-3">
          <AppButton
            label="Save profile"
            loading={saveMutation.isPending}
            onPress={handleSave}
          />
          <AppButton
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>
      </View>
    </Screen>
  );
}
