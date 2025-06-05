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
Here’s a **comprehensive `README.md`** tailored for your `WeedGrow` repo. It’s written to give **AI tools like Codex** full context about your app’s goal, structure, technologies, and roadmap — while also being clear to any human contributor.

---

```markdown
# 🌿 WeedGrow

**WeedGrow** is a modern cannabis cultivation companion app, focused initially on **outdoor growing**. It helps users track their plants' lifecycle, log care activities (like watering and fertilizing), and make smarter growing decisions based on seasonal and weather conditions.

---

## 🎯 Purpose

The app’s goal is to **empower outdoor cannabis growers** — especially beginners — by providing a digital assistant to:

- Track the growth stages of each plant
- Record care logs (watering, pruning, fertilizing, etc.)
- Receive reminders and growing tips
- Monitor seasonal and environmental factors
- Eventually expand to greenhouse and indoor growers

---

## 🧱 Tech Stack

| Layer        | Technology                | Purpose                                 |
|--------------|---------------------------|------------------------------------------|
| **Frontend** | React + Vite              | Fast, modern UI layer                    |
| **Data**     | Firebase Firestore        | NoSQL database for plant + log storage  |
| **Auth**     | Firebase Authentication   | (Planned) User login and personalized data |
| **Backend**  | Firebase Cloud Functions  | (Planned) Custom logic, reminders       |
| **Storage**  | Firebase Storage          | (Planned) Upload photos of plants       |
| **Hosting**  | Firebase Hosting          | Static site hosting                     |

---

## 📁 Project Structure

```

weed-grow/
├── weed-grow-web/          # React + Vite frontend (this repo)
│   ├── src/
│   │   ├── App.tsx         # Main app logic
│   │   ├── services/
│   │   │   └── firebase.ts # Firebase configuration
│   │   └── components/     # (Planned) Reusable UI components
├── weed-grow-backend/      # (Planned) Optional backend or cloud functions
├── shared/                 # (Planned) Shared types or logic across frontend/backend

````

---

## 🔄 Current Functionality

- ✅ Firebase Firestore setup
- ✅ Basic Firestore read from a `test` collection
- 🚧 Ready for adding plant logging & write functionality

---

## 🧪 Data Model (Planned)

### 🔹 Plants Collection

```json
{
  "name": "OG Kush",
  "strain": "Indica-dominant",
  "datePlanted": "2024-10-05",
  "status": "vegetative", // germinating | vegetative | flowering | harvest
  "location": {
    "lat": -34.123,
    "lng": 18.456
  },
  "notes": "Doing well, topped once",
  "userId": "abc123"
}
````

### 🔹 Care Logs Collection (Linked to Plant)

```json
{
  "plantId": "abc123",
  "type": "watered",  // watered | fertilized | trimmed | etc.
  "note": "Soaked well before rain",
  "timestamp": "2024-10-10T14:05:00Z"
}
```

---

## 🚧 Roadmap

### Stage 1: MVP

* [x] React + Vite frontend scaffold
* [x] Firebase Firestore integration
* [ ] Add plant form (with Firestore write)
* [ ] Display logged plants in UI

### Stage 2: Basic Tracking

* [ ] Record care events (watering, feeding, etc.)
* [ ] Show a timeline of care
* [ ] Calculate growth phase from date planted

### Stage 3: Intelligence

* [ ] Weather-based alerts using user geolocation
* [ ] Reminder system (via email/notification)
* [ ] Growth stage tips and task suggestions

### Stage 4: Multi-User + Mobile

* [ ] Firebase Authentication (Google sign-in)
* [ ] Support per-user plant data
* [ ] React Native or PWA for mobile-friendly version

---

## 🤖 AI Integration Notes (for Codex / GPT Agents)

This app is designed as a modular, extensible React + Firebase system with the goal of building a smart assistant for outdoor cannabis growers.

The `App.tsx` currently includes a Firestore `getDocs()` call reading from the `test` collection, but all plant-related features will be migrated to structured `plants` and `careLogs` collections.

AI tools can assist with:

* Form creation for plant and log entries
* Auto-advancing growth stages
* Data visualization (timeline, weather impact)
* Scheduling tips/reminders
* Geolocation integration and season checking logic

Contributors and AI agents should follow clean, modular React patterns and avoid overcomplicating the frontend state until multiple views are in play.

---

## 🙌 Author

**Zane Groenewald**
Junior Software Developer @ Pragma
Cape Town, South Africa
GitHub: [Supergoku109](https://github.com/Supergoku109)

---

## 📄 License

This project is currently personal/private and not intended for commercial redistribution. License to be determined later.

```

---

Let me know if you want this added as an actual file in your repo (`README.md`), or if you'd like a shortened version for GitHub summary.
```
