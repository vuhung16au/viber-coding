// Utility script to truncate Firebase Realtime Database data
// This script will remove all data under specified paths: answers, questions, quizzes, results, statistics

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
require('dotenv').config({ path: '../quiz-app-temp/.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Paths to truncate
const pathsToTruncate = [
  'answers',
  'questions',
  'quizzes',
  'results',
  'statistics'
];

/**
 * Truncate data at the specified path by setting it to null
 * @param {string} path - The database path to truncate
 * @returns {Promise} - Promise that resolves when truncation is complete
 */
async function truncatePath(path) {
  console.log(`Truncating data at path: ${path}...`);
  const dbRef = ref(database, path);
  try {
    await set(dbRef, null);
    console.log(`Successfully truncated data at path: ${path}`);
    return true;
  } catch (error) {
    console.error(`Error truncating data at path ${path}:`, error);
    return false;
  }
}

/**
 * Main function to truncate all specified paths
 */
async function truncateAllPaths() {
  console.log('Starting database truncation process...');
  
  try {
    for (const path of pathsToTruncate) {
      await truncatePath(path);
    }
    console.log('All paths have been successfully truncated.');
  } catch (error) {
    console.error('An error occurred during the truncation process:', error);
  } finally {
    console.log('Truncation process completed.');
    process.exit(0);
  }
}

// Run the truncation process
truncateAllPaths();