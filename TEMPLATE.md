# Template checklist

Use this list when bootstrapping a new app from this template.

## Identity

- [ ] App name, slug, and URL scheme (`app.json`)
- [ ] Android package name and iOS bundle identifier (`app.json`)
- [ ] `package.json` name (if publishing as a separate repo)
- [ ] EAS project — run `eas init` and set `extra.eas.projectId` in `app.json`

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

## Product screens (placeholders in template)

- [ ] Onboarding copy and images (`app/(public)/onboarding.tsx`)
- [ ] Home screen (`app/(protected)/(tabs)/index.tsx`)
- [ ] Notification `action_url` deep-link routing (`app/(protected)/notifications.tsx`)

## Optional

- [ ] Run AI prompts in `prompts/` (design system, spec-driven dev, Expo upgrade, native tabs)
- [ ] Generate product specs under `spec/` — see `prompts/03-spec-driven-development.md`
- [ ] Remove or customize telemetry (`src/utils/telemetry.ts`)
- [ ] Update About section copy in settings (`app/(protected)/settings.tsx`)
