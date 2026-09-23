# Expo Dope 2026 Template

<div align="center">

![Expo](https://img.shields.io/badge/📱_Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/⚛️_React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/🟦_TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/🎨_NativeWind-4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

[![CI](https://github.com/Tomilola-ng/expo-dope-2026-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Tomilola-ng/expo-dope-2026-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/📄_License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Use this template](https://img.shields.io/badge/🚀_Use_this_template-2ea44f?style=for-the-badge)](https://github.com/Tomilola-ng/expo-dope-2026-template/generate)

![👀 Repo views](https://komarev.com/ghpvc/?username=Tomilola-ng&repo=expo-dope-2026-template&label=👀%20repo%20views&color=0e75b6&style=for-the-badge)

</div>

A production Expo + React Native starter for authenticated mobile products. It includes email/password and Apple/Google auth, verification and password recovery, secure sessions with refresh/offline-safe hydration, push notifications, notification preferences, profile and account deletion flows, RevenueCat scaffolding, OTA updates, error handling, Store Review, and reusable UI/form primitives.

## Get started

**Clone or download**

```bash
git clone https://github.com/Tomilola-ng/expo-dope-2026-template.git my-app
cd my-app
npm run setup
```

Or click **Use this template** on GitHub to create a new repo, then clone your copy.

`npm run setup` installs dependencies and copies `.env.example` → `.env.local`. Edit `.env.local` and set `EXPO_PUBLIC_API_BASE_URL` to your backend (e.g. `http://localhost:8000` in development). Then:

```bash
npx expo start
```

On first launch the app shows splash → onboarding → sign-up or login → protected tabs (Home + Account). Use Expo Go for most UI work; Apple/Google Sign-In, RevenueCat, liquid glass, and push need a **development build** (`npm run start:dev-client` after `eas build` / `expo run:*`). For push + OTA, run `eas init` and set `extra.eas.projectId` plus `updates.url` in `app.json`.

## Customize for your app

1. Run `eas init` and add the project ID to `app.json` under `extra.eas.projectId`.
2. Update app name, slug, scheme, and bundle IDs in `app.json`.
3. Replace icons and splash assets — see `assets/images/README.md`.
4. Review brand colors in `src/constants/designTokens.json` (defaults are black & white).
5. Read `TEMPLATE.md` for the full checklist.
6. Read `docs/FONTS.md` before shipping Android release builds.

## AI prompts

Copy-paste prompts for Cursor, Copilot, or any coding agent live in [`prompts/`](prompts/). They cover design-system customization, spec-driven development, safe Expo upgrades, and native-tabs revert/re-enable.

| Prompt | When to use |
| ------ | ----------- |
| [01 — Customize design system](prompts/01-customize-design-system.md) | Apply your brand tokens to this template |
| [02 — Build a design system](prompts/02-build-design-system.md) | Start from scratch before theming the app |
| [03 — Spec-driven development](prompts/03-spec-driven-development.md) | Write specs before features (the workflow behind this template) |
| [04 — Upgrade Expo safely](prompts/04-upgrade-expo-safely.md) | Bump SDK / dependencies without breaking native modules |
| [05 — Native tabs](prompts/05-ios-glass-native-tabs.md) | Revert to JS tabs or re-enable native tabs |

Also see `docs/NATIVE_TABS.md`, `docs/BILLING.md`, and `docs/APP_REVIEW_AND_UPDATES.md`.

## Production behavior

- Auth tokens remain in SecureStore. A network outage during launch does not erase a valid local session; only a confirmed 401/invalid-token response signs the user out.
- The API client has request timeouts and one single-flight refresh/retry cycle for concurrent 401 responses.
- `AppErrorBoundary` and the global JS handler feed the existing client-error reporting hook.
- Store Review is available through `canRequestAppReview` / `requestAppReview`, including a persisted anti-spam cooldown and a Settings action.
- A force-update check is opt-in through `EXPO_PUBLIC_UPDATE_POLICY_PATH`; without that variable the app makes no update-policy request.

This is deliberately not a game starter. Game identity, ads, game feel, SFX, rounds, rooms, and progression belong in Game Dope.

## Scripts

| Command                           | Description                              |
| --------------------------------- | ---------------------------------------- |
| `npm run setup`                   | Install deps + create `.env.local`       |
| `npm start`                       | Start Expo Go                            |
| `npm run start:dev-client`        | Start with a development client          |
| `npm run typecheck`               | TypeScript check                         |
| `npm run lint`                    | ESLint                                   |
| `npm run test`                    | Unit tests (Vitest)                      |
| `npm run doctor`                  | Run `expo-doctor` health checks          |
| `npm run ios` / `npm run android` | Native run                               |
| `npm run update:preview`          | EAS Update on preview channel            |

## Stack

See `spec/STACK.md` for the technology overview.

## Author

Built by [Tomilola-ng](https://github.com/Tomilola-ng). If this template saves you time:

- **GitHub** — follow [@Tomilola-ng](https://github.com/Tomilola-ng)
- **X (Twitter)** — follow [@tomilola_ng](https://x.com/tomilola_ng)

## License

MIT — see [LICENSE](LICENSE).
