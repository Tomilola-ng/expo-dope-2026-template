# Prompt 04 — Upgrade Expo safely

Use when bumping Expo SDK or major React Native versions.

---

```
You are working in the Expo Dope 2026 mobile template.

Goal: upgrade this project to the latest compatible Expo SDK safely, with minimal downtime and clear rollback notes.

## Current baseline (verify before starting)
- Run `cat package.json` and note `expo`, `react-native`, `expo-router`, and `react` versions.
- Run `npm run doctor` (expo-doctor) and save the output.

## Upgrade procedure
1. Read the official Expo SDK changelog for the target SDK (breaking changes, removed APIs, new architecture defaults).
2. Upgrade core packages using Expo's installer — prefer:
   `npx expo install expo@latest`
   `npx expo install --fix`
   Do not manually guess compatible versions for Expo-managed packages.
3. Update `expo-router`, `react-native`, `react`, and all `expo-*` packages to versions recommended by `expo install --fix`.
4. Check `app.json` plugins (`expo-splash-screen`, `expo-notifications`, `expo-image-picker`, `expo-secure-store`, `expo-asset`, `@react-native-community/datetimepicker`) against the new SDK docs.
5. Review `metro.config.js`, `babel.config.js`, and `tsconfig.json` for deprecated options.
6. Search the codebase for deprecated imports or APIs flagged in the changelog.
7. If upgrading across native-tabs API changes, check `app/(protected)/(tabs)/_layout.tsx` — native tabs use `expo-router/unstable-native-tabs` on SDK 54+ with a different API in SDK 55+.
8. Run in order:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - `npm run doctor`
9. Document any manual steps for EAS Build (Xcode version, Android compile SDK, `eas.json` changes).

## Constraints
- Keep `--legacy-peer-deps` if the repo already uses it for install/CI.
- Do not remove features (auth, notifications SSE, push) unless the SDK forces a replacement.
- Do not upgrade unrelated libraries (TanStack Query, NativeWind) unless required for compatibility.
- If a dependency has no SDK-compatible release, stop and list blockers instead of pinning random versions.

## Deliverables
- Updated `package.json` / lockfile with compatible versions.
- Short `docs/UPGRADE_NOTES.md` with: from → to versions, breaking changes handled, manual QA checklist (iOS sim, Android emu, push permission, login flow), rollback command (`git revert` or branch name).

## Acceptance criteria
- All quality scripts pass.
- `npx expo start` launches without config errors.
- No new TypeScript errors in `app/` or `src/`.
```
