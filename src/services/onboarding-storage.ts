import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "myapp.onboardingComplete";

export async function getOnboardingComplete() {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === "true";
}

export async function setOnboardingComplete(value: boolean) {
  await AsyncStorage.setItem(ONBOARDING_KEY, String(value));
}
