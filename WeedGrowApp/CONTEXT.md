# WeedGrow Firebase Firestore Schema

This document describes the structure of the Firestore database used in the WeedGrow app.
It helps Codex and other AI agents understand how your app stores and interacts with data.

---

## 🔹 Top-Level Collections

### `/users/{userId}`
- Contains user profile info.
- Fields: `displayName`, `email`, `joinedAt`, `lastLogin`, `plantRefs[]`, etc.

### `/users/{userId}/settings`
- Stores user preferences.
- Fields: `defaultEnvironment`, `preferredUnits`, `darkMode`, `defaultReminderTime`, `notificationPreferences{}`

### `/plants/{plantId}`
- Main plant document that can be shared by multiple users.
- Fields include:
  - `owners[]`, `name`, `strain`, `growthStage`, `status`, `environment`, `plantedIn`
  - Optional fields: `potSize`, `wateringFrequency`, `trainingTags[]`, `reminderSchedule{}`
  - Timestamps: `createdAt`, `updatedAt`

### `/plants/{plantId}/logs/{logId}`
- Subcollection for recording plant events.
- Types include: `watering`, `note`, `fertilizing`, `training`, etc.

### `/plants/{plantId}/weatherCache/{YYYY-MM-DD}`
- Cached daily weather data for outdoor plants.
- Fields: `temperature`, `humidity`, `uvIndex`, `summary`, etc.

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
