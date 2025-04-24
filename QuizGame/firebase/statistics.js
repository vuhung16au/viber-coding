// Firebase statistics operations
import { database } from './config.js';
import { 
  ref, 
  set, 
  push, 
  get, 
  remove, 
  update,
  query,
  orderByChild,
  startAt,
  endAt,
  serverTimestamp
} from 'firebase/database';

// Get current timestamp
const getCurrentTimestamp = () => {
  return new Date().getTime();
};

// Get timestamp for X days ago
const getTimestampDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.getTime();
};

// --------- USER STATISTICS OPERATIONS ---------

// Update user statistics after creating a quiz
export const updateUserQuizCreatedStats = async (userId) => {
  const userStatsRef = ref(database, `userStats/${userId}`);
  const timestamp = getCurrentTimestamp();
  
  // Get current stats
  const snapshot = await get(userStatsRef);
  let stats = {};
  
  if (snapshot.exists()) {
    stats = snapshot.val();
  }
  
  // Initialize statistics if they don't exist
  stats.quizzesCreated = stats.quizzesCreated || {
    total: 0,
    last30Days: 0,
    last7Days: 0,
    last24Hours: 0,
    creationDates: stats.quizzesCreated?.creationDates || []
  };
  
  // Add current timestamp to creation dates
  stats.quizzesCreated.creationDates.push(timestamp);
  
  // Update totals
  stats.quizzesCreated.total += 1;
  
  // Calculate time-based stats
  const last30DaysTimestamp = getTimestampDaysAgo(30);
  const last7DaysTimestamp = getTimestampDaysAgo(7);
  const last24HoursTimestamp = getTimestampDaysAgo(1);
  
  stats.quizzesCreated.last30Days = stats.quizzesCreated.creationDates.filter(
    date => date >= last30DaysTimestamp
  ).length;
  
  stats.quizzesCreated.last7Days = stats.quizzesCreated.creationDates.filter(
    date => date >= last7DaysTimestamp
  ).length;
  
  stats.quizzesCreated.last24Hours = stats.quizzesCreated.creationDates.filter(
    date => date >= last24HoursTimestamp
  ).length;
  
  // Update stats in database
  await update(userStatsRef, stats);
  
  // Update global statistics
  await updateGlobalStatistics('created');
  
  return stats;
};

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
  
  // Add current timestamp to play dates
  stats.quizzesPlayed.playDates.push(timestamp);
  
  // Update totals
  stats.quizzesPlayed.total += 1;
  
  // Calculate time-based stats
  const last30DaysTimestamp = getTimestampDaysAgo(30);
  const last7DaysTimestamp = getTimestampDaysAgo(7);
  const last24HoursTimestamp = getTimestampDaysAgo(1);
  
  stats.quizzesPlayed.last30Days = stats.quizzesPlayed.playDates.filter(
    date => date >= last30DaysTimestamp
  ).length;
  
  stats.quizzesPlayed.last7Days = stats.quizzesPlayed.playDates.filter(
    date => date >= last7DaysTimestamp
  ).length;
  
  stats.quizzesPlayed.last24Hours = stats.quizzesPlayed.playDates.filter(
    date => date >= last24HoursTimestamp
  ).length;
  
  // Update stats in database
  await update(userStatsRef, stats);
  
  // Update global statistics
  await updateGlobalStatistics('played');
  
  return stats;
};

// Get user statistics
export const getUserStatistics = async (userId) => {
  const userStatsRef = ref(database, `userStats/${userId}`);
  const snapshot = await get(userStatsRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  // Return empty stats structure if no stats exist
  return {
    quizzesCreated: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      creationDates: []
    },
    quizzesPlayed: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      playDates: []
    }
  };
};

// Get user statistics by username
export const getUserStatisticsByUsername = async (username) => {
  // First, get the userId from the username
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const users = snapshot.val();
    let userId = null;
    
    // Find the user with the matching username
    Object.keys(users).forEach(key => {
      if (users[key].username === username) {
        userId = key;
      }
    });
    
    if (userId) {
      return await getUserStatistics(userId);
    }
  }
  
  return null;
};

// --------- GLOBAL STATISTICS OPERATIONS ---------

