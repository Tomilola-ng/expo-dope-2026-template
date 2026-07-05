import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";

export function useAppFonts() {
  return useFonts({
    NunitoSans: NunitoSans_400Regular,
    NunitoSansMedium: NunitoSans_500Medium,
    NunitoSansSemiBold: NunitoSans_600SemiBold,
    NunitoSansBold: NunitoSans_700Bold,
  });
}
