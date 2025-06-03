# Database Schema Documentation

This document provides a comprehensive overview of the QuizGame application's database schema, including relationships between collections, indexing strategy, and data migration plans.

## Database Engine

QuizGame uses Firebase Firestore as its primary database, a NoSQL document-based database. This choice provides:

- Real-time data synchronization
- Automatic scaling
- Offline support
- Rich querying capabilities
- Strong security rules

## Core Collections

### Users Collection

Stores user account information and profile data.

```
users (collection)
└── userId (document)
    ├── uid: string            // Firebase Auth UID
    ├── email: string          // User's email address
    ├── displayName: string    // User's display name
    ├── photoURL: string       // Profile picture URL
    ├── role: string           // "user", "teacher", "admin"
    ├── createdAt: timestamp   // Account creation date
    ├── lastLogin: timestamp   // Last login timestamp
    ├── isActive: boolean      // Account status
    ├── settings: map          // User preferences
    │   ├── language: string   // UI language preference
    │   ├── theme: string      // UI theme preference
    │   └── notifications: boolean // Notification preferences
    └── metadata: map          // Additional user metadata
```

### Quizzes Collection

Stores quiz details, questions, and answers.

```
quizzes (collection)
└── quizId (document)
    ├── title: string          // Quiz title
    ├── description: string    // Quiz description
    ├── authorId: string       // Reference to users collection
    ├── categoryId: string     // Reference to categories collection
    ├── difficulty: string     // "easy", "medium", "hard"
    ├── tags: array<string>    // Search tags
    ├── timeLimit: number      // Time limit in seconds (0 = no limit)
    ├── isPublic: boolean      // Visibility status
    ├── createdAt: timestamp   // Creation timestamp
    ├── updatedAt: timestamp   // Last update timestamp
    ├── totalQuestions: number // Number of questions
    ├── totalAttempts: number  // Number of times quiz was taken
    ├── averageScore: number   // Average user score (0-100)
    ├── settings: map          // Quiz-specific settings
    │   ├── showCorrectAnswers: boolean  // Show answers after completion
    │   ├── randomizeQuestions: boolean  // Randomize question order
    │   ├── passPercentage: number       // Required % to pass
    │   └── allowRetries: boolean        // Allow multiple attempts
    └── questions: array       // Nested questions data
        └── question (map)
            ├── id: string             // Question ID
            ├── text: string           // Question text
            ├── type: string           // "multiple-choice", "true-false", "matching", etc.
            ├── points: number         // Points for correct answer
            ├── timeLimit: number      // Time limit for question (optional)
            ├── explanation: string    // Explanation for correct answer
            ├── hasImage: boolean      // Indicates if question has image
            ├── imageURL: string       // URL to question image (if applicable)
            ├── options: array         // Answer options
            │   └── option (map)
            │       ├── id: string     // Option ID
            │       ├── text: string   // Option text
            │       └── isCorrect: boolean // Whether this is the correct answer
            └── metadata: map          // Additional question metadata
                └── difficulty: string // Question-specific difficulty
```

### Categories Collection

Organizes quizzes into categories.

```
categories (collection)
└── categoryId (document)
    ├── name: string           // Category name
    ├── description: string    // Category description
    ├── icon: string           // Category icon identifier
    ├── color: string          // Category color code
    ├── parentId: string       // Parent category (for hierarchical categories)
    ├── orderIndex: number     // For custom ordering
    ├── isActive: boolean      // Category status
    ├── createdAt: timestamp   // Creation timestamp
    └── updatedAt: timestamp   // Last update timestamp
```

### Quiz Attempts Collection

Records individual user attempts at quizzes.

