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
