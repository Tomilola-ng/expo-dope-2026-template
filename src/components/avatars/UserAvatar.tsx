import { AppText } from "@/components/ui/AppText";
import { borderColors } from "@/constants/colors";
import { accountProfileHref } from "@/utils/routes";
import { Image } from "expo-image";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

type UserAvatarProps = {
  uri?: string | null;
  displayName: string;
  accountId?: string;
  linkable?: boolean;
  size?: number;
  badge?: ReactNode;
};

export function UserAvatar({
  uri,
  displayName,
  accountId,
  linkable = true,
  size = 44,
  badge,
}: UserAvatarProps) {
  const initials = displayName
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const content = (
    <View>
      {uri ? (
        <Image
          accessibilityLabel={`${displayName} avatar`}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          className="items-center justify-center rounded-full bg-surface-card"
          style={{
            width: size,
            height: size,
            borderWidth: 1,
            borderColor: borderColors.default,
          }}
        >
          <AppText variant="caption">{initials || "U"}</AppText>
        </View>
      )}
      {badge ? (
        <View className="absolute -bottom-1 -right-1">{badge}</View>
      ) : null}
    </View>
  );

  if (!accountId || !linkable) {
    return content;
  }

  return (
    <Link href={accountProfileHref(accountId)} asChild>
      <Pressable
        accessibilityLabel={`Open ${displayName}'s profile`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
        }}
      >
        {content}
      </Pressable>
    </Link>
  );
}
