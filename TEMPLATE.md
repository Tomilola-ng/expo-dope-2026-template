# Template checklist

Use this list when bootstrapping a new app from this template.

## Identity

- [ ] App name, slug, and URL scheme (`app.json`)
- [ ] Android package name and iOS bundle identifier (`app.json`)
- [ ] `package.json` name (if publishing as a separate repo)
- [ ] EAS project — run `eas init` and set `extra.eas.projectId` + `updates.url` in `app.json`

## Assets & branding

- [ ] App icon, adaptive icon layers, splash screens (`assets/icons/`, `assets/images/`)
- [ ] Onboarding hero image and logo
- [ ] Brand colors in `src/constants/designTokens.json` (currently monochrome B&W defaults)

## Fonts

- [ ] Body font package (`@expo-google-fonts/nunito-sans` is pre-wired)
- [ ] Android release: bundle `.ttf` files if needed — see `docs/FONTS.md`

## Backend

- [ ] `EXPO_PUBLIC_API_BASE_URL` in `.env.local` (dev)
- [ ] Production HTTPS API URL via EAS env for release builds
- [ ] Confirm auth API paths match your backend (override via `EXPO_PUBLIC_AUTH_*` env vars if needed)

## Optional — social auth

- [ ] Google: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (+ iOS client id) and `iosUrlScheme` in `app.json`
- [ ] Apple: enable Sign in with Apple capability on the iOS App ID (plugin already listed)
- [ ] Confirm backend `POST /auth/apple/token` and `/auth/google/token` (or override paths)

## Optional — billing

- [ ] RevenueCat public SDK keys in env (`EXPO_PUBLIC_REVENUECAT_*_API_KEY`)
- [ ] Bind RC app-user id after login (`loginRevenueCatUser`) — see `docs/BILLING.md`
- [ ] Native build before real store purchases (not Expo Go alone)

## Optional — OTA

- [ ] Confirm `runtimeVersion` + `updates.url` after `eas init`
- [ ] Prefer `eas update` for JS/asset fixes after an updates-capable binary is installed

## Product screens (placeholders in template)

- [ ] Onboarding copy and images (`app/(public)/onboarding.tsx`)
- [ ] Home screen (`app/(protected)/(tabs)/index.tsx`)
- [ ] Notification `action_url` deep-link routing (`app/(protected)/notifications.tsx`)

## Optional

- [ ] Run AI prompts in `prompts/` (design system, spec-driven dev, Expo upgrade, revert native tabs)
- [ ] Generate product specs under `spec/` — see `prompts/03-spec-driven-development.md`
- [ ] Remove or customize telemetry / client-error reporting
- [ ] Update About section copy in settings (`app/(protected)/settings.tsx`)
