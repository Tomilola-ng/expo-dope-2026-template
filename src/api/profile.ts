import { apiRequest } from "@/api/client";
import { getPreferredFileUrl } from "@/api/normalize";
import type { UpdateProfilePayload, UserProfile } from "@/api/types";

const PROFILE_ME_PATH = "/profile/me";

export async function getMyProfile(signal?: AbortSignal) {
  const profile = await apiRequest<UserProfile>({
    path: PROFILE_ME_PATH,
    auth: true,
    signal,
  });

  return {
    ...profile,
    avatar_url: getPreferredFileUrl(profile.avatar, profile.avatar_url),
  };
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  return apiRequest<UserProfile>({
    method: "PATCH",
    path: PROFILE_ME_PATH,
    auth: true,
    body: payload,
  });
}
