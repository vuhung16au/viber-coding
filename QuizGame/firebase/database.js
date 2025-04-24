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