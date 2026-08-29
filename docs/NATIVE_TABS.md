# Native tabs

The template defaults to Expo Router **native tabs** (`expo-router/unstable-native-tabs`) in `app/(protected)/(tabs)/_layout.tsx`.

## Why

- iOS gets the system tab bar (liquid glass on iOS 26+ builds compiled with Xcode 26+).
- Android gets native Material tabs with brand indicator + contrasting selected icons.
- No third-party tab bar packages.

## Limitations

- The API is experimental (`unstable-` prefix) and may churn across SDKs.
- Glass appearance will **not** show in older Expo Go builds — use a native build.
- Android customization is more limited than JS tabs.

## Revert

Use `prompts/05-ios-glass-native-tabs.md` (revert section) to restore JavaScript `<Tabs>` + `BottomTabIcon`.

## Glass chrome elsewhere

`expo-glass-effect` powers optional UI chrome (`GlassSurface`, `GlassCard`, `SearchFilterBar`, `SegmentedControl`). It falls back to clean white when liquid glass is unavailable — do not use brand-tinted translucent fills as the fallback.
