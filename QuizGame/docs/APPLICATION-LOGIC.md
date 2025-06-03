# Application Logic Documentation

## Overview

This document outlines the core application logic, business rules, and system flows that power the QuizGame platform. It provides developers with a comprehensive understanding of how the application operates, from user authentication to quiz completion and result processing.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Authentication Flow](#user-authentication-flow)
3. [Quiz Creation Logic](#quiz-creation-logic)
4. [Quiz Taking Flow](#quiz-taking-flow)
5. [Real-time Features](#real-time-features)
6. [Data Models](#data-models)
7. [Business Rules](#business-rules)
8. [Error Handling](#error-handling)
9. [State Management](#state-management)
10. [Performance Optimizations](#performance-optimizations)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   AI Services   │
│   (Next.js)     │◄──►│   Backend       │◄──►│   (Gemini)      │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Pages   │    │ • Realtime DB   │    │ • Quiz Gen      │
│ • Components    │    │ • Authentication│    │ • Content AI    │
│ • State Mgmt    │    │ • Cloud Storage │    │ • Enhancements  │
│ • UI Logic      │    │ • Functions     │    │ • Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Application Flow

1. **User Authentication** → User logs in/registers
2. **Dashboard Access** → User views available quizzes and stats
3. **Quiz Selection** → User chooses quiz to take or create
4. **Quiz Interaction** → User takes quiz or creates new one
5. **Result Processing** → Results calculated and stored
6. **Analytics Update** → User progress and analytics updated

---

## User Authentication Flow

### Authentication States

```javascript
// Authentication state management
const authStates = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};
```

### Login Process

1. **Initial Load**
   ```javascript
   // Check existing authentication
   onAuthStateChanged(auth, (user) => {
     if (user) {
       // User is signed in
       setAuthState(authStates.AUTHENTICATED);
       loadUserProfile(user.uid);
     } else {
       // User is signed out
       setAuthState(authStates.UNAUTHENTICATED);
     }
   });
   ```

2. **Sign-In Methods**
   - Google OAuth
   - Email/Password
   - Facebook (if configured)
   - Anonymous (for guest users)

3. **User Profile Creation**
   ```javascript
   // Create user profile in database
   const createUserProfile = async (user) => {
     const userProfile = {
       uid: user.uid,
       email: user.email,
       displayName: user.displayName,
       photoURL: user.photoURL,
       createdAt: serverTimestamp(),
       lastLoginAt: serverTimestamp(),
       quizzesTaken: 0,
       averageScore: 0,
       totalPoints: 0
     };
     
     await setDoc(doc(db, 'users', user.uid), userProfile);
   };
   ```

### Role-Based Access Control

```javascript
// User roles and permissions
const userRoles = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Permission checks
const hasPermission = (user, action) => {
  const permissions = {
    CREATE_QUIZ: [userRoles.TEACHER, userRoles.ADMIN],
    DELETE_QUIZ: [userRoles.ADMIN],
    MANAGE_USERS: [userRoles.ADMIN],
    TAKE_QUIZ: [userRoles.STUDENT, userRoles.TEACHER, userRoles.ADMIN]
  };
  
  return permissions[action]?.includes(user.role);
};
```

---

## Quiz Creation Logic

### Quiz Creation Workflow

1. **Topic Selection**
   - User selects or enters topic
   - System validates topic appropriateness
   - AI suggests related subtopics

2. **Question Generation Methods**
   - **Manual Creation:** User creates questions manually
   - **AI Generation:** AI generates questions based on topic
   - **Mixed Mode:** Combination of manual and AI-generated

3. **AI-Powered Question Generation**
   ```javascript
   const generateQuizQuestions = async (topic, difficulty, questionCount) => {
     const prompt = `Generate ${questionCount} ${difficulty} multiple-choice questions about ${topic}`;
     
     const response = await geminiService.generateContent(prompt);
     const questions = parseAIResponse(response);
     
     return questions.map(q => ({
       id: generateId(),
       question: q.question,
       options: q.options,
       correctAnswer: q.correctAnswer,
       explanation: q.explanation,
       difficulty: difficulty,
       category: topic
     }));
   };
   ```

4. **Question Validation**
   - Content appropriateness check
   - Answer correctness validation
   - Difficulty level assessment
   - Duplicate question detection

5. **Quiz Assembly**
   ```javascript
   const createQuiz = async (quizData) => {
     const quiz = {
       id: generateId(),
       title: quizData.title,
       description: quizData.description,
       category: quizData.category,
       difficulty: quizData.difficulty,
       questions: quizData.questions,
       createdBy: auth.currentUser.uid,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp(),
       isPublic: quizData.isPublic,
       tags: quizData.tags,
       timeLimit: quizData.timeLimit,
       passingScore: quizData.passingScore,
       attempts: 0,
       averageScore: 0
     };
     
     await addDoc(collection(db, 'quizzes'), quiz);
     return quiz;
   };
   ```

---

## Quiz Taking Flow

### Quiz Session Management

```javascript
// Quiz session state
const quizSession = {
  quizId: '',
  userId: '',
  startTime: null,
  endTime: null,
  currentQuestionIndex: 0,
  answers: [],
  timeRemaining: 0,
  status: 'NOT_STARTED' // NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
};
```

### Quiz Start Process

1. **Pre-Quiz Validation**
   ```javascript
   const startQuiz = async (quizId, userId) => {
     // Check if user can take quiz
     const canTake = await validateQuizAccess(quizId, userId);
     if (!canTake) throw new Error('Access denied');
     
     // Load quiz data
     const quiz = await getQuiz(quizId);
     
     // Initialize session
     const session = createQuizSession(quiz, userId);
     
     // Start timer if time limit exists
     if (quiz.timeLimit) {
       startTimer(quiz.timeLimit, session.id);
     }
     
     return session;
   };
   ```

2. **Question Delivery**
   ```javascript
   const getNextQuestion = (session) => {
     const { quiz, currentQuestionIndex } = session;
     
     if (currentQuestionIndex >= quiz.questions.length) {
       return null; // Quiz completed
     }
     
     // Shuffle options if configured
     const question = { ...quiz.questions[currentQuestionIndex] };
     if (quiz.shuffleOptions) {
       question.options = shuffleArray(question.options);
     }
     
     return question;
   };
   ```

### Answer Processing

```javascript
const submitAnswer = async (sessionId, questionId, selectedAnswer) => {
  const session = await getSession(sessionId);
  
  // Validate answer submission
  if (session.status !== 'IN_PROGRESS') {
    throw new Error('Invalid session state');
  }
  
  // Record answer
  const answer = {
    questionId,
    selectedAnswer,
    timestamp: Date.now(),
    timeSpent: calculateTimeSpent(session.currentQuestion.startTime)
  };
  
  session.answers.push(answer);
  
  // Move to next question or complete quiz
  if (session.currentQuestionIndex + 1 >= session.quiz.questions.length) {
    await completeQuiz(session);
  } else {
    session.currentQuestionIndex++;
    await updateSession(session);
  }
  
  return session;
};
```

### Quiz Completion and Scoring

```javascript
const completeQuiz = async (session) => {
  session.status = 'COMPLETED';
  session.endTime = Date.now();
  
  // Calculate score
  const results = calculateQuizResults(session);
  
  // Save results
  const quizResult = {
    userId: session.userId,
    quizId: session.quizId,
    score: results.score,
    percentage: results.percentage,
    correctAnswers: results.correctAnswers,
    totalQuestions: results.totalQuestions,
    timeSpent: session.endTime - session.startTime,
    answers: session.answers,
    completedAt: serverTimestamp(),
    passed: results.percentage >= session.quiz.passingScore
  };
  
  await saveQuizResult(quizResult);
  
  // Update user statistics
  await updateUserStats(session.userId, results);
  
  // Update quiz statistics
  await updateQuizStats(session.quizId, results);
  
  return results;
};
```

---

## Real-time Features

### Live Quiz Sessions

```javascript
// Real-time quiz session for multiplayer
const createLiveQuizSession = async (quizId, hostId) => {
  const liveSession = {
    id: generateId(),
    quizId,
    hostId,
    participants: [hostId],
    status: 'WAITING', // WAITING, STARTING, IN_PROGRESS, COMPLETED
    currentQuestion: 0,
    startTime: null,
    settings: {
      allowLateJoin: true,
      showLeaderboard: true,
      questionTimeLimit: 30
    }
  };
  
  // Create real-time database entry
  await set(ref(realtimeDb, `liveSessions/${liveSession.id}`), liveSession);
  
  return liveSession;
};
```

### Real-time Updates

```javascript
// Listen for live session updates
const subscribeLiveSession = (sessionId, callback) => {
  const sessionRef = ref(realtimeDb, `liveSessions/${sessionId}`);
  
  return onValue(sessionRef, (snapshot) => {
    const session = snapshot.val();
    callback(session);
  });
};

// Send real-time answer
const submitLiveAnswer = async (sessionId, userId, answer) => {
  const answerRef = ref(realtimeDb, `liveSessions/${sessionId}/answers/${userId}`);
  
  await set(answerRef, {
    answer,
    timestamp: Date.now(),
    questionIndex: session.currentQuestion
  });
};
```

### Leaderboard Updates

```javascript
// Real-time leaderboard calculation
const updateLeaderboard = async (sessionId) => {
  const session = await getLiveSession(sessionId);
  const answers = session.answers || {};
  
  const leaderboard = Object.entries(answers).map(([userId, userAnswers]) => {
    const score = calculateUserScore(userAnswers, session.quiz.questions);
    return { userId, score };
  }).sort((a, b) => b.score - a.score);
  
  await update(ref(realtimeDb, `liveSessions/${sessionId}`), {
    leaderboard
  });
};
```

---

## Data Models

### User Model

```javascript
const UserSchema = {
  uid: 'string', // Firebase Auth UID
  email: 'string',
  displayName: 'string',
  photoURL: 'string',
  role: 'string', // student, teacher, admin
  preferences: {
    language: 'string',
    theme: 'string',
    notifications: 'boolean'
  },
  stats: {
    quizzesTaken: 'number',
    averageScore: 'number',
    totalPoints: 'number',
    streak: 'number',
    lastActivity: 'timestamp'
  },
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};
```

### Quiz Model

```javascript
const QuizSchema = {
  id: 'string',
  title: 'string',
  description: 'string',
  category: 'string',
  difficulty: 'string', // beginner, intermediate, advanced
  questions: [{
    id: 'string',
    question: 'string',
    type: 'string', // multiple-choice, true-false, fill-blank
    options: ['string'],
    correctAnswer: 'string',
    explanation: 'string',
    points: 'number'
  }],
  settings: {
    timeLimit: 'number', // seconds
    passingScore: 'number', // percentage
    shuffleQuestions: 'boolean',
    shuffleOptions: 'boolean',
    showResults: 'boolean',
    allowRetakes: 'boolean'
  },
  metadata: {
    createdBy: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    tags: ['string'],
    isPublic: 'boolean',
    featured: 'boolean'
  },
  stats: {
    attempts: 'number',
    averageScore: 'number',
    completionRate: 'number'
  }
};
```

### Quiz Result Model

```javascript
const QuizResultSchema = {
  id: 'string',
  userId: 'string',
  quizId: 'string',
  score: 'number',
  percentage: 'number',
  passed: 'boolean',
  answers: [{
    questionId: 'string',
    selectedAnswer: 'string',
    isCorrect: 'boolean',
    timeSpent: 'number'
  }],
  timing: {
    startTime: 'timestamp',
    endTime: 'timestamp',
    totalTime: 'number'
  },
  metadata: {
    attempt: 'number',
    completedAt: 'timestamp',
    deviceInfo: 'object'
  }
};
```

---

## Business Rules

### Quiz Access Rules

1. **Public Quizzes:** Accessible to all authenticated users
2. **Private Quizzes:** Only accessible to creator and invited users
3. **Draft Quizzes:** Only visible to creator
4. **Archived Quizzes:** Not visible in listings but accessible via direct link

### Scoring Rules

```javascript
const calculateScore = (answers, questions) => {
  let correctAnswers = 0;
  let totalPoints = 0;
  
  answers.forEach((answer, index) => {
    const question = questions[index];
    
    if (answer.selectedAnswer === question.correctAnswer) {
      correctAnswers++;
      totalPoints += question.points || 1;
    }
  });
  
  return {
    correctAnswers,
    totalQuestions: questions.length,
    totalPoints,
    percentage: (correctAnswers / questions.length) * 100
  };
};
```

### Retry Logic

```javascript
const canRetakeQuiz = (user, quiz, previousAttempts) => {
  // Check quiz settings
  if (!quiz.settings.allowRetakes) return false;
  
  // Check attempt limits
  if (quiz.settings.maxAttempts && previousAttempts >= quiz.settings.maxAttempts) {
    return false;
  }
  
  // Check time restrictions
  if (quiz.settings.retryDelay) {
    const lastAttempt = getLastAttempt(user.uid, quiz.id);
    const timeSinceLastAttempt = Date.now() - lastAttempt.completedAt;
    
    if (timeSinceLastAttempt < quiz.settings.retryDelay) {
      return false;
    }
  }
  
  return true;
};
```

---

## Error Handling

### Client-Side Error Handling

```javascript
// Global error handler
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  
  // Log error to analytics
  logError(error, context);
  
  // Show user-friendly message
  const userMessage = getUserFriendlyMessage(error);
  showNotification(userMessage, 'error');
  
  // Report to error tracking service
  if (process.env.NODE_ENV === 'production') {
    reportError(error, context);
  }
};

// Quiz-specific error handling
const handleQuizError = (error, quizSession) => {
  switch (error.code) {
    case 'QUIZ_NOT_FOUND':
      redirectToQuizList();
      break;
    case 'SESSION_EXPIRED':
      showSessionExpiredDialog();
      break;
    case 'NETWORK_ERROR':
      enableOfflineMode();
      break;
    default:
      handleError(error, 'quiz');
  }
};
```

### Server-Side Error Handling

```javascript
// Firebase Cloud Function error handling
exports.processQuizResult = functions.firestore
  .document('quizSessions/{sessionId}')
  .onUpdate(async (change, context) => {
    try {
      const session = change.after.data();
      
      if (session.status === 'COMPLETED') {
        await processQuizCompletion(session);
      }
    } catch (error) {
      console.error('Error processing quiz result:', error);
      
      // Update session with error status
      await change.after.ref.update({
        error: error.message,
        errorAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      throw error;
    }
  });
```

---

## State Management

### Global State Structure

```javascript
// Application state using Context API
const AppState = {
  user: {
    profile: null,
    isAuthenticated: false,
    loading: false
  },
  quiz: {
    currentQuiz: null,
    session: null,
    loading: false,
    error: null
  },
  ui: {
    theme: 'light',
    notifications: [],
    modals: {},
    loading: false
  }
};
```

### State Management Patterns

```javascript
// Quiz state reducer
const quizReducer = (state, action) => {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        currentQuiz: action.quiz,
        session: action.session,
        loading: false
      };
      
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        session: {
          ...state.session,
          answers: [...state.session.answers, action.answer],
          currentQuestionIndex: state.session.currentQuestionIndex + 1
        }
      };
      
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'COMPLETED',
          results: action.results
        }
      };
      
    default:
      return state;
  }
};
```

---

## Performance Optimizations

### Quiz Loading Optimization

```javascript
// Lazy load quiz questions
const loadQuizQuestions = async (quizId) => {
  // Load basic quiz info first
  const quizMeta = await getQuizMetadata(quizId);
  
  // Load questions in chunks
  const questionChunks = await Promise.all([
    getQuestions(quizId, 0, 10),  // First 10 questions
    getQuestions(quizId, 10, 20)  // Next 10 questions (background)
  ]);
  
  return {
    ...quizMeta,
    questions: questionChunks.flat()
  };
};
```

### Caching Strategy

```javascript
// Cache quiz data for offline access
const cacheQuiz = async (quiz) => {
  if ('caches' in window) {
    const cache = await caches.open('quiz-cache-v1');
    await cache.put(`/quiz/${quiz.id}`, new Response(JSON.stringify(quiz)));
  }
};

// Service Worker caching for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/quiz/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

### Real-time Optimization

```javascript
// Debounce real-time updates
const debouncedUpdate = debounce((sessionId, data) => {
  updateLiveSession(sessionId, data);
}, 300);

// Batch answer submissions
const batchAnswerSubmission = {
  queue: [],
  timer: null,
  
  add(answer) {
    this.queue.push(answer);
    
    if (this.timer) clearTimeout(this.timer);
    
    this.timer = setTimeout(() => {
      this.flush();
    }, 1000);
  },
  
  flush() {
    if (this.queue.length > 0) {
      submitAnswerBatch(this.queue);
      this.queue = [];
    }
  }
};
```

---

## Conclusion

The QuizGame application logic is designed with scalability, performance, and user experience in mind. The system supports both individual and collaborative learning through:

- **Flexible Quiz Creation:** Manual and AI-assisted question generation
- **Real-time Interactions:** Live quizzes and instant feedback
- **Comprehensive Analytics:** Detailed progress tracking and insights
- **Robust Error Handling:** Graceful degradation and recovery
- **Performance Optimization:** Caching, lazy loading, and efficient state management

The modular architecture ensures that new features can be added easily while maintaining system stability and performance.

Last updated: 3 June 2025
