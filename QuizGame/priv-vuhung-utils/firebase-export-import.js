#!/usr/bin/env node
/**
 * Firebase Database Export/Import Utility
 * 
 * This CLI tool allows exporting and importing data from all tables in a Firebase Realtime Database.
 * Usage:
 *   - Export: node firebase-export-import.js --export
 *   - Import: node firebase-export-import.js --import <filename>
 * 
 * The exported file will be named: quiz-firebase-YYYY-MM-DD-HHMMSS.json
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase configuration
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

/**
 * Exports all data from Firebase to a JSON file
 */
async function exportData() {
  try {
    console.log('Starting Firebase data export...');
    
    // Get the root reference to fetch all data
    const rootRef = ref(database, '/');
    const snapshot = await get(rootRef);
    
    if (!snapshot.exists()) {
      console.log('No data available in the database.');
      process.exit(0);
    }
    
    const data = snapshot.val();
    
    // Create filename with current datetime
    const now = new Date();
    const dateStr = now.toISOString()
      .replace(/T/, '-')
      .replace(/:/g, '')
      .replace(/\..+/, '');
    
    const filename = `quiz-firebase-${dateStr}.json`;
    
    // Write data to file
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`Export complete! Data saved to ${filename}`);
    console.log(`Total exported records: ${Object.keys(data).length} root collections`);
    
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

/**
 * Imports data from a JSON file to Firebase
 * @param {string} filename - Path to the JSON file
 */
async function importData(filename) {
  try {
    if (!filename) {
      console.error('Error: Import requires a filename parameter.');
      console.log('Usage: node firebase-export-import.js --import <filename>');
      process.exit(1);
    }
    
    console.log(`Starting Firebase data import from ${filename}...`);
    
    // Check if file exists
    if (!fs.existsSync(filename)) {
      console.error(`Error: File ${filename} does not exist.`);
      process.exit(1);
    }
    
    // Read and parse the file
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    // Confirm with user before proceeding
    console.log('WARNING: This will overwrite existing data in your Firebase database.');
    console.log('Press CTRL+C to cancel or wait 5 seconds to continue...');
    
    // Wait for 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Import data to Firebase
    const rootRef = ref(database, '/');
    await set(rootRef, data);
    
    console.log('Import complete! Data has been written to Firebase.');
    
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Truncates all data in the Firebase database
 */
async function truncateData() {
  try {
    console.log('Preparing to truncate all data from Firebase database...');
    
    // Confirm with user before proceeding
    console.log('WARNING: This will DELETE ALL DATA in your Firebase database.');
    console.log('This action cannot be undone!');
    console.log('Press CTRL+C to cancel or wait 10 seconds to continue...');
    
    // Wait for 10 seconds before proceeding to give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // After waiting, provide one more confirmation prompt
    console.log('FINAL WARNING: Proceeding with database truncation in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Truncate data by setting root to empty object
    const rootRef = ref(database, '/');
    await set(rootRef, {});
    
    console.log('Truncate complete! All data has been removed from Firebase.');
    
  } catch (error) {
    console.error('Truncate failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main function to handle CLI arguments
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Firebase Database Export/Import Utility

Usage:
  Export:    node firebase-export-import.js --export
  Import:    node firebase-export-import.js --import <filename>
  Truncate:  node firebase-export-import.js --truncate

Options:
  --export              Export all data from Firebase database
  --import <filename>   Import data from specified JSON file
  --truncate            Remove all data from Firebase database
  --help, -h            Show this help message
`);
    process.exit(0);
  }
  
  if (args[0] === '--export') {
    exportData();
  } else if (args[0] === '--import') {
    importData(args[1]);
  } else if (args[0] === '--truncate') {
    truncateData();
  } else {
    console.error('Error: Unknown command. Use --help for usage information.');
    process.exit(1);
  }
}

// Run the program
main();