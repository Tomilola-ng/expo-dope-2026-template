import { apiRequest } from "@/api/client";
import { getPreferredFileUrl } from "@/api/normalize";
import type { FileUpload, PublicAccountSummary } from "@/api/types";

type BackendPublicAccount = {
  id: string;
  display_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar?: FileUpload | string | null;
  avatar_url?: string | null;
};

type BackendAccountSummary = {
  account?: BackendPublicAccount | null;
  id?: string;
  display_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar?: FileUpload | string | null;
  avatar_url?: string | null;
  is_me?: boolean | null;
};

function normalizeAvatar(
  account: BackendPublicAccount | BackendAccountSummary,
) {
  return getPreferredFileUrl(account.avatar, account.avatar_url);
}

function normalizeAccountSummary(summary: BackendAccountSummary): PublicAccountSummary {
  const account = summary.account ?? summary;

  return {
    id: String(account.id ?? summary.id ?? ""),
    display_name:
      account.display_name?.trim() || account.full_name?.trim() || "User",
    username: account.username ?? null,
    bio: account.bio ?? null,
    avatar_url: normalizeAvatar(account),
    is_me: summary.is_me === true,
  };
}

export async function getAccountSummary(accountId: string, signal?: AbortSignal) {
  const response = await apiRequest<BackendAccountSummary>({
    path: `/accounts/${accountId}/summary`,
    auth: true,
    signal,
  });

  return normalizeAccountSummary(response);
}
