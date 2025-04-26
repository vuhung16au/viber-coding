// Update existing quizzes to add timeout value
import { database } from '../firebase/config.js';
import { ref, get, update } from 'firebase/database';

async function migrateQuizTimeouts() {
  try {
    console.log('Starting migration for quiz timeouts...');
    
    // Get all quizzes
    const quizzesRef = ref(database, 'quizzes');
    const snapshot = await get(quizzesRef);
    
    if (!snapshot.exists()) {
      console.log('No quizzes found in the database.');
      return;
    }
    
    const quizzes = snapshot.val();
    const quizIds = Object.keys(quizzes);
    let updatedCount = 0;
    
    console.log(`Found ${quizIds.length} quizzes to process.`);
    
    // Update each quiz with defaultTimeout if missing
    for (const quizId of quizIds) {
      const quiz = quizzes[quizId];
      
      if (!quiz.defaultTimeout) {
        const quizRef = ref(database, `quizzes/${quizId}`);
        await update(quizRef, {
          defaultTimeout: 20 // Set default timeout to 20 seconds
        });
        updatedCount++;
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} quizzes with default timeout of 20 seconds.`);
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateQuizTimeouts();