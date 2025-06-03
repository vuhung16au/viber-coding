# Quiz Logic Documentation

This document outlines the complete logic flow of the QuizGame application, including how quizzes are created, how users interact with quizzes, what happens when a quiz is completed, and how statistics are tracked and displayed.

## Table of Contents
- [Quiz Creation Flow](#quiz-creation-flow)
- [Quiz Taking Flow](#quiz-taking-flow)
- [Post-Quiz Completion Logic](#post-quiz-completion-logic)
- [Statistics Tracking](#statistics-tracking)
- [Data Structures](#data-structures)

## Quiz Creation Flow

### Overview
The quiz creation process is implemented as a multi-step form that guides users through creating a complete quiz with questions and answers. The process is managed by the `QuizFormContext` which maintains the state throughout the steps.

### Step 1: Basic Information
Users provide basic quiz metadata:
- Title
- Description
- Category
- Default timeout value (seconds per question)
- Visibility settings (public/private)
- Featured status

### Step 2: Question Creation
Users can add multiple questions to the quiz. For each question:
- Question text (supports MathJax for mathematical expressions)
- Multiple answer choices
- Marking the correct answer
- Option to set custom timeout for specific questions
- Point value for the question (defaults to 1)

Users can:
- Add new questions
- Edit existing questions
- Delete questions
- Reorder questions using drag-and-drop

### Step 3: Review & Submit
Users review their complete quiz before final submission:
- Preview all questions and answers
- Check quiz settings
- Submit the quiz to the database

### Technical Implementation
The quiz creation flow is implemented through several key components:

1. **Context Provider**:
   - `QuizFormProvider` in `QuizFormContext.js` manages the state and provides methods for the entire form process

2. **Form Steps**:
   - `BasicInfoStep.js`: Handles basic quiz metadata
   - `QuestionsStep.js`: Interface for creating and editing questions
   - `ReviewStep.js`: Final review before submission

3. **UI Components**:
   - `QuestionEditor.js`: UI for creating/editing individual questions
   - `QuestionDragDropList.js`: Reorderable list of questions

4. **Form Submission**:
   - When a quiz is submitted, data is validated and saved to Firebase
   - Each question gets a unique ID
   - Answer options are stored with correct/incorrect flags

## Quiz Taking Flow

### Quiz Loading
When a user visits a quiz page (`/[lang]/quiz/[id]/[slug]/page.js`):
1. Basic quiz metadata is loaded first
2. Questions are loaded on-demand as the user progresses through the quiz
3. A QR code is displayed for sharing the quiz with others

### Starting a Quiz
1. User clicks "Start" to begin the quiz
2. Timer for the first question begins
3. Keyboard shortcuts are activated (A/B/C/D for answers, N for next, P for previous)

### Answering Questions
For each question:
1. The `Question` component displays:
   - Question text (with MathJax rendering if needed)
   - Multiple choice answers
   - Timer countdown based on the question's timeout value

2. User interaction:
   - Users can select an answer by clicking or using keyboard shortcuts
   - Selected answers are highlighted
   - Users can navigate between questions using next/previous buttons

3. Timeout handling:
   - If the timer reaches zero, the question is automatically marked as "timed-out"
   - The system advances to the next question or finishes the quiz if it's the last question

### Technical Implementation
1. **Question Display**:
   - `Question.js` component handles the display and timing of individual questions
   - Questions are dynamically fetched and cached as users progress
   - MathJax support for mathematical expressions

2. **Timer Logic**:
   - Each question has an independent timer
   - Timer color changes (green → yellow → red) as time decreases
   - Automatic timeout handling advances to next question

3. **Answer Tracking**:
   - User answers are stored in the `userAnswers` array
   - Timed-out questions are marked with 'timed-out'

## Post-Quiz Completion Logic

### Results Calculation
When a quiz is completed:
1. The `calculateScore` function determines:
   - Number of correct answers
   - Total score (percentage)
   - Points earned (if using weighted questions)

2. Performance categorization:
   - 90%+: "Excellent! You're a genius!"
   - 70-89%: "Great job! Well done!"
   - 50-69%: "Good effort! Keep learning!"
   - Below 50%: "Keep practicing! You'll get better!"

### Results Display
The `QuizResults` component displays:
1. Score summary:
   - Number of correct questions
   - Percentage score
   - Points earned (if applicable)
   - Performance message

2. Question review:
   - Each question with the user's answer and the correct answer
   - Visual indicators for correct/incorrect responses
   - Option to request AI-generated explanations for incorrect answers

3. Action options:
   - Retry the quiz
   - Export results to PDF

### Technical Implementation
1. **QuizResults Component**:
   - Displays the complete results summary
   - Provides question-by-question review
   - Handles explanation generation via API

2. **Explanation Feature**:
   - On-demand explanations use the `/api/quiz/explanation` endpoint
   - AI-generated explanations clarify why an answer was correct/incorrect

3. **PDF Export**:
   - Users can export their quiz results to PDF format
   - Exports include question details and performance metrics

## Statistics Tracking

### Data Collection Points
Statistics are recorded at multiple points:
1. **Quiz Creation**: When a user creates a new quiz
2. **Quiz Completion**: When a user finishes a quiz

### User Statistics
For each user, the system tracks:
1. **Quizzes Created**:
   - Total count
   - Last 24 hours
   - Last 7 days
   - Last 30 days
   - Complete history with timestamps

2. **Quizzes Played**:
   - Total count
   - Last 24 hours
   - Last 7 days
   - Last 30 days
   - Complete history with timestamps

### Quiz Statistics
For each quiz, the system tracks:
1. **Play Count**: Number of times the quiz has been taken
2. **Average Score**: Average performance across all users
3. **Last Played**: Timestamp of most recent play

### Results Recording
When a quiz is completed, detailed results are saved:
1. User ID
2. Quiz ID
3. Score (percentage)
4. Number of correct answers
5. Total questions
6. Time taken (in seconds)
7. Points earned & possible points
8. Timestamp

### Technical Implementation
1. **Firebase Functions**:
   - `recordQuizCreated` updates statistics when a quiz is created
   - `recordQuizPlayed` updates statistics when a quiz is completed
   - `updateUserQuizPlayedStats` updates time-based metrics

2. **Data Structure**:
   - User statistics are stored under `statistics/users/{userId}`
   - Quiz results are stored under `quizResults`
   - Quiz play counts are stored in `quizzes/{quizId}/statistics`

3. **Time-Based Calculations**:
   - The system uses timestamp comparison to calculate activity within specific time periods
   - Constants for time periods: `ONE_DAY`, `SEVEN_DAYS`, `THIRTY_DAYS`

## Data Structures

### Quiz Object
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

### Quiz Result Object
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

### User Statistics Object
```javascript
{
  quizzesPlayed: {
    total: 27,
    last24Hours: 2,
    last7Days: 8,
    last30Days: 15,
    history: {
      "timestamp1": { timestamp: timestamp1 },
      "timestamp2": { timestamp: timestamp2 }
      // Additional history entries
    }
  },
  quizzesCreated: {
    total: 5,
    last24Hours: 0,
    last7Days: 1, 
    last30Days: 3,
    history: {
      // History entries
    }
  }
}
```
