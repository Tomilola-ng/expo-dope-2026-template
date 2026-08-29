# Billing (RevenueCat scaffold)

The template anticipates in-app purchases without shipping a product catalog.

## What is included

- `src/services/revenuecat.ts` — SDK status machine, key resolution, `initializeRevenueCatSdk`, `loginRevenueCatUser`, `logoutRevenueCatUser`
- `src/components/billing/BillingUnavailable.tsx` — safe UI when keys are missing or configure failed
- Env placeholders: `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

## Recommended identity sequence

1. Authenticate the user with your backend.
2. Call `initializeRevenueCatSdk()` (safe no-op when keys are missing).
3. Bind a **stable** RevenueCat app-user id (backend-provided or account-scoped — never anonymous checkout).
4. Call `loginRevenueCatUser(appUserId)`.
5. Only then show purchase CTAs. Prefer hiding buttons while `canShowPurchaseButtons` is false or your bind status is not ready.
6. On logout, call `logoutRevenueCatUser()`.

## Do not

- Treat RevenueCat purchaser info as your source of truth for balances/entitlements unless that is your product model.
- Surface SDK keys, configure errors, or store receipts in user-facing alerts.
- Expect real IAP in Expo Go — use a development/preview native build.

## Native gate

Adding or changing `react-native-purchases` requires an owner-approved native build before store smoke tests.
