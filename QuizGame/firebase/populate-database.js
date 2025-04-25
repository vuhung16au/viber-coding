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

// Define available categories
const AVAILABLE_CATEGORIES = [
  'General Knowledge',
  'Technology',
  'Science',
  'History',
  'Geography',
  'Entertainment',
  'Sports',
  'Literature',
  'Mathematics',
  'Music',
  'Art',
  'Food & Drink'
];

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  let category = null;
  
  // Handle --help option
  if (args.includes("--help") || args.includes("-h")) {
    console.log("\nQuiz Game Database Population Script");
    console.log("\nUsage:");
    console.log("  node populate-database.js [options]");
    console.log("\nOptions:");
    console.log("  --category <category-name>  Specify the category of quiz to populate");
    console.log("  --help, -h                  Display this help message");
    console.log("\nAvailable Categories:");
    AVAILABLE_CATEGORIES.forEach(cat => {
      console.log(`  - ${cat}`);
    });
    process.exit(0);
  }
  
  // Handle --category option
  const categoryIndex = args.indexOf("--category");
  if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
    const requestedCategory = args[categoryIndex + 1];
    if (AVAILABLE_CATEGORIES.includes(requestedCategory)) {
      category = requestedCategory;
      console.log(`Using category: ${category}`);
    } else {
      console.warn(`Warning: Requested category "${requestedCategory}" not found. Using default.`);
      console.log(`Available categories: ${AVAILABLE_CATEGORIES.join(", ")}`);
    }
  }
  
  return { category };
};

