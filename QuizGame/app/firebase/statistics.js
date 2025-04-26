// Statistics utility functions for tracking quiz plays and creations
import { db } from './config';
import { 
  ref, 
  get, 
  set, 
  update, 
  increment, 
  serverTimestamp, 
  query, 
  orderByChild, 
  equalTo,
  startAt, 
  endAt,
  push
} from 'firebase/database';

// Time constants in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * ONE_DAY;
const THIRTY_DAYS = 30 * ONE_DAY;

/**
 * Records a completed quiz result in the database and updates statistics
 * 
 * @param {string} userId - The ID of the user who completed the quiz
 * @param {string} quizId - The ID of the quiz that was completed
 * @param {number} score - The score as a percentage (0-100)
 * @param {number} totalQuestions - The total number of questions in the quiz
 * @param {number} correctAnswers - The number of correctly answered questions
 * @param {number} timeTaken - Time taken to complete the quiz in seconds (optional)
 * @returns {Promise<string>} - The ID of the newly created result record
 */
export async function recordQuizPlayed(userId, quizId, score, totalQuestions, correctAnswers = null, timeTaken = null) {
  if (!userId || !quizId) {
    console.error('Required parameters missing for recordQuizPlayed');
    return null;
  }

  // Calculate correct answers if not provided
  if (correctAnswers === null) {
    // If score is a percentage and totalQuestions is provided, we can calculate
    if (typeof score === 'number' && typeof totalQuestions === 'number') {
      correctAnswers = Math.round((score / 100) * totalQuestions);
    } else {
      correctAnswers = 0;
    }
  }

  try {
    const timestamp = Date.now();
    
    // 1. Update user statistics
    await updateUserQuizPlayedStats(userId);
    
    // 2. Create a new record in the results collection
    const resultsRef = ref(db, 'quizResults');
    const newResultRef = push(resultsRef);
    
    const resultData = {
      userId,
      quizId,
      score, // Store as percentage
      totalQuestions,
      correctAnswers,
      timeTaken,
      date: serverTimestamp()
    };
    
    await set(newResultRef, resultData);
    
    // 3. Update quiz statistics
    const quizStatsRef = ref(db, `quizzes/${quizId}/statistics`);
    await update(quizStatsRef, {
      played: increment(1),
      lastPlayed: timestamp
    });
    
    return newResultRef.key;
    
  } catch (error) {
    console.error('Error recording quiz played:', error);
    return null;
  }
}

/**
 * Record when a user creates a quiz and update statistics
 * @param {string} userId - The ID of the user
 * @param {string} quizId - The ID of the quiz
 */
export const recordQuizCreated = async (userId, quizId) => {
  if (!userId || !quizId) return;
  
  try {
    // Update user statistics for quiz creation
    await updateUserQuizCreatedStats(userId);
    
  } catch (error) {
    console.error('Error recording quiz created:', error);
  }
};

/**
 * Update user statistics after creating a quiz
 * @param {string} userId - The ID of the user
 */
export const updateUserQuizCreatedStats = async (userId) => {
  if (!userId) return;
  
  const userStatsRef = ref(db, `statistics/users/${userId}`);
  const timestamp = Date.now();
  
  try {
    // Get current stats
    const snapshot = await get(userStatsRef);
    const stats = snapshot.exists() ? snapshot.val() : {};
    
    // Initialize statistics if they don't exist
    stats.quizzesCreated = stats.quizzesCreated || {
      total: 0,
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0,
      history: stats.quizzesCreated?.history || {}
    };
    
    // Add current timestamp to history
    const historyEntry = { timestamp };
    
    // Calculate time-based stats
    const currentTime = Date.now();
    const history = Object.values(stats.quizzesCreated.history || {});
    
    const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
    const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
    const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
    
    // Update stats in database
    await update(userStatsRef, {
      'quizzesCreated/total': increment(1),
      'quizzesCreated/last24Hours': last24Hours + 1,
      'quizzesCreated/last7Days': last7Days + 1,
      'quizzesCreated/last30Days': last30Days + 1,
      [`quizzesCreated/history/${timestamp}`]: historyEntry
    });
    
    // Update global statistics
    await updateGlobalStatistics('created');
    
  } catch (error) {
    console.error('Error updating user quiz created stats:', error);
  }
};

