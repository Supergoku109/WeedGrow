/**
 * seedFirestore.ts
 *
 * This script uses Firebase Admin SDK to seed Firestore with:
 *  - users
 *  - user settings
 *  - plants
 *  - plant logs
 *  - plant weatherCache
 *  - plant progress pictures (NEW)
 *  - notifications
 *  - analytics
 *  - invites
 *
 * To run:
 *   ts-node seedFirestore.ts
 * (or compile to JS and run with `node`)
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

// ─── Initialize Admin SDK ─────────────────────────────────────────────────────

const serviceAccount = JSON.parse(
  readFileSync("serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // If you want to seed Storage, uncomment and configure:
  // storageBucket: "<YOUR_FIREBASE_STORAGE_BUCKET_URL>",
});

const db = admin.firestore();
const now = admin.firestore.Timestamp.now();

async function seedFirestore() {
  // ─── 1) USERS ───────────────────────────────────────────────────────────────
  const userId = "testUser123";
  await db.collection("users").doc(userId).set({
    displayName: "Zane G",
    email: "zane@example.com",
    joinedAt: now,
    lastLogin: now,
    plantRefs: ["plant123"],
    hasAcceptedTOS: true,
    profileImage: null, // or a URL to their profile photo in Storage
  });

  // ─── 2) USER SETTINGS ──────────────────────────────────────────────────────
  await db
    .collection("users")
    .doc(userId)
    .collection("settings")
    .doc("preferences")
    .set({
      defaultEnvironment: "outdoor",
      preferredUnits: "metric",
      darkMode: true,
      defaultReminderTime: "08:00",
      notificationPreferences: {
        wateringReminders: true,
        newLogActivity: true,
        tips: true,
      },
    });

  // ─── 3) PLANTS ─────────────────────────────────────────────────────────────
  const plantId = "plant123";
  await db.collection("plants").doc(plantId).set({
    name: "Northern Lights",
    strain: "Indica",
    owners: [userId],
    growthStage: "germination",
    ageDays: 0,
    status: "active",
    environment: "outdoor",
    plantedIn: "pot",
    potSize: "20L",
    wateringFrequency: "every 2 days",
    fertilizer: "BioGrow",
    sunlightExposure: "Full sun",
    trainingTags: ["LST"],
    pests: ["aphids"],
    notes: "Doing great so far.",
    imageUri: null, // or a URL to a primary plant image
    waterLevel: 1,
    location: { lat: -34.0, lng: 18.5 },
    locationNickname: "Backyard",
    reminderSchedule: {
      type: "interval",
      intervalDays: 2,
      timeOfDay: "08:00",
    },
    createdAt: now,
    updatedAt: now,
  });

  // ─── 4) PLANT LOGS ─────────────────────────────────────────────────────────
  await db
    .collection("plants")
    .doc(plantId)
    .collection("logs")
    .add({
      timestamp: now,
      type: "watering",
      description: "Gave 500ml of water",
      updatedBy: userId,
    });

  // ─── 5) WEATHER CACHE ──────────────────────────────────────────────────────
  const weatherCollection = db
    .collection("plants")
    .doc(plantId)
    .collection("weatherCache");

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const yesterday = new Date(Date.now() - 86400000);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  const weatherSamples = [
    {
      date: fmt(yesterday),
      forecasted: false,
      source: "OpenWeatherMap",
      temperature: 20,
      humidity: 55,
      windSpeed: 8,
      rainfall: 1,
      uvIndex: 4,
      weatherSummary: "Partly cloudy",
      hourlySummary: { peakTemp: 21, rainHours: 1 },
      dewPoint: 12,
      cloudCoverage: 40,
      windGust: 12,
      sunrise: "06:10",
      sunset: "18:30",
      pop: 0.2,
    },
    {
      date: fmt(today),
      forecasted: false,
      source: "OpenWeatherMap",
      temperature: 22,
      humidity: 60,
      windSpeed: 10,
      rainfall: 0,
      uvIndex: 6,
      weatherSummary: "Sunny and warm",
      hourlySummary: { peakTemp: 23, rainHours: 0 },
      dewPoint: 13,
      cloudCoverage: 20,
      windGust: 15,
      sunrise: "06:15",
      sunset: "18:35",
      pop: 0.1,
    },
    {
      date: fmt(tomorrow),
      forecasted: true,
      source: "OpenWeatherMap",
      temperature: 19,
      humidity: 70,
      windSpeed: 15,
      rainfall: 5,
      uvIndex: 3,
      weatherSummary: "Expected showers",
      hourlySummary: { peakTemp: 20, rainHours: 3 },
      dewPoint: 11,
      cloudCoverage: 80,
      windGust: 30,
      sunrise: "06:20",
      sunset: "18:40",
      pop: 0.7,
    },
  ];

  await Promise.all(
    weatherSamples.map((entry) =>
      weatherCollection.doc(entry.date).set({
        ...entry,
        fetchedAt: now,
      })
    )
  );

  // ─── 6) PROGRESS PICTURES (NEW) ─────────────────────────────────────────────
  //
  // We’ll create a subcollection called “progressPics” under each plant.
  // In a real setup, you’d upload actual image files to Storage first, then
  // use their download URLs here. For demonstration, we’ll use placeholder URLs.

  const progressPicsCollection = db
    .collection("plants")
    .doc(plantId)
    .collection("progressPics");

  // Example #1: “Day 1” snapshot
  await progressPicsCollection.add({
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/progressPics%2Fd1_northern_lights.jpg?alt=media", 
    timestamp: now,
    caption: "Day 1 – just sprouted!",
  });

  // Example #2: “Day 10” snapshot
  await progressPicsCollection.add({
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/progressPics%2Fd10_northern_lights.jpg?alt=media",
    timestamp: now,
    caption: "Day 10 – leaves emerging.",
  });

  // ─── 7) NOTIFICATIONS ──────────────────────────────────────────────────────
  await db.collection("notifications").doc(userId).set({
    deviceTokens: ["abc123xyz"],
    subscribedTopics: ["watering", "growthTips"],
    lastUpdated: now,
  });

  // ─── 8) ANALYTICS ───────────────────────────────────────────────────────────
  await db.collection("analytics").doc(`${userId}_year_2025`).set({
    year: 2025,
    totalWaterings: 1,
    totalFertilizations: 0,
    completedStages: {
      germination: 0,
      seedling: 0,
      vegetative: 0,
      flowering: 0,
    },
    pestsEncountered: ["aphids"],
    mostUsedTrainingTags: ["LST"],
    totalPlantsCreated: 1,
    totalPlantsArchived: 0,
  });

  // ─── 9) INVITES ──────────────────────────────────────────────────────────────
  await db.collection("invites").doc("inviteABC").set({
    invitedBy: userId,
    invitedUserEmail: "friend@example.com",
    plantId,
    status: "pending",
    createdAt: now,
  });

  console.log("✅ Firestore seeded successfully!");
}

seedFirestore().catch(console.error);
