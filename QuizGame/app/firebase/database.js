// Firebase Realtime Database service for quiz operations
import { 
  ref as databaseRef, 
  set, 
  push, 
  get, 
  remove, 
  update, 
  query as dbQuery, 
  orderByChild, 
  equalTo,
  serverTimestamp
} from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Database paths
const QUIZZES_PATH = 'quizzes';
const QUESTIONS_PATH = 'questions';
const ANSWERS_PATH = 'answers';
const RESULTS_PATH = 'results';

// Maximum number of retry attempts for operations
const MAX_RETRY_ATTEMPTS = 3;
// Delay between retry attempts (in milliseconds)
const RETRY_DELAY = 1000;

/**
 * Helper function to delay execution
 * @param {Number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Number} retries - Number of retry attempts remaining
 * @param {Number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} - Result of the function
 */
async function retryOperation(fn, retries = MAX_RETRY_ATTEMPTS, baseDelay = RETRY_DELAY) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    console.log(`Operation failed, retrying... (${MAX_RETRY_ATTEMPTS - retries + 1}/${MAX_RETRY_ATTEMPTS})`);
    // Exponential backoff with jitter
    const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
    await delay(baseDelay * jitter);
    
    return retryOperation(fn, retries - 1, baseDelay * 2);
  }
}

/**
 * Create a new quiz in Realtime Database
 * @param {Object} quizData - The quiz data to save
 * @param {String} userId - The ID of the user creating the quiz
 * @returns {Promise<String>} - The ID of the created quiz
 */