/**
 * Update user statistics after playing a quiz
 * @param {string} userId - The ID of the user
 */
export const updateUserQuizPlayedStats = async (userId) => {
  if (!userId) return;
  
  const userStatsRef = ref(db, `statistics/users/${userId}`);
  const timestamp = Date.now();
  
  try {
    // Get current stats
    const snapshot = await get(userStatsRef);
    const stats = snapshot.exists() ? snapshot.val() : {};
    
    // Initialize statistics if they don't exist
    stats.quizzesPlayed = stats.quizzesPlayed || {
      total: 0,
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0,
      history: stats.quizzesPlayed?.history || {}
    };
    
    // Add current timestamp to history
    const historyEntry = { timestamp };
    
    // Calculate time-based stats
    const currentTime = Date.now();
    const history = Object.values(stats.quizzesPlayed.history || {});
    
    const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
    const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
    const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
    
    // Update stats in database
    await update(userStatsRef, {
      'quizzesPlayed/total': increment(1),
      'quizzesPlayed/last24Hours': last24Hours + 1,
      'quizzesPlayed/last7Days': last7Days + 1,
      'quizzesPlayed/last30Days': last30Days + 1,
      [`quizzesPlayed/history/${timestamp}`]: historyEntry
    });
    
    // Update global statistics
    await updateGlobalStatistics('played');
    
  } catch (error) {
    console.error('Error updating user quiz played stats:', error);
  }
};

/**
 * Update global statistics when a quiz is created or played
 * @param {string} type - Either 'created' or 'played'
 */
export const updateGlobalStatistics = async (type) => {
  if (type !== 'created' && type !== 'played') return;
  
  const globalStatsRef = ref(db, 'statistics/global');
  
  try {
    // Get current global stats
    const snapshot = await get(globalStatsRef);
    const stats = snapshot.exists() ? snapshot.val() : {};
    
    // Initialize statistics if they don't exist
    const key = type === 'created' ? 'quizzesCreated' : 'quizzesPlayed';
    stats[key] = stats[key] || {
      total: 0,
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };
    
    // Update stats in database
    await update(globalStatsRef, {
      [`${key}/total`]: increment(1),
      [`${key}/last24Hours`]: increment(1),
      [`${key}/last7Days`]: increment(1),
      [`${key}/last30Days`]: increment(1)
    });
    
  } catch (error) {
    console.error(`Error updating global ${type} statistics:`, error);
  }
};

/**
 * Get user statistics
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStatistics = async (userId) => {
  if (!userId) return null;
  
  try {
    const userStatsRef = ref(db, `statistics/users/${userId}`);
    const snapshot = await get(userStatsRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return {
      quizzesPlayed: { total: 0, last24Hours: 0, last7Days: 0, last30Days: 0, history: {} },
      quizzesCreated: { total: 0, last24Hours: 0, last7Days: 0, last30Days: 0, history: {} }
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return null;
  }
};

/**
 * Get user statistics by username
 * @param {string} username - The username of the user
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStatisticsByUsername = async (username) => {
  if (!username) return null;
  
  try {
    // Find user ID from username
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) return null;
    
    let userId = null;
    const users = usersSnapshot.val();
    
    for (const uid in users) {
      if (users[uid].username === username || users[uid].displayName === username) {
        userId = uid;
        break;
      }
    }
    
    if (!userId) return null;
    
    // Get user statistics with the found ID
    return await getUserStatistics(userId);
    
  } catch (error) {
    console.error('Error getting user statistics by username:', error);
    return null;
  }
};

/**
 * Get global statistics
 * @returns {Promise<Object>} - Global statistics
 */
