// Script to populate Firebase with sample data
import { 
  createQuiz, 
  createQuestion, 
  createAnswer, 
  createResult, 
  deleteQuiz,
  getQuizById,
  getAllQuizzes
} from './database.js';

// Function to populate the database with sample data
export async function populateDatabase() {
  console.log("Starting to populate database with sample data...");
  
  try {
    // Create sample answers for question 1
    const answer1_1Id = await createAnswer({
      answer: "Paris",
      isCorrect: true
    });
    
    const answer1_2Id = await createAnswer({
      answer: "London",
      isCorrect: false
    });
    
    const answer1_3Id = await createAnswer({
      answer: "Berlin",
      isCorrect: false
    });
    
    const answer1_4Id = await createAnswer({
      answer: "Rome",
      isCorrect: false
    });
    
    // Create sample answers for question 2
    const answer2_1Id = await createAnswer({
      answer: "Jupiter",
      isCorrect: true
    });
    
    const answer2_2Id = await createAnswer({
      answer: "Mars",
      isCorrect: false
    });
    
    const answer2_3Id = await createAnswer({
      answer: "Venus",
      isCorrect: false
    });
    
    const answer2_4Id = await createAnswer({
      answer: "Saturn",
      isCorrect: false
    });
    
    // Create sample questions with answer references
    const question1Id = await createQuestion({
      question: "What is the capital of France?",
      answers: [answer1_1Id, answer1_2Id, answer1_3Id, answer1_4Id]
    });
    
    const question2Id = await createQuestion({
      question: "Which is the largest planet in our solar system?",
      answers: [answer2_1Id, answer2_2Id, answer2_3Id, answer2_4Id]
    });
    
    // Create a sample quiz with question references
    const quizId = await createQuiz({
      title: "General Knowledge Quiz",
      description: "Test your knowledge on various topics",
      coverImage: "https://example.com/quiz-cover.jpg",
      category: "General Knowledge",
      tags: ["general", "trivia", "knowledge"],
      questions: [question1Id, question2Id]
    });
    
    // Create another quiz
    const techAnswerId1 = await createAnswer({
      answer: "JavaScript",
      isCorrect: true
    });
    
    const techAnswerId2 = await createAnswer({
      answer: "Java",
      isCorrect: false
    });
    
    const techAnswerId3 = await createAnswer({
      answer: "Python",
      isCorrect: false
    });
    
    const techQuestionId = await createQuestion({
      question: "Which language is primarily used for web development?",
      answers: [techAnswerId1, techAnswerId2, techAnswerId3]
    });
    
    const techQuizId = await createQuiz({
      title: "Technology Quiz",
      description: "Test your knowledge of technology",
      coverImage: "https://example.com/tech-quiz.jpg",
      category: "Technology",
      tags: ["tech", "programming", "computers"],
      questions: [techQuestionId]
    });
    
    // Create sample results
    await createResult({
      quizId: quizId,
      userId: "user123",
      score: 90
    });
    
    await createResult({
      quizId: techQuizId,
      userId: "user123",
      score: 100
    });
    
    console.log("Database populated successfully!");
    return { generalQuizId: quizId, techQuizId: techQuizId };
    
  } catch (error) {
    console.error("Error populating database:", error);
    throw error;
  }
}

// Function to test deleting a quiz
export async function testDeleteQuiz(quizId) {
  console.log(`Testing deletion of quiz with ID: ${quizId}`);
  
  try {
    // Check if quiz exists before deletion
    const quizBefore = await getQuizById(quizId);
    if (quizBefore) {
      console.log("Quiz found before deletion:", quizBefore);
      
      // Delete the quiz
      await deleteQuiz(quizId);
      console.log("Quiz deleted successfully.");
      
      // Check if quiz exists after deletion
      const quizAfter = await getQuizById(quizId);
      if (quizAfter) {
        console.log("Quiz still exists after deletion attempt:", quizAfter);
        return false;
      } else {
        console.log("Quiz no longer exists. Deletion successful!");
        return true;
      }
    } else {
      console.log("Quiz not found before deletion.");
      return false;
    }
  } catch (error) {
    console.error("Error in quiz deletion test:", error);
    return false;
  }
}

// Export functions for testing
export {
  getAllQuizzes,
  getQuizById,
  deleteQuiz
};