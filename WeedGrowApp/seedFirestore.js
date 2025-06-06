const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedFirestore() {
  const userId = "testUser123";
  const plantId = "plant123";
  const now = admin.firestore.Timestamp.now();

  // USERS
  await db.collection("users").doc(userId).set({
    displayName: "Zane G",
    email: "zane@example.com",
    joinedAt: now,
    lastLogin: now,
    plantRefs: [plantId],
    hasAcceptedTOS: true,
    profileImage: null,
  });

  // USER SETTINGS
  await db.collection("users").doc(userId).collection("settings").doc("preferences").set({
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

  // PLANTS
  await db.collection("plants").doc(plantId).set({
    name: "Northern Lights",
    strain: "Indica",
    owners: [userId],
    growthStage: "germination",
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
    imageUri: null,
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

  // LOGS
  await db.collection("plants").doc(plantId).collection("logs").add({
    timestamp: now,
    type: "watering",
    description: "Gave 500ml of water",
    updatedBy: userId,
  });

  // WEATHER CACHE
  await db.collection("plants").doc(plantId).collection("weatherCache").doc("2025-06-06").set({
    date: "2025-06-06",
    temperature: "23°C",
    humidity: "60%",
    uvIndex: 5,
    windSpeed: "10 km/h",
    summary: "Sunny and mild",
    fetchedAt: now,
  });

  // NOTIFICATIONS
  await db.collection("notifications").doc(userId).set({
    deviceTokens: ["abc123xyz"],
    subscribedTopics: ["watering", "growthTips"],
    lastUpdated: now,
  });

  // ANALYTICS
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

  // INVITES
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
