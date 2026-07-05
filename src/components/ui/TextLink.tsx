import { AppText } from "@/components/ui/AppText";
import { cn } from "@/utils/cn";
import { Link, type Href } from "expo-router";
import { Pressable, type PressableProps } from "react-native";

type TextLinkProps = Omit<PressableProps, "children"> & {
  label: string;
  href?: Href;
  align?: "left" | "center" | "right";
  className?: string;
};

export function TextLink({
  label,
  href,
  align = "center",
  className,
  disabled,
  onPress,
  ...props
}: TextLinkProps) {
  const pressable = (
    <Pressable
      accessibilityRole="link"
      className={cn(
        "py-1",
        align === "center" && "items-center",
        align === "right" && "items-end",
        align === "left" && "items-start",
        className,
      )}
      disabled={disabled}
      onPress={href ? undefined : onPress}
      {...props}
    >
      <AppText
        align={align}
        color="brand"
        variant="bodySmall"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {label}
      </AppText>
    </Pressable>
  );

  if (href) {
    return (
      <Link asChild href={href}>
        {pressable}
      </Link>
    );
  }

  return pressable;
}
