# Prompt 05 — Native tabs (enable or revert)

Native tabs are the **default** in this template (`app/(protected)/(tabs)/_layout.tsx`).
Use this prompt to **revert** to JavaScript tabs, or to re-enable native tabs after a revert.

See also `docs/NATIVE_TABS.md`.

---

## Revert to JavaScript tabs

```
You are working in the Expo Dope 2026 mobile template.

Goal: remove native tabs and restore the standard Expo Router JavaScript `<Tabs>` layout.

## Tasks
1. Open `app/(protected)/(tabs)/_layout.tsx`.
2. Remove all imports from `expo-router/unstable-native-tabs`.
3. Restore `Tabs` from `expo-router` with `BottomTabIcon` for Home + Account (see `src/components/navigation/BottomTabIcon.tsx`).
4. Keep headerShown: false and brand tint colors from design tokens.
5. Run `npm run typecheck` and `npm run lint`.

## Do not
- Delete `BottomTabIcon` (other prompts may reference it)
- Change screen file names or routes
```

---

## Re-enable native tabs (iOS glass)

```
You are working in the Expo Dope 2026 mobile template (Expo SDK 54+, Expo Router 6).

Goal: replace the JavaScript tab bar with Expo Router native tabs so iOS gets the system liquid-glass tab bar (on iOS 26+ builds compiled with Xcode 26).

## Important constraints
- Use ONLY `expo-router/unstable-native-tabs` — do NOT add react-native-bottom-tabs or custom blur tab libraries.
- The API is experimental (`unstable-` prefix).
- Liquid glass appearance requires a native build with Xcode 26 on iOS 26+.
- Android uses native system tabs with different limitations.
- Do not nest JavaScript `<Tabs>` and `<NativeTabs>` in the same router tree.

## Current tabs to migrate
File: `app/(protected)/(tabs)/_layout.tsx`
- Tab `index` → title "Home"
- Tab `profile` → title "Account"

## Implementation
Follow the live layout pattern already documented in `docs/NATIVE_TABS.md` and match SF Symbols + MaterialCommunityIcons VectorIcon usage used previously in this repo.

## QA checklist
- [ ] Both tabs navigate correctly on iOS and Android
- [ ] Protected auth guard still works
- [ ] `npm run typecheck` and `npm run lint` pass
```
