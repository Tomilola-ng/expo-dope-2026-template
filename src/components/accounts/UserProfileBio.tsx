import { AppText } from "@/components/ui/AppText";
import { Pressable, View } from "react-native";

type UserProfileBioProps = {
  bio?: string | null;
  isCurrentUser: boolean;
  onAddBio?: () => void;
};

export function UserProfileBio({
  bio,
  isCurrentUser,
  onAddBio,
}: UserProfileBioProps) {
  const trimmedBio = bio?.trim();

  if (trimmedBio) {
    return (
      <AppText align="center" className="leading-6" variant="body">
        {trimmedBio}
      </AppText>
    );
  }

  if (isCurrentUser) {
    return (
      <View className="items-center gap-3 rounded-2xl bg-surface-accent px-4 py-4">
        <AppText align="center" color="secondary" variant="bodySmall">
          Add a short bio so others can learn more about you.
        </AppText>
        {onAddBio ? (
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-brand-primary px-4 py-2"
            hitSlop={8}
            onPress={onAddBio}
          >
            <AppText color="inverse" variant="caption">
              Add bio
            </AppText>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <AppText align="center" color="secondary" className="leading-6" variant="body">
      No bio yet.
    </AppText>
  );
}
