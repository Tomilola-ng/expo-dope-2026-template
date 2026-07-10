# Prompt 01 — Customize design system

Use when you already have brand colors, typography, and spacing and want this template to match.

---

```
You are working in the Expo Dope 2026 mobile template (Expo SDK 54, React Native, NativeWind 4).

Goal: apply my existing design system to this codebase without changing app behavior or navigation.

## My design system inputs
Paste or attach:
- Primary / secondary / neutral palette (hex or OKLCH)
- Font families (display + body) and whether they are Google Fonts or local .ttf
- Border radius scale, shadow style, spacing scale if non-default
- Any component rules (e.g. buttons are pill-shaped, cards have 16px radius)

BRAND_NAME: YOUR_APP_NAME
PRIMARY_COLOR: #000000
BODY_FONT: Nunito Sans (or your font)

## What this template already wires
- Single source of truth: `src/constants/designTokens.json`
- Derived constants: `src/constants/colors.ts`, `spacing.ts`, `radius.ts`, `shadows.ts`, `typography.ts`
- Tailwind theme: `tailwind.config.js` reads from design tokens
- UI primitives to restyle: `AppText`, `AppButton`, `AppInput`, `AppCard`, `Screen`, `ScreenHeader`, settings rows, empty/loading/error states
- Tab bar styling: `app/(protected)/(tabs)/_layout.tsx`

## Tasks
1. Update `designTokens.json` with my palette, typography, radius, shadows, and motion values.
2. Regenerate or adjust the `src/constants/*` files so they stay in sync with the JSON (match existing patterns).
3. Update `tailwind.config.js` color/radius/spacing extensions to match.
4. If I provide a new body font, wire it in `src/hooks/useAppFonts.ts` and document Android release steps in `docs/FONTS.md` if local fonts are needed.
5. Sweep auth screens, onboarding, tabs, settings, and notifications for hard-coded colors; replace with token-based classes or constants.
6. Replace placeholder assets in `assets/icons/` and `assets/images/` only if I attached new files — otherwise leave default Expo placeholders.
7. Do not change API client code, auth flow, or route structure.

## Acceptance criteria
- Light mode looks on-brand across splash, onboarding, auth, tabs, settings, and profile.
- `npm run typecheck`, `npm run lint`, and `npm run test` pass.
- No new dependencies unless required for my font package.
- Summarize which files changed and which token values map to which UI surfaces.
```
