# Expo Dope 2026 Template

A slim Expo + React Native starter for consumer mobile apps. Pairs with the [FastAPI Dope 2026 backend template](https://github.com/Tomilola-ng/fastapi-dope-2026-template).

Includes auth (register, login, OTP, password reset), push notifications (REST + SSE + Expo push), notification inbox, account profile, settings, and reusable UI primitives.

## First run

Clone the repo, install dependencies, and point the app at a running FastAPI backend:

```bash
git clone <this-repo> my-app && cd my-app
npm install --legacy-peer-deps
cp .env.example .env.local
```

Edit `.env.local` and set `EXPO_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000` while the [FastAPI template](https://github.com/Tomilola-ng/fastapi-dope-2026-template) is running locally). Then start Expo:

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

## Scripts

| Command                           | Description           |
| --------------------------------- | --------------------- |
| `npm start`                       | Start Expo dev server |
| `npm run typecheck`               | TypeScript check      |
| `npm run lint`                    | ESLint                |
| `npm run ios` / `npm run android` | Native run            |

## Stack

See `spec/STACK.md` for the technology overview.
