# Database Documentation

This document explains the database architecture and implementation of the QuizGame application, including data structures, relationships, and key files related to database interactions.

## Table of Contents
- [Firebase Realtime Database Overview](#firebase-realtime-database-overview)
- [Data Structures](#data-structures)
  - [Quizzes](#quizzes)
  - [Quiz Results](#quiz-results)
  - [User Statistics](#user-statistics)
  - [Global Statistics](#global-statistics)
  - [Users](#users)
  - [Categories](#categories)
- [Important Database Files](#important-database-files)
  - [Configuration Files](#configuration-files)
  - [Database Operations](#database-operations)
  - [Statistics Management](#statistics-management)
  - [Scheduled Functions](#scheduled-functions)
- [Database Relationships](#database-relationships)
- [Data Flow Diagrams](#data-flow-diagrams)

## Firebase Realtime Database Overview

Firebase Realtime Database is a cloud-hosted NoSQL database from Google that stores and synchronizes data across clients in realtime. In the QuizGame application, it serves as the primary data storage solution for:

- Storing quiz content (questions, answers)
- Tracking user results and statistics
- Managing user accounts and profiles
- Maintaining application state and configuration

### Key Features Used

1. **Real-time Data Synchronization**: Allows instant updates across all connected clients
2. **Offline Support**: The app continues to function when users lose connectivity
3. **Security Rules**: Access control rules protect data from unauthorized access
4. **Data Indexing**: Optimizes query performance for statistics and result lookups
5. **Server Timestamps**: Ensures consistent timestamps across all devices

### Database Structure

The Firebase Realtime Database follows a JSON tree structure. In QuizGame, the database is organized into several main collections:

```
quiz-gotitright-default-rtdb/
├── quizzes/
├── quizResults/
├── users/
├── categories/
├── statistics/
│   ├── global/
│   └── users/
└── userStats/
```

## Data Structures

### Quizzes

Each quiz is stored as a document with a unique ID:

```javascript
{
  id: "quiz123",
  title: "Example Quiz",
  description: "A sample quiz",
  categoryId: "category1",
  defaultTimeout: 20,
  isPublic: true,
  isFeatured: false,
  createdBy: "user123",
  createdAt: timestamp,
  questions: [
    {
      id: "q1",
      question: "What is 2+2?",
      answers: [
        { id: "a1", text: "3", isCorrect: false },
        { id: "a2", text: "4", isCorrect: true },
        { id: "a3", text: "5", isCorrect: false }
      ],
      correctAnswer: "a2",
      timeout: 15,  // Optional override of defaultTimeout
      points: 1     // Points value for this question
    }
    // More questions...
  ],
  statistics: {
    played: 42,
    lastPlayed: timestamp
  }
}
```

### Quiz Results

When a user completes a quiz, their results are stored in the `quizResults` collection:

```javascript
{
  userId: "user456",
  quizId: "quiz123",
  score: 85,           // Percentage score
  totalQuestions: 10,
  correctAnswers: 8.5,  // Can be decimal with partial credit
  timeTaken: 142,       // Seconds
  totalPoints: 17,      // Points earned
  totalPossiblePoints: 20,
  date: timestamp
}
```

Results are indexed by both `userId` and `quizId` for efficient querying of a user's complete history or a quiz's result statistics.

### User Statistics

Statistics for each user are tracked in the `statistics/users/{userId}` path:

```javascript
{
  quizzesPlayed: {
    total: 27,
    last24Hours: 2,
    last7Days: 8,
    last30Days: 15,
    history: {
      "timestamp1": { 
        timestamp: timestamp1,
        quizId: "quiz123"
      },
      "timestamp2": { 
        timestamp: timestamp2,
        quizId: "quiz456"
      }
      // Additional history entries
    },
    playDates: [timestamp1, timestamp2, ...]  // Used for time-based calculations
  },
  quizzesCreated: {
    total: 5,
    last24Hours: 0,
    last7Days: 1, 
    last30Days: 3,
    history: {
      "timestamp1": { 
        timestamp: timestamp1,
        quizId: "quiz789"
      }
      // Additional history entries
    },
    creationDates: [timestamp1, ...]  // Used for time-based calculations
  }
}
```

These statistics power the user dashboards, achievements, and leaderboards.

### Global Statistics

Similar to user statistics, global statistics track platform-wide metrics:

```javascript
{
  quizzesPlayed: {
    total: 1458,
    last24Hours: 87,
    last7Days: 423,
    last30Days: 1245,
    playDates: [timestamp1, timestamp2, ...]
  },
  quizzesCreated: {
    total: 342,
    last24Hours: 12,
    last7Days: 78,
    last30Days: 203,
    creationDates: [timestamp1, timestamp2, ...]
  }
}
```

### Users

The `users` collection stores user profiles and preferences:

```javascript
{
  uid: "user123",
  displayName: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  photoURL: "https://example.com/profile.jpg",
  createdAt: timestamp,
  isAdmin: false,
  preferences: {
    theme: "dark",
    language: "en"
    // Additional user preferences
  }
}
```

### Categories

Quiz categories are stored in a dedicated collection:

```javascript
{
  id: "cat1",
  name: "Science",
  description: "Science-related quizzes",
  iconName: "flask",
  order: 1
}
```

## Important Database Files

### Configuration Files

#### `/firebase/config.js`

This file initializes the Firebase app and exports the database connection:

```javascript
// Firebase configuration from environment variables
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, database, auth, storage };
```

### Database Operations

#### `/firebase/database.js`

This file contains core database operations for quizzes and other main entities:

```javascript
// Create a new quiz
export const createQuiz = async (quizData) => {
  const quizzesRef = ref(database, 'quizzes');
  const newQuizRef = push(quizzesRef);
  const quizId = newQuizRef.key;
  
  await set(newQuizRef, {
    title: quizData.title,
    description: quizData.description,
    // Additional fields...
  });
  
  return quizId;
};

// Get all quizzes
export const getAllQuizzes = async () => {
  const quizzesRef = ref(database, 'quizzes');
  const snapshot = await get(quizzesRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

// Get a specific quiz by ID
export const getQuizById = async (quizId) => {
  const quizRef = ref(database, `quizzes/${quizId}`);
  const snapshot = await get(quizRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Additional database operations...
```

### Statistics Management

#### `/firebase/statistics.js`

Handles tracking and updating statistics for users and quizzes:

```javascript
// Update user statistics after playing a quiz
export const updateUserQuizPlayedStats = async (userId) => {
  const userStatsRef = ref(database, `userStats/${userId}`);
  const timestamp = getCurrentTimestamp();
  
  // Get current stats
  const snapshot = await get(userStatsRef);
  let stats = {};
  
  if (snapshot.exists()) {
    stats = snapshot.val();
  }
  
  // Initialize statistics if they don't exist
  stats.quizzesPlayed = stats.quizzesPlayed || {
    total: 0,
    last30Days: 0,
    last7Days: 0,
    last24Hours: 0,
    playDates: stats.quizzesPlayed?.playDates || []
  };
  
  // Update statistics
  stats.quizzesPlayed.playDates.push(timestamp);
  stats.quizzesPlayed.total += 1;
  
  // Calculate time-based stats
  // ... calculation logic
  
  // Update stats in database
  await update(userStatsRef, stats);
  
  // Update global statistics
  await updateGlobalStatistics('played');
  
  return stats;
};

// Record a completed quiz
export async function recordQuizPlayed(userId, quizId, score, totalQuestions, correctAnswers = null, timeTaken = null, totalPoints = null, totalPossiblePoints = null) {
  // Implementation details
}

// Additional statistics functions...
```

### Scheduled Functions

#### `/firebase/functions.js`

Contains Firebase Cloud Functions for scheduled tasks and data maintenance:

```javascript
/**
 * Cloud function that runs daily to refresh time-based statistics.
 * Scheduled to run at midnight every day.
 */
exports.refreshStatistics = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {
  try {
    console.log('Starting statistics refresh job');
    
    const db = admin.database();
    const usersStatsRef = db.ref('statistics/users');
    const usersSnapshot = await usersStatsRef.once('value');
    
    // Process each user's statistics
    // ... implementation details
    
    return null;
  } catch (error) {
    console.error('Error in refreshStatistics function:', error);
    return null;
  }
});

// Additional cloud functions...
```

## Database Relationships

The database follows these key relationships:

1. **User → Quizzes**: One-to-many relationship via `createdBy` field in quizzes
2. **Quiz → Results**: One-to-many relationship (each quiz can have multiple results)
3. **User → Results**: One-to-many relationship (each user can have multiple results)
4. **Category → Quizzes**: One-to-many relationship via `categoryId` field in quizzes
5. **User → Statistics**: One-to-one relationship

## Data Flow Diagrams

### Quiz Creation Flow

```
User → createQuiz() → Firebase Database (quizzes collection)
                    → updateUserQuizCreatedStats() → Firebase Database (statistics)
```

### Quiz Taking Flow

```
User → getQuizById() → Quiz Displayed to User
     → User Completes Quiz → recordQuizPlayed() → Firebase Database (quizResults)
                                               → updateUserQuizPlayedStats() → Firebase Database (statistics)
                                               → updateQuizStatistics() → Firebase Database (quizzes/statistics)
```

### Statistics Update Flow

```
Daily Cloud Function → refreshStatistics() → Calculate Time-Based Metrics
                                         → Update User Statistics
                                         → Update Global Statistics
```
