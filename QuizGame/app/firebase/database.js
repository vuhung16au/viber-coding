// Firebase Database Functions
import { 
  ref, 
  set, 
  push, 
  get, 
  query, 
  orderByChild, 
  equalTo,
  limitToLast,
  serverTimestamp,
  update
} from 'firebase/database';
import { db as database } from './config';

// Get a quiz by ID
export const getQuizById = async (quizId) => {
  if (!quizId) return null;
  
  try {
    const quizRef = ref(database, `quizzes/${quizId}`);
    const snapshot = await get(quizRef);
    
    if (snapshot.exists()) {
      return {
        id: quizId,
        ...snapshot.val()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
};

// Get quizzes by user ID
export const getQuizzesByUser = async (userId) => {
  if (!userId) return [];
  
  try {
    const quizzesRef = ref(database, 'quizzes');
    const userQuizzesQuery = query(quizzesRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userQuizzesQuery);
    
    if (snapshot.exists()) {
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return quizzes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    return [];
  }
};

// Get all quizzes
export const getAllQuizzes = async (limit = 50) => {
  try {
    const quizzesRef = ref(database, 'quizzes');
    const recentQuizzesQuery = query(quizzesRef, limitToLast(limit));
    const snapshot = await get(recentQuizzesQuery);
    
    if (snapshot.exists()) {
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return quizzes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
};

// Save a quiz result
export const saveQuizResult = async (
  quizId, 
  userId, 
  score, 
  correctAnswers,
  totalQuestions,
  timeTaken = null,
  dateTaken = null
) => {
  if (!quizId || !userId) {
    console.error('Missing required parameters for saving quiz result');
    return null;
  }
  
  try {
    // Get quiz info for category and other metadata
    const quiz = await getQuizById(quizId);
    
    // Create a new result entry
    const resultsRef = ref(database, 'results');
    const newResultRef = push(resultsRef);
    const resultId = newResultRef.key;
    
    const resultData = {
      id: resultId,
      quizId,
      userId,
      score,
      correctAnswers,
      totalQuestions,
      timeTaken: timeTaken || 0,
      date: dateTaken ? {
        seconds: Math.floor(dateTaken.getTime() / 1000),
        nanoseconds: (dateTaken.getTime() % 1000) * 1000000
      } : serverTimestamp(),
      category: quiz?.category || 'general'
    };
    
    await set(newResultRef, resultData);
    
    // Also update user's results reference for faster lookups
    if (userId) {
      const userResultsRef = ref(database, `users/${userId}/results/${resultId}`);
      await set(userResultsRef, true);
    }
    
    return resultId;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return null;
  }
};

// Get user's quiz results
export const getUserResults = async (userId) => {
  if (!userId) return [];
  
  try {
    // First try to get from user's results reference
    const userResultsRef = ref(database, `users/${userId}/results`);
    const userResultsSnapshot = await get(userResultsRef);
    
    if (userResultsSnapshot.exists()) {
      const resultIds = Object.keys(userResultsSnapshot.val());
      
      // Fetch all result details
      const results = [];
      for (const resultId of resultIds) {
        const resultRef = ref(database, `results/${resultId}`);
        const resultSnapshot = await get(resultRef);
        
        if (resultSnapshot.exists()) {
          results.push({
            id: resultId,
            ...resultSnapshot.val()
          });
        }
      }
      
      return results;
    }
    
    // Fallback: Query the results directly
    const resultsRef = ref(database, 'results');
    const userResultsQuery = query(resultsRef, orderByChild('userId'), equalTo(userId));
    const resultsSnapshot = await get(userResultsQuery);
    
    if (resultsSnapshot.exists()) {
      const results = [];
      resultsSnapshot.forEach((childSnapshot) => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user results:', error);
    return [];
  }
};

// Get leaderboard results (highest scores)
export const getLeaderboard = async (limit = 10) => {
  try {
    const resultsRef = ref(database, 'results');
    // Unfortunately Firebase doesn't support orderByChild and limitToLast together easily,
    // so we'll fetch more results than needed and sort them programmatically
    const snapshot = await get(resultsRef);
    
    if (snapshot.exists()) {
      const results = [];
      snapshot.forEach((childSnapshot) => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score);
      
      // Limit results
      return results.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};