# WeedGrow

WeedGrow is an experiment in building a simple plant tracking app across mobile and web.
The repository contains two separate projects:

- **WeedGrowApp** – an [Expo](https://expo.dev) application for iOS, Android and the web.
- **weed-grow-web** – a [Vite](https://vitejs.dev) + React web application.

Both projects require [Node.js](https://nodejs.org/) (version 18 or newer is recommended).
You can install Node.js from the official website or using a version manager such as
[nvm](https://github.com/nvm-sh/nvm).

## Directory overview

```
/WeedGrowApp   - Expo React Native project located in `WeedGrowApp`
/weed-grow-web - Vite React project located in `weed-grow-web`
```

Each directory contains its own `package.json` and README with more details.
The steps below outline how to get each project running.

## Getting started

### 1. Clone the repository

```bash
# if you haven't cloned it already
git clone <repo-url>
cd WeedGrow
```

### 2. Install prerequisites

- **Node.js** – download from [nodejs.org](https://nodejs.org/).
- **Expo CLI** (for the mobile app):

```bash
npm install -g expo-cli
```

### 3. Run the Expo app

```bash
cd WeedGrowApp
npm install
npx expo start
```

This will open the Expo developer tools. From there you can launch the app in a
simulator or on a device using the Expo Go app.

### 4. Run the Vite web app

```bash
cd weed-grow-web
npm install
npm run dev
```

Vite will start a development server (usually on <http://localhost:5173>). Open
that URL in your browser to view the web app.

## Shared Firebase configuration

Both projects rely on a single Firebase configuration defined in `firebase.ts`
at the repository root. Create a `.env` file next to it and add your Firebase
keys using the `VITE_` prefix:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

The Expo and Vite apps each import the config through their respective
`services/firebase.ts` files, so you only need to maintain the keys in one
place.

## Additional information

For more information about each project (including build and lint commands),
see the README files inside `WeedGrowApp` and `weed-grow-web`.