// Function to populate the database with sample data
export async function populateDatabase(targetCategory = null) {
  console.log("Starting to populate database with sample data...");
  
  // If no category is provided via function argument, check command line args
  if (!targetCategory) {
    const args = parseArgs();
    targetCategory = args.category;
  }
  
  // Log the selected category if any
  if (targetCategory) {
    console.log(`Populating database with quizzes for category: ${targetCategory}`);
  } else {
    console.log("No specific category selected, populating with default samples");
  }
  
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
    
    // Only create the General Knowledge quiz if no category is specified or if it matches
    let quizId = null;
    if (!targetCategory || targetCategory === "General Knowledge") {
      // Create a sample quiz with question references
      quizId = await createQuiz({
        title: "General Knowledge Quiz",
        description: "Test your knowledge on various topics",
        coverImage: "https://quiz-gotitright.vercel.app/_next/image?url=%2Fimages%2Fdefault-quiz.jpg&w=1200&q=75",
        category: "General Knowledge",
        tags: ["general", "trivia", "knowledge"],
        questions: [question1Id, question2Id]
      });
      
      // Create sample results if general knowledge quiz was created
      await createResult({
        quizId: quizId,
        userId: "user123",
        score: 90
      });
    }
    
    // Only create the Technology quiz if no category is specified or if it matches
    let techQuizId = null;
    if (!targetCategory || targetCategory === "Technology") {
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
      
      techQuizId = await createQuiz({
        title: "Technology Quiz",
        description: "Test your knowledge of technology",
        coverImage: "https://example.com/tech-quiz.jpg",
        category: "Technology",
        tags: ["tech", "programming", "computers"],
        questions: [techQuestionId]
      });
      
      // Create sample results if technology quiz was created
      await createResult({
        quizId: techQuizId,
        userId: "user123",
        score: 100
      });
    }
    
    // Create Science quiz if selected
    let scienceQuizId = null;
    if (!targetCategory || targetCategory === "Science") {
      const scienceAnswerId1 = await createAnswer({
        answer: "H2O",
        isCorrect: true
      });
      
      const scienceAnswerId2 = await createAnswer({
        answer: "CO2",
        isCorrect: false
      });
      
      const scienceAnswerId3 = await createAnswer({
        answer: "NaCl",
        isCorrect: false
      });
      
      const scienceAnswerId4 = await createAnswer({
        answer: "O2",
        isCorrect: false
      });
      
      const scienceQuestionId = await createQuestion({
        question: "What is the chemical formula for water?",
        answers: [scienceAnswerId1, scienceAnswerId2, scienceAnswerId3, scienceAnswerId4]
      });
      
      scienceQuizId = await createQuiz({
        title: "Science Quiz",
        description: "Test your knowledge of basic science",
        coverImage: "https://example.com/science-quiz.jpg",
        category: "Science",
        tags: ["science", "chemistry", "biology"],
        questions: [scienceQuestionId]
      });
    }
    
    // Add more category quizzes here...
    
    // Create Entertainment quiz if selected
    let entertainmentQuizId = null;
    if (!targetCategory || targetCategory === "Entertainment") {
      const entertainmentAnswerId1 = await createAnswer({
        answer: "Avengers: Endgame",
        isCorrect: true
      });
      
      const entertainmentAnswerId2 = await createAnswer({
        answer: "Avatar",
        isCorrect: false
      });
      
      const entertainmentAnswerId3 = await createAnswer({
        answer: "Titanic",
        isCorrect: false
      });
      
      const entertainmentAnswerId4 = await createAnswer({
        answer: "Star Wars: The Force Awakens",
        isCorrect: false
      });
      
      const entertainmentQuestionId = await createQuestion({
        question: "Which movie held the record for highest-grossing film of all time as of 2025?",
        answers: [entertainmentAnswerId1, entertainmentAnswerId2, entertainmentAnswerId3, entertainmentAnswerId4]
      });
      
      entertainmentQuizId = await createQuiz({
        title: "Entertainment Quiz",
        description: "Test your knowledge of movies, TV shows, and celebrities",
        coverImage: "https://example.com/entertainment-quiz.jpg",
        category: "Entertainment",
        tags: ["movies", "tv", "celebrities"],
        questions: [entertainmentQuestionId]
      });
    }
    
    // Create Sports quiz if selected
    let sportsQuizId = null;
    if (!targetCategory || targetCategory === "Sports") {
      const sportsAnswerId1 = await createAnswer({
        answer: "Basketball",
        isCorrect: true
      });
      
      const sportsAnswerId2 = await createAnswer({
        answer: "Soccer",
        isCorrect: false
      });
      
      const sportsAnswerId3 = await createAnswer({
        answer: "Tennis",
        isCorrect: false
      });
      
      const sportsAnswerId4 = await createAnswer({
        answer: "Golf",
        isCorrect: false
      });
      
      const sportsQuestionId = await createQuestion({
        question: "Which sport uses a court with a hoop 10 feet off the ground?",
        answers: [sportsAnswerId1, sportsAnswerId2, sportsAnswerId3, sportsAnswerId4]
      });
      
      sportsQuizId = await createQuiz({
        title: "Sports Quiz",
        description: "Test your knowledge of various sports",
        coverImage: "https://example.com/sports-quiz.jpg",
        category: "Sports",
        tags: ["sports", "athletics", "games"],
        questions: [sportsQuestionId]
      });
    }
    
    // Create Literature quiz if selected
    let literatureQuizId = null;
    if (!targetCategory || targetCategory === "Literature") {
      const literatureAnswerId1 = await createAnswer({
        answer: "William Shakespeare",
        isCorrect: true
      });
      
      const literatureAnswerId2 = await createAnswer({
        answer: "Charles Dickens",
        isCorrect: false
      });
      
      const literatureAnswerId3 = await createAnswer({
        answer: "Jane Austen",
        isCorrect: false
      });
      
      const literatureAnswerId4 = await createAnswer({
        answer: "Mark Twain",
        isCorrect: false
      });
      
      const literatureQuestionId = await createQuestion({
        question: "Who wrote 'Romeo and Juliet'?",
        answers: [literatureAnswerId1, literatureAnswerId2, literatureAnswerId3, literatureAnswerId4]
      });
      
      literatureQuizId = await createQuiz({
        title: "Literature Quiz",
        description: "Test your knowledge of famous books and authors",
        coverImage: "https://example.com/literature-quiz.jpg",
        category: "Literature",
        tags: ["books", "authors", "classics"],
        questions: [literatureQuestionId]
      });
    }
    
    // Create Music quiz if selected
    let musicQuizId = null;
    if (!targetCategory || targetCategory === "Music") {
      const musicAnswerId1 = await createAnswer({
        answer: "The Beatles",
        isCorrect: true
      });
      
      const musicAnswerId2 = await createAnswer({
        answer: "The Rolling Stones",
        isCorrect: false
      });
      
      const musicAnswerId3 = await createAnswer({
        answer: "Queen",
        isCorrect: false
      });
      
      const musicAnswerId4 = await createAnswer({
        answer: "Led Zeppelin",
        isCorrect: false
      });
      
      const musicQuestionId = await createQuestion({
        question: "Which band released the album 'Abbey Road'?",
        answers: [musicAnswerId1, musicAnswerId2, musicAnswerId3, musicAnswerId4]
      });
      
      musicQuizId = await createQuiz({
        title: "Music Quiz",
        description: "Test your knowledge of music history and artists",
        coverImage: "https://example.com/music-quiz.jpg",
        category: "Music",
        tags: ["music", "bands", "albums"],
        questions: [musicQuestionId]
      });
    }
    
    // Create Art quiz if selected
    let artQuizId = null;
    if (!targetCategory || targetCategory === "Art") {
      const artAnswerId1 = await createAnswer({
        answer: "Leonardo da Vinci",
        isCorrect: true
      });
      
      const artAnswerId2 = await createAnswer({
        answer: "Pablo Picasso",
        isCorrect: false
      });
      
      const artAnswerId3 = await createAnswer({
        answer: "Vincent van Gogh",
        isCorrect: false
      });
      
      const artAnswerId4 = await createAnswer({
        answer: "Michelangelo",
        isCorrect: false
      });
      
      const artQuestionId = await createQuestion({
        question: "Who painted the Mona Lisa?",
        answers: [artAnswerId1, artAnswerId2, artAnswerId3, artAnswerId4]
      });
      
      artQuizId = await createQuiz({
        title: "Art Quiz",
        description: "Test your knowledge of famous artworks and artists",
        coverImage: "https://example.com/art-quiz.jpg",
        category: "Art",
        tags: ["art", "paintings", "artists"],
        questions: [artQuestionId]
      });
    }
    
    // Create Food & Drink quiz if selected
    let foodDrinkQuizId = null;
    if (!targetCategory || targetCategory === "Food & Drink") {
      const foodDrinkAnswerId1 = await createAnswer({
        answer: "Italy",
        isCorrect: true
      });
      
      const foodDrinkAnswerId2 = await createAnswer({
        answer: "France",
        isCorrect: false
      });
      
      const foodDrinkAnswerId3 = await createAnswer({
        answer: "Spain",
        isCorrect: false
      });
      
      const foodDrinkAnswerId4 = await createAnswer({
        answer: "Greece",
        isCorrect: false
      });
      
      const foodDrinkQuestionId = await createQuestion({
        question: "Which country is the origin of pizza?",
        answers: [foodDrinkAnswerId1, foodDrinkAnswerId2, foodDrinkAnswerId3, foodDrinkAnswerId4]
      });
      
      foodDrinkQuizId = await createQuiz({
        title: "Food & Drink Quiz",
        description: "Test your knowledge of cuisine and beverages",
        coverImage: "https://example.com/food-quiz.jpg",
        category: "Food & Drink",
        tags: ["food", "drink", "cuisine"],
        questions: [foodDrinkQuestionId]
      });
    }
    
    console.log("Database populated successfully!");
    return { 
      generalQuizId: quizId, 
      techQuizId: techQuizId,
      scienceQuizId: scienceQuizId,
      entertainmentQuizId: entertainmentQuizId,
      sportsQuizId: sportsQuizId,
      literatureQuizId: literatureQuizId,
      musicQuizId: musicQuizId,
      artQuizId: artQuizId,
      foodDrinkQuizId: foodDrinkQuizId
    };
    
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

// Run the populate function if this file is executed directly (not imported)
if (import.meta.url === import.meta.main) {
  populateDatabase();
}