// Update global statistics
export const updateGlobalStatistics = async (type) => {
  const globalStatsRef = ref(database, 'globalStats');
  const timestamp = getCurrentTimestamp();
  
  // Get current global stats
  const snapshot = await get(globalStatsRef);
  let stats = {};
  
  if (snapshot.exists()) {
    stats = snapshot.val();
  }
  
  // Initialize statistics if they don't exist
  if (type === 'created') {
    stats.quizzesCreated = stats.quizzesCreated || {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      creationDates: stats.quizzesCreated?.creationDates || []
    };
    
    // Add current timestamp to creation dates
    stats.quizzesCreated.creationDates.push(timestamp);
    
    // Update totals
    stats.quizzesCreated.total += 1;
    
    // Calculate time-based stats
    const last30DaysTimestamp = getTimestampDaysAgo(30);
    const last7DaysTimestamp = getTimestampDaysAgo(7);
    const last24HoursTimestamp = getTimestampDaysAgo(1);
    
    stats.quizzesCreated.last30Days = stats.quizzesCreated.creationDates.filter(
      date => date >= last30DaysTimestamp
    ).length;
    
    stats.quizzesCreated.last7Days = stats.quizzesCreated.creationDates.filter(
      date => date >= last7DaysTimestamp
    ).length;
    
    stats.quizzesCreated.last24Hours = stats.quizzesCreated.creationDates.filter(
      date => date >= last24HoursTimestamp
    ).length;
  } else if (type === 'played') {
    stats.quizzesPlayed = stats.quizzesPlayed || {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      playDates: stats.quizzesPlayed?.playDates || []
    };
    
    // Add current timestamp to play dates
    stats.quizzesPlayed.playDates.push(timestamp);
    
    // Update totals
    stats.quizzesPlayed.total += 1;
    
    // Calculate time-based stats
    const last30DaysTimestamp = getTimestampDaysAgo(30);
    const last7DaysTimestamp = getTimestampDaysAgo(7);
    const last24HoursTimestamp = getTimestampDaysAgo(1);
    
    stats.quizzesPlayed.last30Days = stats.quizzesPlayed.playDates.filter(
      date => date >= last30DaysTimestamp
    ).length;
    
    stats.quizzesPlayed.last7Days = stats.quizzesPlayed.playDates.filter(
      date => date >= last7DaysTimestamp
    ).length;
    
    stats.quizzesPlayed.last24Hours = stats.quizzesPlayed.playDates.filter(
      date => date >= last24HoursTimestamp
    ).length;
  }
  
  // Update stats in database
  await update(globalStatsRef, stats);
  
  return stats;
};

// Get global statistics
export const getGlobalStatistics = async () => {
  const globalStatsRef = ref(database, 'globalStats');
  const snapshot = await get(globalStatsRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  // Return empty stats structure if no stats exist
  return {
    quizzesCreated: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      creationDates: []
    },
    quizzesPlayed: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      playDates: []
    }
  };
};

