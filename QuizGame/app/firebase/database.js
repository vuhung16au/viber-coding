// DEPRECATED: Use '../../firebase/database.js' instead. This file is no longer maintained.
// All logic has been moved to /firebase/database.js

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
  update,
  remove,
  orderByKey
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

// Alias for getAllQuizzes to fix missing function error in QuizzesContent.js
export const getQuizzes = async (limit = 50) => {
  return getAllQuizzes(limit);
};

// Get most popular quizzes based on play count
export const getMostPopularQuizzes = async (limit = 5) => {
  try {
    const quizzesRef = ref(database, 'quizzes');
    const snapshot = await get(quizzesRef);
    
    if (snapshot.exists()) {
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by play count or any popularity metric
      quizzes.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
      
      // Return limited results
      return quizzes.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching popular quizzes:', error);
    return [];
  }
};

// Get most recently added quizzes
export const getRecentQuizzes = async (limit = 5) => {
  try {
    const quizzesRef = ref(database, 'quizzes');
    const recentQuizzesQuery = query(quizzesRef, orderByKey(), limitToLast(limit));
    const snapshot = await get(recentQuizzesQuery);
    
    if (snapshot.exists()) {
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by creation date if available
      quizzes.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      return quizzes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching recent quizzes:', error);
    return [];
  }
};

/**
 * Duplicate an existing quiz for a user
 * @param {string} quizId - Original quiz ID to duplicate
 * @param {string} userId - User ID who will own the duplicated quiz
 * @returns {Promise<string|null>} New quiz ID or null if failed
 */
export const duplicateQuiz = async (quizId, userId) => {
  if (!quizId || !userId) {
    console.error('Missing required parameters for duplicating quiz');
    return null;
  }
  
  try {
    // Get the original quiz
    const originalQuiz = await getQuizById(quizId);
    
    if (!originalQuiz) {
      console.error('Original quiz not found');
      return null;
    }
    
    // Create a new quiz entry with modified data
    const quizzesRef = ref(database, 'quizzes');
    const newQuizRef = push(quizzesRef);
    const newQuizId = newQuizRef.key;
    
    // Create a clean copy of the quiz data without problematic properties
    const duplicatedQuizData = { ...originalQuiz };
    
    // Set new quiz properties
    duplicatedQuizData.title = `${originalQuiz.title} (Copy)`;
    duplicatedQuizData.userId = userId;
    duplicatedQuizData.createdAt = serverTimestamp();
    
    // Remove properties that shouldn't be duplicated or cause Firebase errors
    delete duplicatedQuizData.id;
    delete duplicatedQuizData.updatedAt;
    
    // Ensure we have the data in the right format
    await set(newQuizRef, duplicatedQuizData);
    
    return newQuizId;
  } catch (error) {
    console.error('Error duplicating quiz:', error);
    return null;
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

// Categories management functions

/**
 * Get all categories from the database
 * @param {boolean} includeInactive - Whether to include inactive categories
 * @returns {Promise<Array>} Categories array
 */
export const getAllCategories = async (includeInactive = false) => {
  try {
    const categoriesRef = ref(database, 'categories');
    const snapshot = await get(categoriesRef);
    
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoriesArray = Object.keys(categoriesData).map(key => ({
        id: key,
        ...categoriesData[key]
      }));
      
      // Filter out inactive categories if includeInactive is false
      return includeInactive 
        ? categoriesArray 
        : categoriesArray.filter(cat => cat.isActive);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export const getCategoryById = async (categoryId) => {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`);
    const snapshot = await get(categoryRef);
    
    if (snapshot.exists()) {
      return {
        id: categoryId,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
};

/**
 * Get a single category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const categoriesRef = ref(database, 'categories');
    const snapshot = await get(categoriesRef);
    
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      
      for (const key in categoriesData) {
        if (categoriesData[key].slug === slug) {
          return {
            id: key,
            ...categoriesData[key]
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting category by slug:', error);
    throw error;
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<string>} New category ID
 */
export const createCategory = async (categoryData) => {
  try {
    const categoriesRef = ref(database, 'categories');
    const newCategoryRef = push(categoriesRef);
    
    await set(newCategoryRef, {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      isActive: categoryData.isActive !== false, // Default to true if not provided
      displayOrder: categoryData.displayOrder || 0,
      createdAt: serverTimestamp()
    });
    
    return newCategoryRef.key;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 * @param {string} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<void>}
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`);
    const updatedData = { ...categoryData };
    
    // Remove id from the data to avoid saving it twice
    delete updatedData.id;
    
    // Add updatedAt timestamp
    updatedData.updatedAt = serverTimestamp();
    
    await update(categoryRef, updatedData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`);
    await remove(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Toggle a category's active status
 * @param {string} categoryId - Category ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<void>}
 */
export const toggleCategoryStatus = async (categoryId, isActive) => {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`);
    await update(categoryRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
};

/**
 * Delete a quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteQuiz = async (quizId) => {
  if (!quizId) return false;
  
  try {
    const quizRef = ref(database, `quizzes/${quizId}`);
    await remove(quizRef);
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
};

/**
 * Update an existing quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<boolean>} Success status
 */
export const updateQuiz = async (quizId, quizData) => {
  if (!quizId) return false;
  
  try {
    const quizRef = ref(database, `quizzes/${quizId}`);
    const updatedData = { ...quizData };
    
    // Remove id from the data to avoid saving it twice
    delete updatedData.id;
    
    // Add updatedAt timestamp
    updatedData.updatedAt = serverTimestamp();
    
    await update(quizRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating quiz:', error);
    return false;
  }
};

/**
 * Check if a user is an admin
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export const checkIfUserIsAdmin = async (userId) => {
  if (!userId) return false;
  
  console.log(`[DB] Checking admin status for user: ${userId}`);
  
  try {
    // First check at the main path (users collection)
    const adminRef = ref(database, `users/${userId}/isAdmin`);
    console.log(`[DB] Checking path: users/${userId}/isAdmin`);
    const snapshot = await get(adminRef);
    
    // If the isAdmin property exists at main path and is true, the user is an admin
    if (snapshot.exists()) {
      console.log(`[DB] Found admin status at main path: ${snapshot.val()}`);
      if (snapshot.val() === true) {
        return true;
      }
    } else {
      console.log(`[DB] No admin flag found at users/${userId}/isAdmin`);
    }
    
    // Check directly at the root level (without 'users/' prefix)
    const rootAdminRef = ref(database, `${userId}/isAdmin`);
    console.log(`[DB] Checking path: ${userId}/isAdmin`);
    const rootSnapshot = await get(rootAdminRef);
    
    if (rootSnapshot.exists()) {
      console.log(`[DB] Found admin status at root path: ${rootSnapshot.val()}`);
      if (rootSnapshot.val() === true) {
        return true;
      }
    } else {
      console.log(`[DB] No admin flag found at ${userId}/isAdmin`);
    }
    
    // Also check in the profile nested object
    const profileAdminRef = ref(database, `${userId}/profile/isAdmin`);
    console.log(`[DB] Checking path: ${userId}/profile/isAdmin`);
    const profileSnapshot = await get(profileAdminRef);
    
    if (profileSnapshot.exists()) {
      console.log(`[DB] Found admin status in profile: ${profileSnapshot.val()}`);
      if (profileSnapshot.val() === true) {
        return true;
      }
    } else {
      console.log(`[DB] No admin flag found in profile`);
    }
    
    // Check in the users collection with profile path
    const userProfileAdminRef = ref(database, `users/${userId}/profile/isAdmin`);
    console.log(`[DB] Checking path: users/${userId}/profile/isAdmin`);
    const userProfileSnapshot = await get(userProfileAdminRef);
    
    if (userProfileSnapshot.exists()) {
      console.log(`[DB] Found admin status in users profile: ${userProfileSnapshot.val()}`);
      if (userProfileSnapshot.val() === true) {
        return true;
      }
    } else {
      console.log(`[DB] No admin flag found in users profile`);
    }
    
    // If we've checked all locations and found nothing, user is not admin
    console.log(`[DB] User ${userId} is not an admin after checking all paths`);
    return false;
  } catch (error) {
    console.error('[DB] Error checking admin status:', error);
    return false;
  }
};

/**
 * Set a user's admin status
 * @param {string} userId - User ID to update
 * @param {boolean} isAdmin - Whether the user should be an admin
 * @returns {Promise<boolean>} Success status
 */
export const setUserAdminStatus = async (userId, isAdmin) => {
  if (!userId) {
    console.error('[DB] Cannot set admin status: No user ID provided');
    return false;
  }
  
  try {
    // Convert to boolean to ensure we always store a boolean value
    const adminValue = Boolean(isAdmin);
    console.log(`[DB] Setting admin status for user ${userId} to ${adminValue}`);

    // Set at the main path used by the app
    const adminRef = ref(database, `users/${userId}/isAdmin`);
    console.log(`[DB] Setting admin flag at path: users/${userId}/isAdmin`);
    await set(adminRef, adminValue);
    console.log(`[DB] Successfully set admin flag at users/${userId}/isAdmin`);
    
    // Also set at root level for consistency (as seen in the screenshot)
    const rootAdminRef = ref(database, `${userId}/isAdmin`);
    console.log(`[DB] Setting admin flag at path: ${userId}/isAdmin`);
    await set(rootAdminRef, adminValue);
    console.log(`[DB] Successfully set admin flag at ${userId}/isAdmin`);
    
    // Also update in the profile object (as seen in the screenshot)
    const profileAdminRef = ref(database, `${userId}/profile/isAdmin`);
    console.log(`[DB] Setting admin flag at path: ${userId}/profile/isAdmin`);
    await set(profileAdminRef, adminValue);
    console.log(`[DB] Successfully set admin flag at ${userId}/profile/isAdmin`);
    
    // Also update in the users/profile path
    const userProfileAdminRef = ref(database, `users/${userId}/profile/isAdmin`);
    console.log(`[DB] Setting admin flag at path: users/${userId}/profile/isAdmin`);
    await set(userProfileAdminRef, adminValue);
    console.log(`[DB] Successfully set admin flag at users/${userId}/profile/isAdmin`);
    
    console.log(`[DB] Admin status for user ${userId} set to ${adminValue} in all locations`);
    return true;
  } catch (error) {
    console.error('[DB] Error setting admin status:', error);
    return false;
  }
};