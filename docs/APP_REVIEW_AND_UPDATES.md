# App Review and minimum versions

## Store Review

`src/services/app-review.ts` wraps `expo-store-review` and exposes:

- `canRequestAppReview()` for availability plus the persisted cooldown
- `requestAppReview()` for the native sheet
- `getLastAppReviewRequestAt()` for diagnostics/product logic

The default cooldown is 90 days. Product-triggered prompts should happen after a meaningful success and never while another modal or full-screen promotion is visible. The Settings action passes `ignoreCooldown: true` because it is explicitly initiated by the user. Stores may decide not to show the native sheet even when the request succeeds.

## Force update

Set `EXPO_PUBLIC_UPDATE_POLICY_PATH=/app/update-policy` to enable the non-blocking cold-start check. Leave it unset to disable the feature. The client adds `platform`, `version`, and `build` query parameters and expects:

```json
{
  "minimumVersion": "1.2.0",
  "minimumBuild": 42,
  "latestVersion": "1.4.0",
  "latestBuild": 55,
  "required": false,
  "title": "Update required",
  "message": "Install the latest version to continue.",
  "storeUrl": "https://example.com/your-store-page"
}
```

The endpoint and version policy are backend-owned; no vendor SDK is required. The app keeps launch network-independent and routes to `app/update-required.tsx` only for a mandatory response. Customize the response adapter if your backend uses snake_case.
