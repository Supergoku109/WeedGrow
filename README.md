# WeedGrow

WeedGrow is a grow/plant tracking mobile app built with Expo (React Native).
Data is stored in Firebase (Firestore, plus Storage for photo uploads), with optional weather lookups via
OpenWeatherMap.

## Domain Overview

The mobile app's core data model (see `WeedGrowApp/firestoreModels.ts`) centers around "plants" and grow
activities:

- Plants track fields like `name`, `strain`, `growthStage` (germination/seedling/vegetative/flowering),
  `environment` (outdoor/greenhouse/indoor), and optional metadata (pot size, watering frequency, pests,
  training tags, notes, location, etc.).
- Plant logs capture events like watering, fertilizing, training, stage changes, photos, and harvest.

## Repo Layout

Primary app:

- `WeedGrowApp/`: Expo app using Expo Router (iOS/Android/Web)

## Project Status (Verified)

- The Expo app is the primary app in this repo. It reads/writes Firestore collections like `plants`, `groups`,
  and `sensorProfiles`.
- Authentication is not wired up yet (no Firebase Auth usage in app code). Some writes currently use placeholder
  IDs like `demoUser` (for example: plant `owners` and group `createdBy`).

## Prerequisites

- Node.js + npm (this workspace is currently being developed with Node `v22.19.0` / npm `10.9.3`).
  - TODO: Document the minimum supported Node version.
- For native builds:
  - Android: Android Studio + JDK are required for `WeedGrowApp`'s `npm run android`.
  - iOS: Xcode is required for `WeedGrowApp`'s `npm run ios`.
  - TODO: Document exact versions and setup steps.

## Quick Start

### Mobile App (Expo)

```bash
cd WeedGrowApp
npm install
npm start
```

Useful commands (see `WeedGrowApp/package.json`):

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
```

## Environment Variables

### WeedGrowApp (.env)

`WeedGrowApp` loads environment variables from `WeedGrowApp/.env` via `WeedGrowApp/app.config.js` and exposes
them to the runtime via `expo.extra` (read in `WeedGrowApp/services/firebase.ts`).

Required keys (see `WeedGrowApp/app.config.js`):

```bash
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...

# Used by WeedGrowApp/lib/weather/fetchWeather.ts
OPENWEATHERMAP_API_KEY=...
```

TODO: Add a `WeedGrowApp/.env.example` file (do not commit secrets).

## Firestore Data Model

Source of truth for app-facing types:

- `WeedGrowApp/firestoreModels.ts`
- `WeedGrowApp/CONTEXT.md` (schema overview + query notes; TODO: keep in sync with the code/types)

Collections used by the mobile app code today:

- `plants/{plantId}`
  - `logs/{logId}`
  - `weatherCache/{YYYY-MM-DD}` (doc IDs are dates)
  - `progressPics/{picId}`
- `groups/{groupId}`
- `sensorProfiles/{sensorProfileId}`

Other collections/types exist in `WeedGrowApp/firestoreModels.ts` (for example: `users`, `notifications`,
`analytics`, `invites`), but there is currently no mobile app code that reads/writes them.
TODO: Confirm which of these are planned vs should be removed or implemented.

## Where To Look (Humans + AI)

- Mobile routes: `WeedGrowApp/app/` (Expo Router file-based routing)
- Mobile feature modules: `WeedGrowApp/features/`
- Shared mobile UI: `WeedGrowApp/ui/` and `WeedGrowApp/components/ui/`
- Mobile import alias: `@/` maps to the `WeedGrowApp/` root (see `WeedGrowApp/tsconfig.json`)
- Firebase client (mobile): `WeedGrowApp/services/firebase.ts`
- Weather logic: `WeedGrowApp/lib/weather/`
- Log utilities: `WeedGrowApp/lib/logs/`
- Progress photo uploads: `WeedGrowApp/lib/progressPics/uploadProgressPic.ts`

## Firestore Admin Scripts (Optional)

These scripts use the Firebase Admin SDK and require a service account key JSON file.
The repo ignores this file on purpose.

- Put your service account JSON at: `WeedGrowApp/serviceAccountKey.json`

Seed example data:

```bash
cd WeedGrowApp
node seedFirestore.js
```

TODO: `WeedGrowApp/seedFirestore.js` currently updates a plant's `sensorProfileId` before `plantId` is defined.
Verify/fix before relying on it.

Delete all plants and their subcollections (`logs`, `weatherCache`, `progressPics`):

```bash
cd WeedGrowApp
node scripts/deleteAllPlantsAndSubcollections.js
```

Warning: These scripts can modify/delete real Firestore data. Use a test Firebase project unless you are sure.

## License

TODO: Choose a license.