// Recalculate all statistics (for admin use or periodic updates)
export const recalculateAllStatistics = async () => {
  // Get all results to calculate quizzes played
  const resultsRef = ref(database, 'results');
  const resultsSnapshot = await get(resultsRef);
  
  // Get all quizzes to calculate quizzes created
  const quizzesRef = ref(database, 'quizzes');
  const quizzesSnapshot = await get(quizzesRef);
  
  // Reset all statistics
  const userStatsRef = ref(database, 'userStats');
  await remove(userStatsRef);
  
  const globalStatsRef = ref(database, 'globalStats');
  await remove(globalStatsRef);
  
  // Initialize global stats
  const globalStats = {
    quizzesCreated: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      creationDates: []
    },
    quizzesPlayed: {
      total: 0,
      last30Days: 0,
      last7Days: 0,
      last24Hours: 0,
      playDates: []
    }
  };
  
  // User stats mapping
  const userStats = {};
  
  // Process quizzes created
  if (quizzesSnapshot.exists()) {
    const quizzes = quizzesSnapshot.val();
    
    Object.keys(quizzes).forEach(quizId => {
      const quiz = quizzes[quizId];
      if (quiz.createdBy) {
        const userId = quiz.createdBy;
        const timestamp = quiz.createdAt || getCurrentTimestamp();
        
        // Initialize user stats if not exists
        if (!userStats[userId]) {
          userStats[userId] = {
            quizzesCreated: {
              total: 0,
              last30Days: 0,
              last7Days: 0,
              last24Hours: 0,
              creationDates: []
            },
            quizzesPlayed: {
              total: 0,
              last30Days: 0,
              last7Days: 0,
              last24Hours: 0,
              playDates: []
            }
          };
        }
        
        // Update user stats
        userStats[userId].quizzesCreated.total += 1;
        userStats[userId].quizzesCreated.creationDates.push(timestamp);
        
        // Update global stats
        globalStats.quizzesCreated.total += 1;
        globalStats.quizzesCreated.creationDates.push(timestamp);
      }
    });
  }
  
  // Process quizzes played
  if (resultsSnapshot.exists()) {
    const results = resultsSnapshot.val();
    
    Object.keys(results).forEach(resultId => {
      const result = results[resultId];
      if (result.userId) {
        const userId = result.userId;
        const timestamp = result.date || getCurrentTimestamp();
        
        // Initialize user stats if not exists
        if (!userStats[userId]) {
          userStats[userId] = {
            quizzesCreated: {
              total: 0,
              last30Days: 0,
              last7Days: 0,
              last24Hours: 0,
              creationDates: []
            },
            quizzesPlayed: {
              total: 0,
              last30Days: 0,
              last7Days: 0,
              last24Hours: 0,
              playDates: []
            }
          };
        }
        
        // Update user stats
        userStats[userId].quizzesPlayed.total += 1;
        userStats[userId].quizzesPlayed.playDates.push(timestamp);
        
        // Update global stats
        globalStats.quizzesPlayed.total += 1;
        globalStats.quizzesPlayed.playDates.push(timestamp);
      }
    });
  }
  
  // Calculate time-based stats for all users
  const last30DaysTimestamp = getTimestampDaysAgo(30);
  const last7DaysTimestamp = getTimestampDaysAgo(7);
  const last24HoursTimestamp = getTimestampDaysAgo(1);
  
  Object.keys(userStats).forEach(userId => {
    const stats = userStats[userId];
    
    // Calculate created stats
    stats.quizzesCreated.last30Days = stats.quizzesCreated.creationDates.filter(
      date => date >= last30DaysTimestamp
    ).length;
    
    stats.quizzesCreated.last7Days = stats.quizzesCreated.creationDates.filter(
      date => date >= last7DaysTimestamp
    ).length;
    
    stats.quizzesCreated.last24Hours = stats.quizzesCreated.creationDates.filter(
      date => date >= last24HoursTimestamp
    ).length;
    
    // Calculate played stats
    stats.quizzesPlayed.last30Days = stats.quizzesPlayed.playDates.filter(
      date => date >= last30DaysTimestamp
    ).length;
    
    stats.quizzesPlayed.last7Days = stats.quizzesPlayed.playDates.filter(
      date => date >= last7DaysTimestamp
    ).length;
    
    stats.quizzesPlayed.last24Hours = stats.quizzesPlayed.playDates.filter(
      date => date >= last24HoursTimestamp
    ).length;
    
    // Write updated user stats to database
    set(ref(database, `userStats/${userId}`), stats);
  });
  
  // Calculate global time-based stats
  globalStats.quizzesCreated.last30Days = globalStats.quizzesCreated.creationDates.filter(
    date => date >= last30DaysTimestamp
  ).length;
  
  globalStats.quizzesCreated.last7Days = globalStats.quizzesCreated.creationDates.filter(
    date => date >= last7DaysTimestamp
  ).length;
  
  globalStats.quizzesCreated.last24Hours = globalStats.quizzesCreated.creationDates.filter(
    date => date >= last24HoursTimestamp
  ).length;
  
  globalStats.quizzesPlayed.last30Days = globalStats.quizzesPlayed.playDates.filter(
    date => date >= last30DaysTimestamp
  ).length;
  
  globalStats.quizzesPlayed.last7Days = globalStats.quizzesPlayed.playDates.filter(
    date => date >= last7DaysTimestamp
  ).length;
  
  globalStats.quizzesPlayed.last24Hours = globalStats.quizzesPlayed.playDates.filter(
    date => date >= last24HoursTimestamp
  ).length;
  
  // Write updated global stats to database
  await set(globalStatsRef, globalStats);
  
  return {
    globalStats,
    userStats
  };
};