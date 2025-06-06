# WeedGrow Firebase Firestore Schema

This document describes the structure of the Firestore database used in the WeedGrow app.
It helps Codex and other AI agents understand how your app stores and interacts with data.

---

## 🔹 Top-Level Collections

### `/users/{userId}`
- Contains user profile info.
- Fields:
  - `displayName: string`
  - `email: string`
  - `joinedAt: Timestamp`
  - `lastLogin: Timestamp`
  - `plantRefs: string[]`  // array of `plantId` references
  - `hasAcceptedTOS: boolean`
  - `profileImage: string | null`  // URL to profile photo or null

### `/users/{userId}/settings/preferences`
- Stores user preferences in a single document named “preferences.”
- Fields:
  - `defaultEnvironment: string`  // e.g. “indoor” or “outdoor”
  - `preferredUnits: string`  // “metric” or “imperial”
  - `darkMode: boolean`
  - `defaultReminderTime: string`  // e.g. “08:00”
  - `notificationPreferences: {`
    - `wateringReminders: boolean`
    - `newLogActivity: boolean`
    - `tips: boolean`
  - `}`

### `/plants/{plantId}`
- Main plant document that can be shared by multiple users.
- Fields:
  - `owners: string[]`  // array of `userId`s
  - `name: string`
  - `strain: string`
  - `growthStage: string`  // e.g. “germination”, “seedling”, etc.
  - `ageDays?: number`  // current age of the plant in days
  - `status: string`  // e.g. “active” or “archived”
  - `environment: string`  // “indoor” or “outdoor”
  - `plantedIn: string`  // e.g. “pot”, “ground”
  - **Optional Fields:**
    - `potSize?: string`  // e.g. “20L”
    - `wateringFrequency?: string`  // e.g. “every 2 days”
    - `fertilizer?: string`  // e.g. “BioGrow”
    - `sunlightExposure?: string`  // e.g. “Full sun”
    - `trainingTags?: string[]`  // e.g. [“LST”]
    - `pests?: string[]`  // e.g. [“aphids”]
    - `notes?: string`
    - `imageUri?: string | null`  // primary image URL or null
    - `location?: { lat: number; lng: number }`
    - `locationNickname?: string`  // e.g. “Backyard”
    - `reminderSchedule?: {`
      - `type: string`  // “interval” or “cron”
      - `intervalDays?: number`  // if type == “interval”
      - `timeOfDay?: string`  // e.g. “08:00”
      - `cronExpression?: string`  // if type == “cron”
    - `}`
  - **Timestamps:**
    - `createdAt: Timestamp`
    - `updatedAt: Timestamp`

### `/plants/{plantId}/logs/{logId}`
- Subcollection for recording plant events.
- Each document in `logs` has:
  - `timestamp: Timestamp`
  - `type: string`  // e.g. “watering”, “note”, “fertilizing”, “training”
  - `description: string`
  - `updatedBy: string`  // `userId` of the user who created this log

### `/plants/{plantId}/weatherCache/{YYYY-MM-DD}`
- Cached daily weather data for outdoor plants (document ID is the date).
- Fields:
  - `date: string`  // “YYYY-MM-DD”
  - `temperature: string`  // e.g. “23°C”
  - `humidity: string`  // e.g. “60%”
  - `uvIndex: number`
  - `windSpeed: string`  // e.g. “10 km/h”
  - `summary: string`  // e.g. “Sunny and mild”
  - `fetchedAt: Timestamp`

### **`/plants/{plantId}/progressPics/{picId}`**  ← *NEW*
- Subcollection for storing progress pictures of each plant.
- Each document (identified by `picId`) contains:
  - `imageUrl: string`  // download URL from Firebase Storage
  - `timestamp: Timestamp`  // when the picture was uploaded
  - `caption?: string`  // optional caption or note
- Common usage:
  ```ts
  // To list all progress pics for a plant:
  const progressPicsRef = collection(db, "plants", plantId, "progressPics");
  const snapshot = await getDocs(progressPicsRef);
  snapshot.docs.forEach(doc => {
    const { imageUrl, timestamp, caption } = doc.data();
    // display each image with metadata in the app
  });

### `/notifications/{userId}`
- Stores push notification tokens and topics.

### `/analytics/{userId}_year_{year}`
- Aggregated statistics per user for each year.

### `/invites/{inviteId}`
- Stores plant collaboration invites.
- Fields: `invitedBy`, `invitedUserEmail`, `plantId`, `status`, `createdAt`

---

## 🔹 Queries and Usage Patterns

### Get all plants owned by a user:
```ts
query(collection(db, "plants"), where("owners", "array-contains", userId))
```

### Get logs for a specific plant:
```ts
collection(db, `plants/${plantId}/logs`)
```

### Get user preferences:
```ts
doc(db, `users/${userId}/settings/preferences`)
```

---

## 🔹 Related Types
See `firestoreModels.ts` for full TypeScript interfaces for:
- `Plant`
- `PlantLog`
- `UserSettings`
- `WeatherCacheEntry`
- `NotificationProfile`
- `UserAnalytics`
- `Invite`

---

This schema is designed to be scalable, efficient, and collaborative — ideal for a grow tracking app with real-time data and multiple users per plant.
