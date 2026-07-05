import { EmptyState } from "@/components/states/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showBack?: boolean;
};

export function FeaturePlaceholder({
  title,
  description,
  actionLabel,
  onAction,
  showBack = false,
}: FeaturePlaceholderProps) {
  return (
    <Screen>
      <ScreenHeader showBack={showBack} title={title} />
      <EmptyState
        actionLabel={actionLabel}
        description={description}
        onAction={onAction}
        title={title}
      />
    </Screen>
  );
}
