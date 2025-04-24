/**
 * This file contains Firebase Cloud Functions for the Quiz Get It Right application.
 * 
 * To deploy these functions:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Initialize the project: firebase init functions
 * 4. Deploy functions: firebase deploy --only functions
 * 
 * Documentation: https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
    
    if (!usersSnapshot.exists()) {
      console.log('No user statistics found, nothing to refresh');
      return null;
    }
    
    const currentTime = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;
    const THIRTY_DAYS = 30 * ONE_DAY;
    
    const users = usersSnapshot.val();
    const allUsersPlayed = { last24Hours: 0, last7Days: 0, last30Days: 0 };
    const allUsersCreated = { last24Hours: 0, last7Days: 0, last30Days: 0 };
    
    // Process each user
    const userUpdatePromises = [];
    for (const userId in users) {
      const userStats = users[userId];
      
      // Recalculate time-based metrics for quizzes played
      if (userStats.quizzesPlayed?.history) {
        const history = Object.values(userStats.quizzesPlayed.history);
        
        const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
        
        userUpdatePromises.push(
          db.ref(`statistics/users/${userId}/quizzesPlayed`).update({
            last24Hours,
            last7Days,
            last30Days
          })
        );
        
        allUsersPlayed.last24Hours += last24Hours;
        allUsersPlayed.last7Days += last7Days;
        allUsersPlayed.last30Days += last30Days;
      }
      
      // Recalculate time-based metrics for quizzes created
      if (userStats.quizzesCreated?.history) {
        const history = Object.values(userStats.quizzesCreated.history);
        
        const last24Hours = history.filter(entry => entry.timestamp > (currentTime - ONE_DAY)).length;
        const last7Days = history.filter(entry => entry.timestamp > (currentTime - SEVEN_DAYS)).length;
        const last30Days = history.filter(entry => entry.timestamp > (currentTime - THIRTY_DAYS)).length;
        
        userUpdatePromises.push(
          db.ref(`statistics/users/${userId}/quizzesCreated`).update({
            last24Hours,
            last7Days,
            last30Days
          })
        );
        
        allUsersCreated.last24Hours += last24Hours;
        allUsersCreated.last7Days += last7Days;
        allUsersCreated.last30Days += last30Days;
      }
    }
    
    // Update global time-based metrics
    userUpdatePromises.push(
      db.ref('statistics/global/quizzesPlayed').update({
        last24Hours: allUsersPlayed.last24Hours,
        last7Days: allUsersPlayed.last7Days,
        last30Days: allUsersPlayed.last30Days
      })
    );
    
    userUpdatePromises.push(
      db.ref('statistics/global/quizzesCreated').update({
        last24Hours: allUsersCreated.last24Hours,
        last7Days: allUsersCreated.last7Days,
        last30Days: allUsersCreated.last30Days
      })
    );
    
    await Promise.all(userUpdatePromises);
    
    console.log('Statistics refresh job completed successfully');
    return null;
  } catch (error) {
    console.error('Error refreshing statistics:', error);
    return null;
  }
});

/**
 * Cloud function that runs when a new quiz is played.
 * This updates both user and global statistics.
 */
exports.onQuizPlayed = functions.database
  .ref('/statistics/users/{userId}/quizzesPlayed/history/{timestamp}')
  .onCreate(async (snapshot, context) => {
    try {
      const { userId, timestamp } = context.params;
      console.log(`Quiz played by user ${userId} at timestamp ${timestamp}`);
      
      // The global total is easier to increment directly rather than recounting
      const globalRef = admin.database().ref('statistics/global/quizzesPlayed/total');
      await globalRef.transaction(current => (current || 0) + 1);
      
      return null;
    } catch (error) {
      console.error('Error in onQuizPlayed function:', error);
      return null;
    }
  });

/**
 * Cloud function that runs when a new quiz is created.
 * This updates both user and global statistics.
 */
exports.onQuizCreated = functions.database
  .ref('/statistics/users/{userId}/quizzesCreated/history/{timestamp}')
  .onCreate(async (snapshot, context) => {
    try {
      const { userId, timestamp } = context.params;
      console.log(`Quiz created by user ${userId} at timestamp ${timestamp}`);
      
      // The global total is easier to increment directly rather than recounting
      const globalRef = admin.database().ref('statistics/global/quizzesCreated/total');
      await globalRef.transaction(current => (current || 0) + 1);
      
      return null;
    } catch (error) {
      console.error('Error in onQuizCreated function:', error);
      return null;
    }
  });