# Firebase Realtime Database Structure

This document details the structure and relationships in the Firebase Realtime Database for the Quiz Game project.

## Main Collections

The database is organized into several main collections:

1. `quizzes` - Contains all quiz information
2. `questions` - Stores individual questions
3. `answers` - Stores answer options for questions
4. `results` - Stores quiz attempt results
5. `users` - Stores user information and references
6. `statistics` - Tracks usage statistics (plays, creations)
7. `usernames` - Maps usernames to user IDs
8. `quizResults` - Alternative collection for quiz results

## Collection Details and Relationships

### Quizzes Collection
Each quiz document contains:
- `title`: String - Name of the quiz
- `description`: String - Description of the quiz
- `coverImage`: String - URL to the quiz cover image
- `category`: String - Category of the quiz (e.g., "General Knowledge", "Science")
- `tags`: Array or String - Tags associated with the quiz
- `questions`: Array - References to question IDs in the questions collection
- `userId`: String - ID of the user who created the quiz
- `createdAt`: Timestamp - When the quiz was created
- `statistics`: Object - Contains play counts and timestamps
  - `played`: Number - Count of times the quiz was played
  - `lastPlayed`: Timestamp - When the quiz was last played

### Questions Collection
Each question document contains:
- `question`: String - The text of the question
- `answers`: Array - References to answer IDs in the answers collection

### Answers Collection
Each answer document contains:
- `answer`: String - The text of the answer option
- `isCorrect`: Boolean - Whether this is the correct option

### Results Collection
Each result document contains:
- `quizId`: String - ID of the quiz that was taken
- `userId`: String - ID of the user who took the quiz
- `score`: Number - Score as a percentage (0-100)
- `correctAnswers`: Number - Count of correctly answered questions
- `totalQuestions`: Number - Total number of questions in the quiz
- `timeTaken`: Number - Time taken to complete the quiz in seconds
- `date`: Timestamp - When the quiz was taken
- `category`: String - Category of the quiz

### Users Collection
Each user document contains:
- `username`: String - Unique username
- `displayName`: String - Display name of the user
- `email`: String - Email address of the user
- `photoURL`: String - URL to the user's profile picture
- `profile`: Object - User profile information
  - `bio`: String - User biography
  - `favoriteCategories`: Array - Categories the user enjoys
  - Other profile fields
- `results`: Object - Map of result IDs to boolean values (for quick lookups)

### Statistics Collection
The statistics collection has two main subcollections:

#### Users Statistics
Each user statistics document contains:
- `quizzesCreated`: Object - Statistics about quizzes created by the user
  - `total`: Number - Total number of quizzes created
  - `last24Hours`: Number - Quizzes created in the last 24 hours
  - `last7Days`: Number - Quizzes created in the last 7 days
  - `last30Days`: Number - Quizzes created in the last 30 days
  - `creationDates`: Array - Timestamps of quiz creations
  - `history`: Object - Detailed history of quiz creations with timestamps
- `quizzesPlayed`: Object - Statistics about quizzes played by the user
  - `total`: Number - Total number of quizzes played
  - `last24Hours`: Number - Quizzes played in the last 24 hours
  - `last7Days`: Number - Quizzes played in the last 7 days
  - `last30Days`: Number - Quizzes played in the last 30 days
  - `playDates`: Array - Timestamps of quiz plays
  - `history`: Object - Detailed history of quiz plays with timestamps

#### Global Statistics
Similar structure to user statistics but aggregated across all users:
- `quizzesCreated`: Object - Global statistics about quiz creation
- `quizzesPlayed`: Object - Global statistics about quiz plays

### Usernames Collection
Maps usernames to user IDs for username uniqueness enforcement:
- Key: Username string
- Value: User ID string

### QuizResults Collection
Alternative collection for storing quiz results with similar structure to the results collection.

## Relationships Between Collections

The database implements a denormalized structure with references between collections:

1. **Quiz → Questions**: Each quiz contains an array of question IDs that reference documents in the questions collection.

2. **Question → Answers**: Each question contains an array of answer IDs that reference documents in the answers collection.

3. **Result → Quiz and User**: Each result references both a quiz ID and a user ID.

4. **User → Results**: Each user document contains a results object that maps result IDs to boolean values for quick lookups.

5. **Statistics → User**: Statistics are organized by user ID.

## Data Flow Example

When creating a quiz:
1. Answer documents are created first in the `answers` collection
2. Question documents are created in the `questions` collection, referencing the answer IDs
3. A quiz document is created in the `quizzes` collection, referencing the question IDs
4. Statistics are updated in the `statistics` collection

When taking a quiz:
1. The quiz document is fetched from the `quizzes` collection
2. Questions are fetched from the `questions` collection using the question IDs
3. Answers are fetched from the `answers` collection using the answer IDs
4. After completion, a result document is created in the `results` collection
5. A reference to the result is added to the user's document in the `users` collection
6. Statistics are updated in the `statistics` collection

This structure provides efficient querying while maintaining logical separation of data types.