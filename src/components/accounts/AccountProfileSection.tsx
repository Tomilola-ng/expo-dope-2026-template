import { UserAvatar } from "@/components/avatars/UserAvatar";
import { UserProfileBio } from "@/components/accounts/UserProfileBio";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import type { PublicAccountSummary } from "@/api/types";
import { View } from "react-native";

const panelShadow = {
  shadowColor: "#111111",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 6,
};

type AccountProfileSectionProps = {
  account: Pick<
    PublicAccountSummary,
    "id" | "display_name" | "username" | "bio" | "avatar_url"
  >;
  isCurrentUser?: boolean;
  onEditProfile?: () => void;
};

export function AccountProfileSection({
  account,
  isCurrentUser = false,
  onEditProfile,
}: AccountProfileSectionProps) {
  return (
    <View
      className="items-center gap-4 rounded-3xl bg-surface-card px-5 py-6"
      style={panelShadow}
    >
      <UserAvatar
        accountId={account.id}
        displayName={account.display_name}
        linkable={!isCurrentUser}
        size={96}
        uri={account.avatar_url}
      />

      <View className="items-center gap-1">
        <AppText align="center" variant="h2">
          {account.display_name}
        </AppText>
        {account.username ? (
          <AppText align="center" color="secondary" variant="bodySmall">
            @{account.username}
          </AppText>
        ) : null}
      </View>

      <UserProfileBio
        bio={account.bio}
        isCurrentUser={isCurrentUser}
        onAddBio={onEditProfile}
      />

      {isCurrentUser && onEditProfile ? (
        <AppButton
          className="mt-1"
          label="Edit profile"
          onPress={onEditProfile}
          variant="secondary"
        />
      ) : null}
    </View>
  );
}