```
quizAttempts (collection)
└── attemptId (document)
    ├── userId: string         // Reference to users collection
    ├── quizId: string         // Reference to quizzes collection
    ├── startedAt: timestamp   // When attempt was started
    ├── completedAt: timestamp // When attempt was completed
    ├── timeSpent: number      // Total seconds spent
    ├── score: number          // Total points achieved
    ├── percentage: number     // Percentage score (0-100)
    ├── isPassed: boolean      // Whether user passed the quiz
    ├── answers: array         // User's answers
    │   └── answer (map)
    │       ├── questionId: string     // Question ID
    │       ├── selectedOptionId: string // Selected option ID
    │       ├── isCorrect: boolean     // Whether answer was correct
    │       ├── timeSpent: number      // Time spent on this question
    │       └── pointsEarned: number   // Points earned for this question
    └── metadata: map          // Additional attempt metadata
```

### Statistics Collection

Stores aggregated statistics data.

```
statistics (collection)
└── statId (document)
    ├── type: string           // "user", "quiz", "category", "global"
    ├── referenceId: string    // Referenced entity ID
    ├── period: string         // "daily", "weekly", "monthly", "all-time"
    ├── date: timestamp        // Date of statistics
    ├── metrics: map           // Stored metrics
    │   ├── totalAttempts: number      // Number of attempts
    │   ├── averageScore: number       // Average score
    │   ├── completionRate: number     // Percentage of completions
    │   ├── averageTimeSpent: number   // Average time spent
    │   └── difficultQuestions: array  // List of most missed questions
    └── updatedAt: timestamp   // Last update timestamp
```

### Feedback Collection

Stores user feedback on quizzes.

```
feedback (collection)
└── feedbackId (document)
    ├── userId: string         // Reference to users collection
    ├── quizId: string         // Reference to quizzes collection
    ├── rating: number         // Rating (1-5)
    ├── comment: string        // Feedback comment
    ├── createdAt: timestamp   // Creation timestamp
    ├── isResolved: boolean    // Whether feedback was addressed
    └── adminResponse: string  // Response from admin (if any)
```

## Relationships Between Collections

1. **User to Quiz (One-to-Many)**:
   - A user can create multiple quizzes
   - Implemented via the `authorId` field in the quizzes collection

2. **Quiz to Category (Many-to-One)**:
   - Many quizzes can belong to one category
   - Implemented via the `categoryId` field in the quizzes collection

3. **User to Quiz Attempt (One-to-Many)**:
   - A user can have multiple quiz attempts
   - Implemented via the `userId` field in the quizAttempts collection

4. **Quiz to Quiz Attempt (One-to-Many)**:
   - A quiz can have multiple attempts by different users
   - Implemented via the `quizId` field in the quizAttempts collection

5. **User to Feedback (One-to-Many)**:
   - A user can provide feedback on multiple quizzes
   - Implemented via the `userId` field in the feedback collection

## Indexing Strategy

### Single-Field Indexes

1. **Users Collection**:
   - `email` (for login and search)
   - `role` (for filtering users by role)
   - `isActive` (for filtering active users)

2. **Quizzes Collection**:
   - `authorId` (for finding quizzes by author)
   - `categoryId` (for finding quizzes by category)
   - `isPublic` (for filtering public quizzes)
   - `difficulty` (for filtering by difficulty)
   - `tags` (for searching by tags)

3. **Quiz Attempts Collection**:
   - `userId` (for finding attempts by user)
   - `quizId` (for finding attempts for a specific quiz)
   - `completedAt` (for finding recent attempts)

4. **Categories Collection**:
   - `parentId` (for hierarchical category queries)
   - `isActive` (for filtering active categories)
   - `orderIndex` (for ordered display)

5. **Feedback Collection**:
   - `quizId` (for finding feedback for specific quizzes)
   - `rating` (for filtering by rating)
   - `isResolved` (for finding unresolved feedback)

### Compound Indexes

1. **Quizzes Collection**:
   - `categoryId, createdAt` (for recent quizzes by category)
   - `authorId, updatedAt` (for recent quizzes by author)
   - `isPublic, difficulty, createdAt` (for filtered quiz browsing)
   - `tags, isPublic` (for searching public quizzes by tags)

