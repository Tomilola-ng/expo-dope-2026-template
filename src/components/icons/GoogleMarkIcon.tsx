import { Image } from "expo-image";

type GoogleMarkIconProps = {
  size?: number;
};

/**
 * Multicolor Google “G” mark for Sign in with Google.
 * Rasterized from the source SVG — RN SvgXml cannot reliably render its
 * clipPath + xlink gradient references.
 */
export function GoogleMarkIcon({ size = 22 }: GoogleMarkIconProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={require("../../../assets/icons/google-g.png")}
      style={{ width: size, height: size }}
    />
  );
}
