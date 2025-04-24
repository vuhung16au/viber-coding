// Import the Firebase SDK
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  // Database URL from environment variables
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Initialize Firebase
let firebaseApp;
let auth;
let db;
let storage;

// Only initialize Firebase if it hasn't been initialized
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  // Initialize services
  auth = getAuth(firebaseApp);
  db = getDatabase(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  // If already initialized, use existing app
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
  db = getDatabase(firebaseApp);
  storage = getStorage(firebaseApp);
}

export { auth, db, storage };