// Set admin status for a specific user
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the .env.local file from the parent directory
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the environment variables
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (parts) {
    env[parts[1]] = parts[2].replace(/^['"]|['"]$/g, '');
  }
});

// Firebase configuration
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// User ID to set as admin
const ADMIN_USER_ID = 'VSQBF6GU7NVTtGEBrnBI1srN3l22';

async function setAdminStatus() {
  try {
    // Set the isAdmin flag to true for the specified user
    const adminRef = ref(database, `users/${ADMIN_USER_ID}/isAdmin`);
    
    // Check current value
    const snapshot = await get(adminRef);
    const currentValue = snapshot.exists() ? snapshot.val() : false;
    
    console.log(`Current admin status for user ${ADMIN_USER_ID}: ${currentValue}`);
    
    // Set new value
    await set(adminRef, true);
    console.log(`Admin status set to true for user ${ADMIN_USER_ID}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin status:', error);
    process.exit(1);
  }
}

// Run the function
setAdminStatus();