export async function createQuiz(quizData, userId) {
  return retryOperation(async () => {
    try {
      // Generate a new quiz ID
      const quizRef = push(databaseRef(db, QUIZZES_PATH));
      const quizId = quizRef.key;
      
      // Extract questions from quiz data
      const questionsData = quizData.questions || [];
      const questionIds = [];
      
      // Process each question and its answers
      for (const questionItem of questionsData) {
        const options = questionItem.options || [];
        const correctAnswer = questionItem.correctAnswer;
        
        // Create answer documents first
        const answerIds = [];
        
        for (const option of options) {
          // Add answer document
          const answerRef = push(databaseRef(db, ANSWERS_PATH));
          const answerId = answerRef.key;
          
          await set(answerRef, {
            answer: option,
            isCorrect: option === correctAnswer,
            createdAt: serverTimestamp()
          });
          
          answerIds.push(answerId);
        }
        
        // Add question document
        const questionRef = push(databaseRef(db, QUESTIONS_PATH));
        const questionId = questionRef.key;
        
        await set(questionRef, {
          question: questionItem.question,
          answers: answerIds,
          createdAt: serverTimestamp()
        });
        
        questionIds.push(questionId);
      }
      
      // Prepare quiz metadata
      const quizWithMetadata = {
        title: quizData.title,
        description: quizData.description,
        coverImage: quizData.image || '/images/default-quiz.jpg',
        category: quizData.category || '',
        tags: quizData.tags || [],
        questions: questionIds,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Save the quiz data
      await set(quizRef, quizWithMetadata);
      
      return quizId;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  });
}

/**
 * Get all quizzes
 * @returns {Promise<Array>} - Array of quiz objects
 */
export async function getAllQuizzes() {
  return retryOperation(async () => {
    try {
      const quizzesRef = databaseRef(db, QUIZZES_PATH);
      const snapshot = await get(quizzesRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      return quizzes;
    } catch (error) {
      console.error('Error getting quizzes:', error);
      throw error;
    }
  });
}

/**
 * Get quizzes created by a specific user
 * @param {String} userId - The ID of the user
 * @returns {Promise<Array>} - Array of quiz objects
 */
export async function getUserQuizzes(userId) {
  return retryOperation(async () => {
    try {
      const quizzesRef = databaseRef(db, QUIZZES_PATH);
      const userQuizzesQuery = dbQuery(quizzesRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuizzesQuery);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const quizzes = [];
      snapshot.forEach((childSnapshot) => {
        quizzes.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      return quizzes;
    } catch (error) {
      console.error('Error getting user quizzes:', error);
      throw error;
    }
  });
}

/**
 * Get a single quiz by ID with all related questions and answers
 * @param {String} quizId - The ID of the quiz to get
 * @returns {Promise<Object>} - The quiz object with expanded questions and answers
 */
export async function getQuizById(quizId) {
  return retryOperation(async () => {
    try {
      // Get the quiz data
      const quizRef = databaseRef(db, `${QUIZZES_PATH}/${quizId}`);
      const quizSnapshot = await get(quizRef);
      
      if (!quizSnapshot.exists()) {
        throw new Error('Quiz not found');
      }
      
      const quizData = quizSnapshot.val();
      const questionIds = quizData.questions || [];
      
      // Get all questions
      const questionsWithAnswers = await Promise.all(
        questionIds.map(async (qId) => {
          const questionRef = databaseRef(db, `${QUESTIONS_PATH}/${qId}`);
          const questionSnapshot = await get(questionRef);
          
          if (!questionSnapshot.exists()) return null;
          
          const questionData = questionSnapshot.val();
          const answerIds = questionData.answers || [];
          
          // Get all answers for this question
          const answers = await Promise.all(
            answerIds.map(async (aId) => {
              const answerRef = databaseRef(db, `${ANSWERS_PATH}/${aId}`);
              const answerSnapshot = await get(answerRef);
              
              if (!answerSnapshot.exists()) return null;
              
              return {
                id: aId,
                ...answerSnapshot.val()
              };
            })
          );
          
          // Filter out any null answers
          const validAnswers = answers.filter(a => a !== null);
          
          // Find correct answer
          const correctAnswer = validAnswers.find(a => a.isCorrect)?.answer || '';
          
          // Format question with answers in the format expected by the UI
          return {
            id: qId,
            question: questionData.question,
            options: validAnswers.map(a => a.answer),
            correctAnswer: correctAnswer
          };
        })
      );
      
      // Filter out any null values from questions (in case some weren't found)
      const validQuestions = questionsWithAnswers.filter(q => q !== null);
      
      // Return the quiz with expanded questions
      return {
        id: quizId,
        ...quizData,
        questions: validQuestions
      };
    } catch (error) {
      console.error('Error getting quiz with questions and answers:', error);
      throw error;
    }
  });
}

/**
 * Update an existing quiz
 * @param {String} quizId - The ID of the quiz to update
 * @param {Object} quizData - The updated quiz data
 * @returns {Promise<void>}
 */
export async function updateQuiz(quizId, quizData) {
  return retryOperation(async () => {
    try {
      // Get the current quiz data
      const quizRef = databaseRef(db, `${QUIZZES_PATH}/${quizId}`);
      const quizSnapshot = await get(quizRef);
      
      if (!quizSnapshot.exists()) {
        throw new Error('Quiz not found');
      }
      
      const currentQuizData = quizSnapshot.val();
      
      // Extract questions from new quiz data
      const newQuestionsData = quizData.questions || [];
      
      // Create a list of question IDs to keep
      const updatedQuestionIds = [];
      
      // Process each question and its answers
      for (const questionItem of newQuestionsData) {
        let questionId = questionItem.id;
        const options = questionItem.options || [];
        const correctAnswer = questionItem.correctAnswer;
        
        // If this is an existing question
        if (questionId && currentQuizData.questions.includes(questionId)) {
          // Update the question
          const questionRef = databaseRef(db, `${QUESTIONS_PATH}/${questionId}`);
          const questionSnapshot = await get(questionRef);
          
          if (questionSnapshot.exists()) {
            const currentQuestionData = questionSnapshot.val();
            const currentAnswerIds = currentQuestionData.answers || [];
            
            // Delete old answers
            for (const answerId of currentAnswerIds) {
              await remove(databaseRef(db, `${ANSWERS_PATH}/${answerId}`));
            }
            
            // Create new answers
            const newAnswerIds = [];
            for (const option of options) {
              const answerRef = push(databaseRef(db, ANSWERS_PATH));
              const answerId = answerRef.key;
              
              await set(answerRef, {
                answer: option,
                isCorrect: option === correctAnswer,
                createdAt: serverTimestamp()
              });
              
              newAnswerIds.push(answerId);
            }
            
            // Update the question with new answers
            await update(questionRef, {
              question: questionItem.question,
              answers: newAnswerIds,
              updatedAt: serverTimestamp()
            });
            
            updatedQuestionIds.push(questionId);
          }
        } else {
          // This is a new question, create it with its answers
          const answerIds = [];
          
          for (const option of options) {
            const answerRef = push(databaseRef(db, ANSWERS_PATH));
            const answerId = answerRef.key;
            
            await set(answerRef, {
              answer: option,
              isCorrect: option === correctAnswer,
              createdAt: serverTimestamp()
            });
            
            answerIds.push(answerId);
          }
          
          const questionRef = push(databaseRef(db, QUESTIONS_PATH));
          const questionId = questionRef.key;
          
          await set(questionRef, {
            question: questionItem.question,
            answers: answerIds,
            createdAt: serverTimestamp()
          });
          
          updatedQuestionIds.push(questionId);
        }
      }
      
      // Delete questions and answers that are no longer in the quiz
      const removedQuestionIds = currentQuizData.questions.filter(
        id => !updatedQuestionIds.includes(id)
      );
      
      for (const qId of removedQuestionIds) {
        const questionRef = databaseRef(db, `${QUESTIONS_PATH}/${qId}`);
        const questionSnapshot = await get(questionRef);
        
        if (questionSnapshot.exists()) {
          const questionData = questionSnapshot.val();
          const answerIds = questionData.answers || [];
          
          // Delete all answers for this question
          for (const aId of answerIds) {
            await remove(databaseRef(db, `${ANSWERS_PATH}/${aId}`));
          }
          
          // Delete the question
          await remove(questionRef);
        }
      }
      
      // Update the quiz document
      await update(quizRef, {
        title: quizData.title || currentQuizData.title,
        description: quizData.description || currentQuizData.description,
        coverImage: quizData.image || currentQuizData.coverImage,
        category: quizData.category || currentQuizData.category,
        tags: quizData.tags || currentQuizData.tags,
        questions: updatedQuestionIds,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  });
}

/**
 * Delete a quiz and all related questions and answers
 * @param {String} quizId - The ID of the quiz to delete
 * @returns {Promise<void>}
 */
export async function deleteQuiz(quizId) {
  return retryOperation(async () => {
    try {
      // Get the quiz
      const quizRef = databaseRef(db, `${QUIZZES_PATH}/${quizId}`);
      const quizSnapshot = await get(quizRef);
      
      if (!quizSnapshot.exists()) {
        console.warn(`Quiz with ID ${quizId} not found for deletion`);
        return;
      }
      
      const quizData = quizSnapshot.val();
      const questionIds = quizData.questions || [];
      
      // Delete each question and its answers
      for (const qId of questionIds) {
        const questionRef = databaseRef(db, `${QUESTIONS_PATH}/${qId}`);
        const questionSnapshot = await get(questionRef);
        
        if (questionSnapshot.exists()) {
          const questionData = questionSnapshot.val();
          const answerIds = questionData.answers || [];
          
          // Delete all answers for this question
          for (const aId of answerIds) {
            await remove(databaseRef(db, `${ANSWERS_PATH}/${aId}`));
          }
          
          // Delete the question
          await remove(questionRef);
        }
      }
      
      // Delete the quiz
      await remove(quizRef);
    } catch (error) {
      console.error('Error deleting quiz with related data:', error);
      throw error;
    }
  });
}

/**
 * Upload an image to Firebase Storage and get its URL
 * @param {File} imageFile - The image file to upload
 * @param {String} userId - The ID of the user uploading the image
 * @returns {Promise<String>} - The download URL of the uploaded image
 */
export async function uploadQuizImage(imageFile, userId) {
  return retryOperation(async () => {
    try {
      // Check if imageFile is valid
      if (!imageFile || !(imageFile instanceof File || imageFile instanceof Blob)) {
        console.warn('Invalid image file provided for upload');
        return '/images/default-quiz.jpg';
      }

      // Verify file size before uploading (limit to 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        console.warn('Image file too large (max 5MB)');
        return '/images/default-quiz.jpg';
      }

      const imageStorageRef = storageRef(storage, `quiz-images/${userId}/${Date.now()}_${imageFile.name}`);
      
      // Try to upload the image
      await uploadBytes(imageStorageRef, imageFile);
      return await getDownloadURL(imageStorageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      // Return a default image URL instead of throwing an error
      return '/images/default-quiz.jpg';
    }
  });
}

/**
 * Save a quiz result
 * @param {String} quizId - The ID of the quiz
 * @param {String} userId - The ID of the user
 * @param {Number} score - The user's score
 * @returns {Promise<String>} - The ID of the saved result
 */
export async function saveQuizResult(quizId, userId, score) {
  return retryOperation(async () => {
    try {
      const resultRef = push(databaseRef(db, RESULTS_PATH));
      const resultId = resultRef.key;
      
      const resultData = {
        quizId,
        userId,
        score,
        date: serverTimestamp()
      };
      
      await set(resultRef, resultData);
      return resultId;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  });
}

/**
 * Get quiz results for a specific user
 * @param {String} userId - The ID of the user
 * @returns {Promise<Array>} - Array of quiz result objects
 */
export async function getUserResults(userId) {
  return retryOperation(async () => {
    try {
      const resultsRef = databaseRef(db, RESULTS_PATH);
      const userResultsQuery = dbQuery(resultsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userResultsQuery);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const results = [];
      snapshot.forEach((childSnapshot) => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error getting user quiz results:', error);
      throw error;
    }
  });
}

/**
 * Get all results for a specific quiz
 * @param {String} quizId - The ID of the quiz
 * @returns {Promise<Array>} - Array of quiz result objects
 */
export async function getQuizResults(quizId) {
  return retryOperation(async () => {
    try {
      const resultsRef = databaseRef(db, RESULTS_PATH);
      const quizResultsQuery = dbQuery(resultsRef, orderByChild('quizId'), equalTo(quizId));
      const snapshot = await get(quizResultsQuery);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const results = [];
      snapshot.forEach((childSnapshot) => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error getting quiz results:', error);
      throw error;
    }
  });
}