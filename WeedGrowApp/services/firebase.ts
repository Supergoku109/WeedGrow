// services/firebase.ts
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Depending on the Expo version and environment, the config might be under manifest or expoConfig:
const expoConfig: any =
  // In development with `expo start`, `Constants.manifest` is often defined:
  // In a production/bundled APK or when using expo-router, it's under expoConfig instead.
  (Constants.manifest as any) || Constants.expoConfig;

// Now safely extract extra (your .env values) from whichever is available
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = expoConfig.extra;

// Build the Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase and export Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
