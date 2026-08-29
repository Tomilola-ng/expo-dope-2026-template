import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

async function runHaptic(action: () => Promise<void>) {
  if (Platform.OS === "web") {
    return;
  }
  try {
    await action();
  } catch {
    // Haptics are best-effort; ignore unsupported devices / simulators.
  }
}

/** Light tap — e.g. selecting a chip or shortcut. */
export function hapticLight() {
  return runHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  );
}

/** Subtle confirmation — e.g. attachment succeeded. */
export function hapticSuccessConfirm() {
  return runHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  );
}

/** Success notification — e.g. submit completed. */
export function hapticSuccess() {
  return runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}
