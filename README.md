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

A slim Expo + React Native starter for consumer mobile apps — auth, push notifications, notification inbox, account profile, settings, and reusable UI primitives out of the box.

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

On first launch the app shows splash → onboarding → sign-up or login → protected tabs (Home + Account). Use Expo Go or a simulator; for push notifications in production, run `eas init` and set `extra.eas.projectId` in `app.json`.

## Customize for your app

1. Run `eas init` and add the project ID to `app.json` under `extra.eas.projectId`.
2. Update app name, slug, scheme, and bundle IDs in `app.json`.
3. Replace icons and splash assets — see `assets/images/README.md`.
4. Review brand colors in `src/constants/designTokens.json` (defaults are black & white).
5. Read `TEMPLATE.md` for the full checklist.
6. Read `docs/FONTS.md` before shipping Android release builds.

## AI prompts

Copy-paste prompts for Cursor, Copilot, or any coding agent live in [`prompts/`](prompts/). They cover design-system customization, spec-driven development, safe Expo upgrades, and optional iOS native glass tabs.

| Prompt | When to use |
| ------ | ----------- |
| [01 — Customize design system](prompts/01-customize-design-system.md) | Apply your brand tokens to this template |
| [02 — Build a design system](prompts/02-build-design-system.md) | Start from scratch before theming the app |
| [03 — Spec-driven development](prompts/03-spec-driven-development.md) | Write specs before features (the workflow behind this template) |
| [04 — Upgrade Expo safely](prompts/04-upgrade-expo-safely.md) | Bump SDK / dependencies without breaking native modules |
| [05 — iOS glass native tabs](prompts/05-ios-glass-native-tabs.md) | Enable or remove Expo's experimental native tabs |

## Scripts

| Command                           | Description                              |
| --------------------------------- | ---------------------------------------- |
| `npm run setup`                   | Install deps + create `.env.local`       |
| `npm start`                       | Start Expo dev server                    |
| `npm run typecheck`               | TypeScript check                         |
| `npm run lint`                    | ESLint                                   |
| `npm run test`                    | Unit tests (Vitest)                      |
| `npm run doctor`                  | Run `expo-doctor` health checks          |
| `npm run ios` / `npm run android` | Native run                               |

## Stack

See `spec/STACK.md` for the technology overview.

## Author

Built by [Tomilola-ng](https://github.com/Tomilola-ng). If this template saves you time:

- **GitHub** — follow [@Tomilola-ng](https://github.com/Tomilola-ng)
- **X (Twitter)** — follow [@tomilola_ng](https://x.com/tomilola_ng)

## License

MIT — see [LICENSE](LICENSE).