2. **Quiz Attempts Collection**:
   - `userId, completedAt` (for user's recent attempts)
   - `quizId, score` (for leaderboards)
   - `userId, quizId` (for finding specific user attempts on specific quizzes)

3. **Statistics Collection**:
   - `type, referenceId` (for finding statistics for specific entities)
   - `type, period, date` (for time-series analysis)

## Data Validation Rules

Firebase security rules are implemented to enforce the following constraints:

1. **Users Collection**:
   - Only admins can change user roles
   - Users can only modify their own user documents
   - Email fields must match authenticated email

2. **Quizzes Collection**:
   - Only authors and admins can edit quizzes
   - Public quizzes must have at least one question
   - All questions must have at least one correct answer

3. **Quiz Attempts Collection**:
   - Users can only create attempts for themselves
   - Completed attempts cannot be modified
   - Scores must be calculated server-side

## Database Access Patterns

### Common Queries

1. **Get user's created quizzes**:
   ```javascript
   db.collection('quizzes').where('authorId', '==', userId).get()
   ```

2. **Find public quizzes by category**:
   ```javascript
   db.collection('quizzes')
     .where('categoryId', '==', categoryId)
     .where('isPublic', '==', true)
     .get()
   ```

3. **Get user's quiz attempts**:
   ```javascript
   db.collection('quizAttempts')
     .where('userId', '==', userId)
     .orderBy('completedAt', 'desc')
     .get()
   ```

4. **Get quiz leaderboard**:
   ```javascript
   db.collection('quizAttempts')
     .where('quizId', '==', quizId)
     .where('isPassed', '==', true)
     .orderBy('score', 'desc')
     .limit(10)
     .get()
   ```

### Performance Considerations

1. **Denormalization Strategy**:
   - Quiz documents contain question details to avoid separate queries
   - User profile data is partially duplicated in quiz attempts for faster rendering
   - Category information is cached and updated asynchronously

2. **Pagination**:
   - All list views implement cursor-based pagination
   - Default page size is 20 items
   - Implemented via the `startAfter()` Firestore method

## Data Migration Plans

### Version 1.0 to 2.0 Migration

1. **Schema Changes**:
   - Adding `timeLimit` field to questions
   - Moving from flat questions structure to nested array

2. **Migration Script**:
   - Located at `priv-vuhung-utils/migrate-quiz-timeouts.js`
   - Uses Firebase batch operations for atomic updates
   - Includes rollback capability

3. **Migration Process**:
   1. Take database snapshot backup
   2. Run migration in staging environment
   3. Validate migrated data
   4. Schedule production migration during low-traffic period
   5. Run post-migration validation

### Future Migration Considerations

1. **Splitting Quiz Content**:
   - For large quizzes, questions may be moved to subcollections
   - Migration path defined for incremental adoption

2. **Enhanced Statistics**:
   - Adding more granular statistics tracking
   - Preparing aggregation methods for historical data

## Backup and Restore Strategy

1. **Regular Backups**:
   - Daily automated Firestore exports to Google Cloud Storage
   - Weekly full exports for disaster recovery

2. **Selective Restore Process**:
   - Tools for selective restoration of specific collections
   - Validation procedures for restored data

3. **Data Retention Policies**:
   - User data: Retained as long as account is active
   - Quiz attempts: Retained for 2 years
   - Anonymous data: Retained indefinitely for analytics

## Database Maintenance

1. **Monitoring**:
   - Regular performance monitoring of read/write operations
   - Monitoring of index usage and optimization

2. **Cleanup Jobs**:
   - Scheduled removal of incomplete quiz attempts
   - Archiving of inactive quizzes and user accounts

3. **Optimization**:
   - Quarterly review of index usage
   - Performance optimization for frequently accessed data

## Documentation Versioning

WIP 