// Firebase database operations
import { database } from './config.js';
import { 
  ref, 
  set, 
  push, 
  get, 
  remove, 
  update,
  child,
  serverTimestamp
} from 'firebase/database';

// --------- QUIZ OPERATIONS ---------

// Create a new quiz
export const createQuiz = async (quizData) => {
  const quizzesRef = ref(database, 'quizzes');
  const newQuizRef = push(quizzesRef);
  const quizId = newQuizRef.key;
  
  await set(newQuizRef, {
    title: quizData.title,
    description: quizData.description,
    coverImage: quizData.coverImage || "",
    category: quizData.category || "General",
    tags: quizData.tags || [],
    questions: quizData.questions || []
  });
  
  return quizId;
};

// Get all quizzes
export const getAllQuizzes = async () => {
  const quizzesRef = ref(database, 'quizzes');
  const snapshot = await get(quizzesRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

// Get a specific quiz by ID
export const getQuizById = async (quizId) => {
  const quizRef = ref(database, `quizzes/${quizId}`);
  const snapshot = await get(quizRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Update a quiz
export const updateQuiz = async (quizId, quizData) => {
  const quizRef = ref(database, `quizzes/${quizId}`);
  await update(quizRef, quizData);
  return quizId;
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
  const quizRef = ref(database, `quizzes/${quizId}`);
  await remove(quizRef);
  return quizId;
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

// --------- QUESTION OPERATIONS ---------

// Create a new question
export const createQuestion = async (questionData) => {
  const questionsRef = ref(database, 'questions');
  const newQuestionRef = push(questionsRef);
  const questionId = newQuestionRef.key;
  
  await set(newQuestionRef, {
    question: questionData.question,
    answers: questionData.answers || []
  });
  
  return questionId;
};

// Get a specific question by ID
export const getQuestionById = async (questionId) => {
  const questionRef = ref(database, `questions/${questionId}`);
  const snapshot = await get(questionRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Update a question
export const updateQuestion = async (questionId, questionData) => {
  const questionRef = ref(database, `questions/${questionId}`);
  await update(questionRef, questionData);
  return questionId;
};

// Delete a question
export const deleteQuestion = async (questionId) => {
  const questionRef = ref(database, `questions/${questionId}`);
  await remove(questionRef);
  return questionId;
};

// --------- ANSWER OPERATIONS ---------

// Create a new answer
export const createAnswer = async (answerData) => {
  const answersRef = ref(database, 'answers');
  const newAnswerRef = push(answersRef);
  const answerId = newAnswerRef.key;
  
  await set(newAnswerRef, {
    answer: answerData.answer,
    isCorrect: answerData.isCorrect || false
  });
  
  return answerId;
};

// Get a specific answer by ID
export const getAnswerById = async (answerId) => {
  const answerRef = ref(database, `answers/${answerId}`);
  const snapshot = await get(answerRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Update an answer
export const updateAnswer = async (answerId, answerData) => {
  const answerRef = ref(database, `answers/${answerId}`);
  await update(answerRef, answerData);
  return answerId;
};

// Delete an answer
export const deleteAnswer = async (answerId) => {
  const answerRef = ref(database, `answers/${answerId}`);
  await remove(answerRef);
  return answerId;
};

// --------- CATEGORY OPERATIONS ---------

// Create a new category
export const createCategory = async (categoryData) => {
  const categoriesRef = ref(database, 'categories');
  const newCategoryRef = push(categoriesRef);
  const categoryId = newCategoryRef.key;
  
  await set(newCategoryRef, {
    name: categoryData.name,
    slug: categoryData.slug,
    description: categoryData.description || "",
    isActive: categoryData.isActive !== false, // Default to true if not specified
    displayOrder: categoryData.displayOrder || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return categoryId;
};

// Get all categories
export const getAllCategories = async (includeInactive = false) => {
  const categoriesRef = ref(database, 'categories');
  const snapshot = await get(categoriesRef);
  
  if (snapshot.exists()) {
    const categoriesData = snapshot.val();
    const categoriesArray = Object.keys(categoriesData).map(key => ({
      id: key,
      ...categoriesData[key]
    }));
    
    // Filter out inactive categories if needed
    return includeInactive 
      ? categoriesArray 
      : categoriesArray.filter(category => category.isActive !== false);
  }
  return [];
};

// Get a specific category by ID
export const getCategoryById = async (categoryId) => {
  const categoryRef = ref(database, `categories/${categoryId}`);
  const snapshot = await get(categoryRef);
  
  if (snapshot.exists()) {
    return {
      id: categoryId,
      ...snapshot.val()
    };
  }
  return null;
};

// Update a category
export const updateCategory = async (categoryId, categoryData) => {
  const categoryRef = ref(database, `categories/${categoryId}`);
  
  // Add updated timestamp
  const updatedData = {
    ...categoryData,
    updatedAt: serverTimestamp()
  };
  
  await update(categoryRef, updatedData);
  return categoryId;
};

// Delete a category
export const deleteCategory = async (categoryId) => {
  // Check if the category is used by any quizzes
  const quizzesRef = ref(database, 'quizzes');
  const snapshot = await get(quizzesRef);
  
  if (snapshot.exists()) {
    const quizzesData = snapshot.val();
    const isUsed = Object.values(quizzesData).some(quiz => 
      quiz.categoryId === categoryId
    );
    
    if (isUsed) {
      throw new Error('Cannot delete category that is used by quizzes. Deactivate it instead.');
    }
  }
  
  // If not used, proceed with deletion
  const categoryRef = ref(database, `categories/${categoryId}`);
  await remove(categoryRef);
  return categoryId;
};

// Toggle category active status
export const toggleCategoryStatus = async (categoryId, isActive) => {
  const categoryRef = ref(database, `categories/${categoryId}`);
  await update(categoryRef, { 
    isActive: isActive,
    updatedAt: serverTimestamp()
  });
  return categoryId;
};

// --------- RESULT OPERATIONS ---------

// Create a new result
export const createResult = async (resultData) => {
  const resultsRef = ref(database, 'results');
  const newResultRef = push(resultsRef);
  const resultId = newResultRef.key;
  
  await set(newResultRef, {
    quizId: resultData.quizId,
    userId: resultData.userId,
    score: resultData.score,
    date: serverTimestamp()
  });
  
  return resultId;
};

// Get results by user ID
export const getResultsByUserId = async (userId) => {
  const resultsRef = ref(database, 'results');
  const snapshot = await get(resultsRef);
  
  if (snapshot.exists()) {
    const allResults = snapshot.val();
    const userResults = {};
    
    Object.keys(allResults).forEach(key => {
      if (allResults[key].userId === userId) {
        userResults[key] = allResults[key];
      }
    });
    
    return userResults;
  }
  return {};
};

// Get results by quiz ID
export const getResultsByQuizId = async (quizId) => {
  const resultsRef = ref(database, 'results');
  const snapshot = await get(resultsRef);
  
  if (snapshot.exists()) {
    const allResults = snapshot.val();
    const quizResults = {};
    
    Object.keys(allResults).forEach(key => {
      if (allResults[key].quizId === quizId) {
        quizResults[key] = allResults[key];
      }
    });
    
    return quizResults;
  }
  return {};
};

// Delete a result
export const deleteResult = async (resultId) => {
  const resultRef = ref(database, `results/${resultId}`);
  await remove(resultRef);
  return resultId;
};

// Migrate existing quizzes to have default timeout
export const migrateQuizTimeouts = async () => {
  try {
    console.log('Starting migration for quiz timeouts...');
    
    // Get all quizzes
    const quizzesRef = ref(database, 'quizzes');
    const snapshot = await get(quizzesRef);
    
    if (!snapshot.exists()) {
      console.log('No quizzes found in the database.');
      return { success: true, updated: 0, message: 'No quizzes found to update.' };
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
    return { 
      success: true, 
      updated: updatedCount, 
      message: `Updated ${updatedCount} quizzes with default timeout of 20 seconds.` 
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return { 
      success: false, 
      error: error.message, 
      message: 'Failed to update quizzes with default timeout.' 
    };
  }
};

export { migrateQuizTimeouts };