import { brandColors, surfaceColors, textColors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { reportUnexpectedFailure } from "@/utils/telemetry";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Last-resort render boundary with a recovery action and telemetry hook. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportUnexpectedFailure("ui.render_crash", error, {
      flow: "error_boundary",
      metadata: { componentStack: info.componentStack?.slice(0, 1500) },
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 28, backgroundColor: surfaceColors.background }}>
        <Text style={{ fontFamily: typography.fontFamilies.bodyBold, fontSize: 28, color: textColors.primary, textAlign: "center" }}>
          Something went wrong
        </Text>
        <Text style={{ fontFamily: typography.fontFamilies.body, fontSize: 14, lineHeight: 20, color: textColors.secondary, textAlign: "center" }}>
          The issue was recorded. Try again to continue.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ hasError: false })}
          style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, backgroundColor: brandColors.primary }}
        >
          <Text style={{ fontFamily: typography.fontFamilies.bodyBold, color: surfaceColors.background, fontSize: 15 }}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }
}
