# Prompt 03 — Spec-driven development

Use before building serious features. Matches the workflow described in the Expo Dope 2026 blog post and how this template is structured.

---

```
You are working in the Expo Dope 2026 mobile template (Expo SDK 54, Expo Router, TanStack Query).

Goal: set up spec-driven development for MY_APP — human-readable specs that engineers and AI agents can execute without guessing.

## Philosophy
Treat ambiguity as a bug in the planning phase, not a surprise in production.
Different readers need different truths — do not put everything in one giant README.

## What already exists in this repo
- `spec/STACK.md` — living stack overview (Expo 54, NativeWind, TanStack Query, secure-store auth, SSE notifications)
- `TEMPLATE.md` — bootstrap checklist (identity, assets, backend env, placeholders)
- `docs/FONTS.md` — Android font bundling notes
- Implemented template flows: onboarding, auth (register/login/OTP/reset), protected tabs (Home + Account), profile edit, settings, notification inbox, push token lifecycle
- API client: `src/api/*` with env-based paths (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_PREFIX`)

## Create these spec files (markdown under `spec/`)
### 1. `spec/PRODUCT_BRIEF.md` — north star
- What we are building and why
- Who it is for
- What success looks like in v1
- What is explicitly OUT of scope for v1
- If a feature does not serve this brief, it waits

### 2. `spec/FEATURE_SPEC.md` — build order and behavior contract
Use MY_FEATURE_AREA (e.g. social feed, marketplace, bookings) and include:
- User stories
- Functional requirements
- Dependency order (e.g. confirm repo setup → connect API → auth → core screens)
- Screen list mapped to Expo Router paths under `app/`
- Boring-but-critical requirements: loading states, error messages, protected routes, empty states, form validation
- Acceptance criteria per milestone

### 3. `spec/API_CONTRACT.md` — stops mobile/backend drift
For each endpoint the mobile app calls, document:
- Method + path
- Auth requirement
- Request body / query params
- Response shape (field names and types)
- Error shapes clients must handle
- Breaking rules (e.g. registration does not return login tokens; comments use a `content` field)

Align with existing `src/api/types.ts` where endpoints already exist; flag gaps.

### 4. `spec/BUSINESS_RULES.md` — product logic that is not one endpoint
Examples: ownership roles, block behavior, feed ranking philosophy, admin boundaries, notification `action_url` routing rules.

### 5. `spec/PROJECT_OVERVIEW.md` — what the repo actually does today
Living doc: navigation map, providers, cache keys, secure storage keys, push/SSE behavior. Update as code evolves.

### 6. `spec/tasks/` — executable slices
Create numbered task files, e.g.:
- `spec/tasks/01-repo-and-env.md`
- `spec/tasks/02-auth-integration.md`
- `spec/tasks/03-home-feature.md`

Each task file must include: goal, files likely touched, steps, test plan, definition of done.
An agent should pick up ONE task without loading the entire product history.

## My product inputs (fill in)
APP_NAME:
ONE_LINE_PITCH:
V1_GOALS:
V1_NON_GOALS:
BACKEND_BASE_URL_PATTERN: (e.g. REST + SSE at /api/v1)
KEY_SCREENS:

## Rules for writing specs
- Write for future-me and mobile engineers — not backend implementation details (no SQL, migrations, cron).
- Reference Expo Router paths and env vars clients need.
- When unsure, add an `OPEN_QUESTIONS` section instead of inventing behavior.
- After creating specs, add a `spec/README.md` index linking all documents.

## Acceptance criteria
- All six doc types above exist under `spec/`.
- Feature spec build order matches this template's existing auth-first architecture.
- API contract covers auth, profile, settings, notifications, and file upload if used.
- At least 3 task files ready for the first implementation sprint.
- No application code changes in this pass — specs only unless I say otherwise.
```
