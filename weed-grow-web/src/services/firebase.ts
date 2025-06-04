import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXb90WBQcnldQa0wibaEfKMHGh1Z-G3P8",
  authDomain: "weed-grow.firebaseapp.com",
  projectId: "weed-grow",
  storageBucket: "weed-grow.appspot.com", // fixed typo here too
  messagingSenderId: "23884971165",
  appId: "1:23884971165:web:be76d378e5523ba94aa874",
  measurementId: "G-BYSP407E4V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);
