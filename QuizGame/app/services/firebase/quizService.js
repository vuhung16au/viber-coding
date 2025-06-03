'use client';

import { database as db } from '../../../firebase/config';
import { ref, push, set, serverTimestamp, get, update } from 'firebase/database';
import { recordQuizCreated } from '../../firebase/statistics';

// Helper function to create answers for a question
const createAnswers = async (options, correctAnswer) => {
  const answerIds = [];
  
  for (const option of options) {
    const answersRef = ref(db, 'answers');
    const newAnswerRef = push(answersRef);
    const answerId = newAnswerRef.key;
    
    await set(newAnswerRef, {
      answer: option,
      isCorrect: option === correctAnswer
    });
    
    answerIds.push(answerId);
  }
  
  return answerIds;
};

// Helper function to create a question with its answers
const createQuestion = async (questionData) => {
  // Create answers first
  const answerIds = await createAnswers(questionData.options, questionData.correctAnswer);
  
  // Then create the question with answer references
  const questionsRef = ref(db, 'questions');
  const newQuestionRef = push(questionsRef);
  const questionId = newQuestionRef.key;
  
  await set(newQuestionRef, {
    question: questionData.question,
    answers: answerIds
  });
  
  return questionId;
};

// Helper to map category names
const getCategoryName = (category) => {
  const categoryMappings = {
    'general': 'General Knowledge',
    'science': 'Science & Technology',
    'technology': 'Science & Technology',
    'history': 'History',
    'geography': 'Geography',
    'entertainment': 'Pop Culture',
    'sports': 'Sports',
    'other': 'Other'
  };
  
  return category && category.trim() !== '' 
    ? (categoryMappings[category] || category)
    : 'General Knowledge';
};

// Create a new quiz in Firebase Realtime Database
export const createQuiz = async (quizData, userId) => {
  // Create questions and gather their IDs
  const questionIds = [];
  for (const questionData of quizData.questions) {
    const questionId = await createQuestion(questionData);
    questionIds.push(questionId);
  }
  
  // Ensure category has a default value if not provided
  const category = getCategoryName(quizData.category);
  
  // Create the quiz with question references
  const quizzesRef = ref(db, 'quizzes');
  const newQuizRef = push(quizzesRef);
  const quizId = newQuizRef.key;
  
  if (!userId) {
    throw new Error("Cannot read properties of undefined (reading 'uid')");
  }
  
  await set(newQuizRef, {
    title: quizData.title,
    description: quizData.description,
    prompt: quizData.prompt || '',
    coverImage: quizData.coverImage,
    category: category,
    categoryId: quizData.categoryId || null,
    tags: quizData.tags || '',
    questions: questionIds,
    userId: userId,
    createdAt: serverTimestamp(),
    isFeatured: quizData.isFeatured || false,
    isPublic: quizData.isPublic || false,
    defaultTimeout: quizData.defaultTimeout || 20
  });
  
  // Record statistics
  await recordQuizCreated(userId, quizId);
  
  return quizId;
};

// Update an existing quiz in Firebase Realtime Database
export const updateQuiz = async (quizId, quizData, userId) => {
  // Create questions and gather their IDs
  const questionIds = [];
  for (const questionData of quizData.questions) {
    const questionId = await createQuestion(questionData);
    questionIds.push(questionId);
  }
  
  // Ensure category has a default value if not provided
  const category = getCategoryName(quizData.category);
  
  // Update the quiz with new question references
  const quizRef = ref(db, `quizzes/${quizId}`);
  
  if (!userId) {
    throw new Error("Cannot read properties of undefined (reading 'uid')");
  }
  
  await update(quizRef, {
    title: quizData.title,
    description: quizData.description,
    prompt: quizData.prompt || '',
    coverImage: quizData.coverImage,
    category: category,
    categoryId: quizData.categoryId || null,
    tags: quizData.tags || '',
    questions: questionIds,
    // Don't update userId - keep the original creator
    updatedAt: serverTimestamp(),
    isFeatured: quizData.isFeatured || false,
    isPublic: quizData.isPublic || false,
    defaultTimeout: quizData.defaultTimeout || 20
  });
  
  return quizId;
};

// Fetch quiz data for editing
export const fetchQuizForEdit = async (quizId, currentUserId) => {
  if (!quizId) return null;

  try {
    const quizRef = ref(db, `quizzes/${quizId}`);
    const snapshot = await get(quizRef);

    if (snapshot.exists()) {
      const quizToEdit = snapshot.val();
      
      // Check if user has permission to edit
      if (quizToEdit.userId !== currentUserId) {
        throw new Error("You don't have permission to edit this quiz");
      }

      // Create a copy of the original quiz data
      const editData = {
        title: quizToEdit.title || '',
        description: quizToEdit.description || '',
        prompt: quizToEdit.prompt || '',
        coverImage: quizToEdit.coverImage || '/images/default-quiz.jpg',
        category: quizToEdit.category || '',
        categoryId: quizToEdit.categoryId || '',
        tags: quizToEdit.tags || '',
        isFeatured: quizToEdit.isFeatured || false,
        isPublic: quizToEdit.isPublic || false,
        defaultTimeout: quizToEdit.defaultTimeout || 20,
        questions: []
      };

      // Fetch questions
      if (Array.isArray(quizToEdit.questions)) {
        for (const questionId of quizToEdit.questions) {
          const questionRef = ref(db, `questions/${questionId}`);
          const questionSnapshot = await get(questionRef);
          
          if (questionSnapshot.exists()) {
            const questionData = questionSnapshot.val();
            let options = [];
            let correctAnswer = '';

            // Fetch answers for this question
            if (Array.isArray(questionData.answers)) {
              for (const answerId of questionData.answers) {
                const answerRef = ref(db, `answers/${answerId}`);
                const answerSnapshot = await get(answerRef);
                
                if (answerSnapshot.exists()) {
                  const answerData = answerSnapshot.val();
                  options.push(answerData.answer);
                  if (answerData.isCorrect) {
                    correctAnswer = answerData.answer;
                  }
                }
              }
            }

            // Add the question to our questions array
            if (options.length > 0) {
              editData.questions.push({
                id: editData.questions.length + 1,
                question: questionData.question,
                options,
                correctAnswer,
                points: questionData.points || 1
              });
            }
          }
        }
      }

      return { success: true, data: editData };
    } else {
      throw new Error("Quiz not found");
    }
  } catch (error) {
    console.error("Error fetching quiz for edit:", error);
    return { success: false, error: error.message || "Failed to load quiz for editing" };
  }
};