export const getGlobalStatistics = async () => {
  try {
    const globalStatsRef = ref(db, 'statistics/global');
    const snapshot = await get(globalStatsRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return {
      quizzesPlayed: { total: 0, last24Hours: 0, last7Days: 0, last30Days: 0 },
      quizzesCreated: { total: 0, last24Hours: 0, last7Days: 0, last30Days: 0 }
    };
  } catch (error) {
    console.error('Error getting global statistics:', error);
    return null;
  }
};

/**
 * Clean up outdated statistics (should be run periodically)
 * Note: This requires admin privileges or authenticated user with write access
 */
export const cleanupStatistics = async () => {
  try {
    // Check if user has permission to update statistics
    const statsRef = ref(db, 'statistics');
    // Try to read first to check permissions
    try {
      await get(statsRef);
    } catch (permError) {
      console.warn('Statistics cleanup skipped: No permission to access statistics');
      return; // Exit early if no permission
    }
    
    // Get all user statistics
    const usersStatsRef = ref(db, 'statistics/users');
    const usersSnapshot = await get(usersStatsRef);
    
    if (!usersSnapshot.exists()) return;
    
    const currentTime = Date.now();
    const users = usersSnapshot.val();
    
    // Process each user
    for (const userId in users) {
      const userStats = users[userId];
      
      // Recalculate time-based metrics for quizzes played
      if (userStats.quizzesPlayed?.history) {
        const history = Object.values(userStats.quizzesPlayed.history);
        
        const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
        
        await update(ref(db, `statistics/users/${userId}/quizzesPlayed`), {
          last24Hours,
          last7Days,
          last30Days
        });
      }
      
      // Recalculate time-based metrics for quizzes created
      if (userStats.quizzesCreated?.history) {
        const history = Object.values(userStats.quizzesCreated.history);
        
        const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
        
        await update(ref(db, `statistics/users/${userId}/quizzesCreated`), {
          last24Hours,
          last7Days,
          last30Days
        });
      }
    }
    
    // Recalculate global time-based metrics
    const allUsersPlayed = Object.values(users).reduce((acc, user) => {
      if (user.quizzesPlayed?.history) {
        const history = Object.values(user.quizzesPlayed.history);
        acc.last24Hours += history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        acc.last7Days += history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        acc.last30Days += history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
      }
      return acc;
    }, { last24Hours: 0, last7Days: 0, last30Days: 0 });
    
    const allUsersCreated = Object.values(users).reduce((acc, user) => {
      if (user.quizzesCreated?.history) {
        const history = Object.values(user.quizzesCreated.history);
        acc.last24Hours += history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        acc.last7Days += history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        acc.last30Days += history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
      }
      return acc;
    }, { last24Hours: 0, last7Days: 0, last30Days: 0 });
    
    await update(ref(db, 'statistics/global/quizzesPlayed'), {
      last24Hours: allUsersPlayed.last24Hours,
      last7Days: allUsersPlayed.last7Days,
      last30Days: allUsersPlayed.last30Days
    });
    
    await update(ref(db, 'statistics/global/quizzesCreated'), {
      last24Hours: allUsersCreated.last24Hours,
      last7Days: allUsersCreated.last7Days,
      last30Days: allUsersCreated.last30Days
    });
    
  } catch (error) {
    console.error('Error cleaning up statistics:', error);
    // Don't rethrow the error to prevent app crashes
  }
};

/**
 * Get all quiz results for a specific user
 * 
 * @param {string} userId - The ID of the user to get results for
 * @returns {Promise<Array>} - Array of quiz result objects
 */
export async function getUserResults(userId) {
  if (!userId) {
    console.error('User ID is required to get results');
    return [];
  }

  try {
    // Query the results collection for the specific user
    const resultsRef = ref(db, 'quizResults');
    const userResultsQuery = query(resultsRef, orderByChild('userId'), equalTo(userId));
    
    const snapshot = await get(userResultsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    // Convert the snapshot to an array of results with their IDs
    const results = [];
    snapshot.forEach((childSnapshot) => {
      results.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error getting user results:', error);
    return [];
  }
}

/**
 * Get quiz result statistics (e.g., average score, number of completions)
 * 
 * @param {string} quizId - The ID of the quiz to get statistics for
 * @returns {Promise<Object>} - Object containing quiz statistics
 */
export async function getQuizStatistics(quizId) {
  if (!quizId) {
    console.error('Quiz ID is required to get statistics');
    return null;
  }

  try {
    // Query the results collection for the specific quiz
    const resultsRef = ref(db, 'quizResults');
    const quizResultsQuery = query(resultsRef, orderByChild('quizId'), equalTo(quizId));
    
    const snapshot = await get(quizResultsQuery);
    
    if (!snapshot.exists()) {
      return {
        totalPlays: 0,
        averageScore: 0,
        bestScore: 0,
        completionCount: 0
      };
    }
    
    // Calculate statistics
    let totalScore = 0;
    let bestScore = 0;
    let completionCount = 0;
    const uniqueUsers = new Set();
    
    snapshot.forEach((childSnapshot) => {
      const result = childSnapshot.val();
      totalScore += result.score || 0;
      bestScore = Math.max(bestScore, result.score || 0);
      completionCount++;
      
      if (result.userId) {
        uniqueUsers.add(result.userId);
      }
    });
    
    return {
      totalPlays: completionCount,
      averageScore: completionCount > 0 ? Math.round(totalScore / completionCount) : 0,
      bestScore,
      uniqueUsers: uniqueUsers.size
    };
  } catch (error) {
    console.error('Error getting quiz statistics:', error);
    return null;
  }
}

/**
 * Schedule a periodic cleanup of statistics
 * Should be called once when the app initializes
 */
export const scheduleStatisticsCleanup = () => {
  // Run cleanup immediately to ensure data is accurate
  cleanupStatistics();
  
  // Then schedule to run every hour
  setInterval(cleanupStatistics, 60 * 60 * 1000);
  
  console.log('Statistics cleanup scheduled');
};

/**
 * Get leaderboard data for quizzes played
 * @returns {Promise<Array>} - Array of user statistics sorted by most quizzes played
 */
export const getLeaderboardQuizzesPlayed = async (limit = 10) => {
  try {
    const usersStatsRef = ref(db, 'statistics/users');
    const snapshot = await get(usersStatsRef);
    
    if (!snapshot.exists()) return [];
    
    const users = snapshot.val();
    const leaderboard = [];
    
    // Get user info for the userIds
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
    
    for (const userId in users) {
      const stats = users[userId];
      if (stats.quizzesPlayed?.total) {
        const userData = usersData[userId] || {};
        leaderboard.push({
          userId,
          username: userData.username || userData.displayName || 'Unknown User',
          photoURL: userData.photoURL || null,
          quizzesPlayed: stats.quizzesPlayed.total
        });
      }
    }
    
    // Sort by number of quizzes played (descending)
    leaderboard.sort((a, b) => b.quizzesPlayed - a.quizzesPlayed);
    
    // Return the top users
    return leaderboard.slice(0, limit);
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Get leaderboard data for quizzes created
 * @returns {Promise<Array>} - Array of user statistics sorted by most quizzes created
 */
export const getLeaderboardQuizzesCreated = async (limit = 10) => {
  try {
    const usersStatsRef = ref(db, 'statistics/users');
    const snapshot = await get(usersStatsRef);
    
    if (!snapshot.exists()) return [];
    
    const users = snapshot.val();
    const leaderboard = [];
    
    // Get user info for the userIds
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
    
    for (const userId in users) {
      const stats = users[userId];
      if (stats.quizzesCreated?.total) {
        const userData = usersData[userId] || {};
        leaderboard.push({
          userId,
          username: userData.username || userData.displayName || 'Unknown User',
          photoURL: userData.photoURL || null,
          quizzesCreated: stats.quizzesCreated.total
        });
      }
    }
    
    // Sort by number of quizzes created (descending)
    leaderboard.sort((a, b) => b.quizzesCreated - a.quizzesCreated);
    
    // Return the top users
    return leaderboard.slice(0, limit);
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};