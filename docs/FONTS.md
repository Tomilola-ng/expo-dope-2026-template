# Fonts

Body font is loaded via `@expo-google-fonts/nunito-sans` (works on iOS and Expo Go). **Android release builds may require bundling `.ttf` files** under `assets/fonts/` and registering them in `app.json` via the `expo-font` plugin. Add local font files before shipping to Play Store if headings/body render as system fallback on Android.

## Current setup

| Role | Font |
| ---- | ---- |
| Headings (`display`, `h1`–`h3`) | System |
| Body, labels, buttons | Nunito Sans (Google Fonts package) |

Weights loaded: Regular (400), Medium (500), SemiBold (600), Bold (700).

Configuration:

- `src/hooks/useAppFonts.ts` — loads font files from the package
- `src/constants/typography.ts` — maps text variants to font families

## Android release checklist

1. Download Nunito Sans `.ttf` files for the weights you use.
2. Place them in `assets/fonts/`.
3. Add the `expo-font` plugin block to `app.json` listing each file.
4. Rebuild with EAS and verify typography on a physical Android device.
