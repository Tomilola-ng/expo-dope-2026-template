# Prompt 05 — iOS glass native tabs

Use to enable **or remove** Expo's experimental iOS liquid-glass native tabs. Uses `expo-router/unstable-native-tabs` only — no third-party tab bar packages.

---

## Enable native tabs (iOS glass)

```
You are working in the Expo Dope 2026 mobile template (Expo SDK 54+, Expo Router 6).

Goal: replace the JavaScript tab bar with Expo Router native tabs so iOS gets the system liquid-glass tab bar (on iOS 26+ builds compiled with Xcode 26).

## Important constraints
- Use ONLY `expo-router/unstable-native-tabs` — do NOT add react-native-bottom-tabs, custom blur tab libraries, or duplicate tab navigators.
- The API is experimental (`unstable-` prefix). Expect churn on future SDKs.
- Liquid glass appearance requires a dev/production build compiled with Xcode 26 on iOS 26+ — it will NOT look like glass in older Expo Go builds.
- Android uses native system tabs too but with different limitations (e.g. tab count limits, fewer customization options).
- Do not nest JavaScript `<Tabs>` and `<NativeTabs>` in the same router tree.

## Current tabs to migrate
File: `app/(protected)/(tabs)/_layout.tsx`
- Tab `index` → title "Home"
- Tab `profile` → title "Account"
- Icons today: `BottomTabIcon` with Ionicons-style names `home` and `profile`

## Implementation (SDK 54 API)
1. Replace `import { Tabs } from "expo-router"` with imports from `expo-router/unstable-native-tabs`:
   `NativeTabs`, `Icon`, `Label` (SDK 54 uses standalone `Icon`/`Label`, not compound `NativeTabs.Trigger.Icon`).
2. Structure:
```tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Account</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```
3. Use SF Symbols on iOS (`sf` prop). For Android, follow Expo docs for the SDK version in package.json (vector icons or material symbols as documented).
4. Remove now-unused `BottomTabIcon` import from the layout if nothing else uses it.
5. Tint colors: prefer platform-aware colors (`PlatformColor`, `DynamicColorIOS`) over hard-coded hex if docs recommend it for native tabs.
6. Optional iOS 26 features from docs: `minimizeBehavior="onScrollDown"` on scrollable tab screens — only if compatible with current screens.

## QA checklist
- [ ] Both tabs navigate correctly on iOS and Android
- [ ] Protected auth guard still works (`app/(protected)/_layout.tsx`)
- [ ] Tab bar visible on Home and Account screens
- [ ] `npm run typecheck` and `npm run lint` pass
- [ ] Note in a comment or `docs/NATIVE_TABS.md` that liquid glass requires Xcode 26 build

## Do not
- Add expo-glass-effect for the tab bar (native tabs already use UITabBarController)
- Change screen file names or routes
- Break existing deep links
```

---

## Revert to JavaScript tabs

Use this if native tabs are too experimental for your team or you need identical custom styling on iOS and Android.

```
You are working in the Expo Dope 2026 mobile template.

Goal: remove native tabs and restore the standard Expo Router JavaScript `<Tabs>` layout.

## Tasks
1. Open `app/(protected)/(tabs)/_layout.tsx`.
2. Remove all imports from `expo-router/unstable-native-tabs`.
3. Restore the JavaScript tabs layout using `import { Tabs } from "expo-router"` with:
   - `index` tab: title "Home", `BottomTabIcon` name `home`
   - `profile` tab: title "Account", `BottomTabIcon` name `profile`
   - Tab bar colors from `src/constants/colors.ts` (`brandColors.primary`, `textColors.secondary`, `surfaceColors.card`, `borderColors.default`)
   - `headerShown: false`, height ~68, NunitoSansMedium labels
4. Delete `docs/NATIVE_TABS.md` if it was added for the native tabs experiment.
5. Search the repo for `unstable-native-tabs` and remove any remaining references.

## Reference implementation
Match the pre-migration style in git history or use `BottomTabIcon` from `@/components/navigation/BottomTabIcon`.

## Acceptance criteria
- App builds and both tabs work on iOS and Android.
- No imports from `expo-router/unstable-native-tabs` remain.
- `npm run typecheck` and `npm run lint` pass.
```
