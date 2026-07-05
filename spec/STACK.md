# Expo Dope 2026 — Stack

Mobile template for consumer apps backed by [fastapi-dope-2026-template](https://github.com/Tomilola-ng/fastapi-dope-2026-template).

## Core

| Layer        | Choice                                           |
| ------------ | ------------------------------------------------ |
| Framework    | Expo SDK 54, React Native 0.81                   |
| Navigation   | Expo Router (file-based)                         |
| Styling      | NativeWind 4 + Tailwind CSS                      |
| Server state | TanStack Query 5                                 |
| HTTP         | `fetch` via `src/api/client.ts`                  |
| Auth storage | `expo-secure-store`                              |
| Push         | `expo-notifications` + device token registration |
| Realtime     | SSE (`react-native-sse`) for notification stream |

## Typography

- Headings: system font
- Body: Nunito Sans via `@expo-google-fonts/nunito-sans`

See `docs/FONTS.md` for Android release notes.

## App identity (defaults)

| Field           | Default             |
| --------------- | ------------------- |
| Name            | My App              |
| Slug            | `my-app-template`   |
| Scheme          | `myapp`             |
| Android package | `com.example.myapp` |
| iOS bundle ID   | `com.example.myapp` |

Run `eas init` before production push notification builds.

## Included flows

- Public: onboarding, sign-up, login, email verification, forgot/reset password
- Protected tabs: Home (placeholder), Account
- Profile edit, settings (password, notifications, delete account)
- Notification inbox with push permission prompt
- Public read-only account profile
