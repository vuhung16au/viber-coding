// Test script for Firebase database operations
import { 
  populateDatabase, 
  testDeleteQuiz, 
  getAllQuizzes, 
  getQuizById 
} from './firebase/populate-database.js';

async function runTests() {
  try {
    console.log("============== FIREBASE QUIZ APP TESTS ==============");
    
    // Step 1: Populate the database with sample data
    console.log("\n----- POPULATING DATABASE -----");
    const { generalQuizId, techQuizId } = await populateDatabase();
    console.log(`Created General Quiz with ID: ${generalQuizId}`);
    console.log(`Created Tech Quiz with ID: ${techQuizId}`);
    
    // Step 2: Get all quizzes to verify data was populated
    console.log("\n----- FETCHING ALL QUIZZES -----");
    const allQuizzes = await getAllQuizzes();
    console.log("Quizzes in database:", Object.keys(allQuizzes).length);
    console.log("Quiz IDs:", Object.keys(allQuizzes));
    
    // Step 3: Get a specific quiz by ID
    console.log("\n----- FETCHING SPECIFIC QUIZ -----");
    const quizDetails = await getQuizById(generalQuizId);
    console.log(`Quiz "${quizDetails.title}" details:`, quizDetails);
    
    // Step 4: Test deleting a quiz
    console.log("\n----- TESTING QUIZ DELETION -----");
    const deletionResult = await testDeleteQuiz(techQuizId);
    console.log(`Quiz deletion test ${deletionResult ? 'PASSED' : 'FAILED'}`);
    
    // Step 5: Verify deletion by getting all quizzes again
    console.log("\n----- VERIFYING DELETION -----");
    const remainingQuizzes = await getAllQuizzes();
    console.log("Remaining quizzes in database:", Object.keys(remainingQuizzes).length);
    console.log("Remaining quiz IDs:", Object.keys(remainingQuizzes));
    
    console.log("\n============== TESTS COMPLETED ==============");
  } catch (error) {
    console.error("Test Error:", error);
  }
}

// Run the tests
runTests();