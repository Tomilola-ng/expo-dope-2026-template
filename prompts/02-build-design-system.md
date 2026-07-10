# Prompt 02 — Build a design system

Use when you are starting a new product and want tokens + component rules before shipping screens.

---

```
You are working in the Expo Dope 2026 mobile template (Expo SDK 54, React Native, NativeWind 4).

Goal: help me define and implement a minimal but complete design system for a consumer mobile app, then apply it to this template.

## Product context
APP_NAME: My App
AUDIENCE: e.g. young professionals, pet owners, fitness users
PERSONALITY: e.g. playful, calm, premium, utilitarian
PLATFORM_PRIORITY: iOS-first | Android-first | equal

## Deliverables (in order)
### 1. Design system spec (markdown in `docs/design-system.md`)
Document:
- Color roles: brand primary, text primary/secondary/inverse, surfaces, borders, feedback (success/error/warning/info)
- Typography: display (system or custom), body font, size scale for display/h1/h2/h3/body/caption/button
- Spacing scale (4px base), radius scale, shadow levels
- Motion: press scale, quick transition duration
- Component rules: button variants (primary/secondary/destructive), input focus ring, card elevation, list row height

Keep it short and actionable — not corporate PRD theater.

### 2. Token implementation
- Fill `src/constants/designTokens.json` from the spec
- Ensure `src/constants/colors.ts`, `spacing.ts`, `radius.ts`, `shadows.ts`, `typography.ts` export typed values from the JSON
- Extend `tailwind.config.js` so NativeWind classes match token names used in components

### 3. Primitive audit
Review and align these components with the new system:
- `AppText`, `AppButton`, `AppInput`, `PasswordInput`, `AppCard`, `Screen`, `ScreenHeader`
- `SettingsItem`, `SettingsSection`, `EmptyState`, `LoadingState`, `ErrorState`
- `BottomTabIcon` + tab bar in `app/(protected)/(tabs)/_layout.tsx`

### 4. Screen pass (visual only)
Apply tokens to: onboarding, login/sign-up, verify email, home placeholder, account tab, settings stack.
Do not invent new product features.

## Constraints
- Prefer system font for headings unless I specify a display font.
- Default body font in this template is Nunito Sans via `@expo-google-fonts/nunito-sans` — keep unless we choose otherwise.
- Monochrome B&W defaults are intentional starting points; replace them entirely with the new palette.
- No new UI libraries (no Paper, NativeBase, etc.).

## Acceptance criteria
- `docs/design-system.md` exists and matches implemented tokens.
- Visual consistency across all public and protected screens.
- `npm run typecheck`, `npm run lint`, and `npm run test` pass.
- List follow-up items I should decide later (dark mode, haptics, accessibility contrast checks).
```
