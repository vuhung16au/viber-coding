'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
// Use the database from the centralized firebase config
import { database } from '../../../../firebase/config';
import { ref, get } from 'firebase/database';
import Question from '../../../components/Question';
import QuizResults from '../../../components/QuizResults';
import { generateSlug } from '../../../../utils/slug';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const { id, lang } = params || {};
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  
  // Function to get a quiz by ID from Firebase Realtime Database
  const getQuizById = async (quizId) => {
    if (!quizId) return null;
    
    const quizRef = ref(database, `quizzes/${quizId}`);
    const snapshot = await get(quizRef);
    
    if (snapshot.exists()) {
      return {
        id: quizId,
        ...snapshot.val()
      };
    }
    return null;
  };

  // Set start time when quiz is loaded
  useEffect(() => {
    if (quiz && !startTime) {
      setStartTime(new Date());
    }
  }, [quiz, startTime]);

  // Redirect to the slug URL if we only have the ID
  useEffect(() => {
    if (quiz && !window.location.pathname.includes('/' + id + '/')) {
      const slug = generateSlug(quiz.title || quiz.description || '');
      if (slug) {
        router.replace(`/${lang || 'en'}/quiz/${id}/${slug}`);
      }
    }
  }, [quiz, router, id, lang]);

  useEffect(() => {
    // Fetch quiz by id from Realtime Database
    const fetchQuiz = async () => {
      try {
        if (!id) {
          setError('Quiz ID is missing');
          setLoading(false);
          return;
        }
        
        const fetchedQuiz = await getQuizById(id);
        
        if (fetchedQuiz) {
          // Create properly structured questions array
          const questions = [];
          
          // Handle different structures for questions
          if (fetchedQuiz.questions) {
            // If questions is an array of strings (question IDs), fetch each question
            if (Array.isArray(fetchedQuiz.questions)) {
              // Fetch all questions by their IDs
              for (const questionId of fetchedQuiz.questions) {
                // Only process if questionId is a string (reference to a question)
                if (typeof questionId === 'string') {
                  const questionRef = ref(database, `questions/${questionId}`);
                  const questionSnapshot = await get(questionRef);
                  
                  if (questionSnapshot.exists()) {
                    const questionData = questionSnapshot.val();
                    // Create answers array for this question
                    let answers = [];
                    
                    // If the question has answer references, fetch each answer
                    if (Array.isArray(questionData.answers)) {
                      for (const answerId of questionData.answers) {
                        const answerRef = ref(database, `answers/${answerId}`);
                        const answerSnapshot = await get(answerRef);
                        
                        if (answerSnapshot.exists()) {
                          const answerData = answerSnapshot.val();
                          answers.push({
                            id: answerId,
                            text: answerData.answer, // Map the answer field to text for display
                            isCorrect: answerData.isCorrect
                          });
                        }
                      }
                      
                      // Find the correct answer ID
                      const correctAnswer = answers.find(a => a.isCorrect)?.id || '';
                      
                      // Add the question with its answers to our questions array
                      questions.push({
                        id: questionId,
                        question: questionData.question,
                        text: questionData.question,
                        answers,
                        correctAnswer
                      });
                    }
                  }
                } else if (typeof questionId === 'object') {
                  // Handle case where question data is embedded directly
                  // This is fallback code for other formats
                  // ...existing question object handling...
                }
              }
            } 
            // If questions is an object with question IDs as keys
            else if (typeof fetchedQuiz.questions === 'object') {
              for (const questionId of Object.keys(fetchedQuiz.questions)) {
                // Check if the value is a string (reference to question ID)
                const questionValue = fetchedQuiz.questions[questionId];
                
                if (typeof questionValue === 'string') {
                  // This is a reference to a question, fetch it
                  const questionRef = ref(database, `questions/${questionValue}`);
                  const questionSnapshot = await get(questionRef);
                  
                  if (questionSnapshot.exists()) {
                    const questionData = questionSnapshot.val();
                    let answers = [];
                    
                    // If question has answer references, fetch each answer
                    if (Array.isArray(questionData.answers)) {
                      for (const answerId of questionData.answers) {
                        const answerRef = ref(database, `answers/${answerId}`);
                        const answerSnapshot = await get(answerRef);
                        
                        if (answerSnapshot.exists()) {
                          const answerData = answerSnapshot.val();
                          answers.push({
                            id: answerId,
                            text: answerData.answer, // Map the answer field to text for display
                            isCorrect: answerData.isCorrect
                          });
                        }
                      }
                      
                      // Find the correct answer ID
                      const correctAnswer = answers.find(a => a.isCorrect)?.id || '';
                      
                      // Add the question with its answers to our questions array
                      questions.push({
                        id: questionValue,
                        question: questionData.question,
                        text: questionData.question,
                        answers,
                        correctAnswer
                      });
                    }
                  }
                } else {
                  // Process question data that's embedded directly
                  const questionData = questionValue;
                  
                  // Process question text
                  const questionText = questionData.question || questionData.text || '';
                  
                  // Process answers
                  let answers = [];
                  
                  // Handle different formats of answers
                  if (questionData.answers) {
                    if (Array.isArray(questionData.answers)) {
                      // Fetch each answer individually
                      for (const answerId of questionData.answers) {
                        const answerRef = ref(database, `answers/${answerId}`);
                        const answerSnapshot = await get(answerRef);
                        
                        if (answerSnapshot.exists()) {
                          const answerData = answerSnapshot.val();
                          answers.push({
                            id: answerId,
                            text: answerData.answer,  // Map the answer field to text for display
                            isCorrect: answerData.isCorrect
                          });
                        }
                      }
                    } else if (typeof questionData.answers === 'object') {
                      // Convert object to array
                      for (const answerId of Object.keys(questionData.answers)) {
                        const answerData = questionData.answers[answerId];
                        answers.push({
                          id: answerId,
                          text: answerData.answer || answerData.text || '',
                          isCorrect: answerData.isCorrect || false
                        });
                      }
                    }
                  } else if (questionData.options) {
                    // Convert options array to answers format with proper structure
                    answers = questionData.options.map((option, index) => ({
                      id: String(index),
                      text: option,
                      isCorrect: index === parseInt(questionData.correctAnswer)
                    }));
                  } else if (questionData.choices) {
                    // Handle 'choices' property which contains the A, B, C, D options
                    // Convert choices to the expected answers format
                    answers = Object.entries(questionData.choices).map(([key, value]) => ({
                      id: key,
                      text: value,
                      isCorrect: key === questionData.correctAnswer
                    }));
                  }
                  
                  // If answers is still empty, look for other potential properties
                  if (answers.length === 0) {
                    // Check for common letter-based keys: A, B, C, D, etc.
                    const letterKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
                    const hasLetterChoices = letterKeys.some(letter => questionData[letter] !== undefined);
                    
                    if (hasLetterChoices) {
                      letterKeys.forEach(letter => {
                        if (questionData[letter] !== undefined) {
                          answers.push({
                            id: letter,
                            text: questionData[letter],
                            isCorrect: letter === questionData.correctAnswer
                          });
                        }
                      });
                    }
                  }
                  
                  // Determine correct answer ID
                  let correctAnswer = null;
                  
                  // First check if the question has a correctAnswer property
                  if (questionData.correctAnswer !== undefined) {
                    correctAnswer = String(questionData.correctAnswer);
                  } else {
                    // Otherwise, find the correct answer from the isCorrect property
                    const correctAns = answers.find(a => a.isCorrect);
                    if (correctAns) {
                      correctAnswer = correctAns.id;
                    }
                  }
                  
                  // Add question with its answers to the questions array
                  questions.push({
                    id: questionId,
                    question: questionText,  // Ensure this is set for Question component
                    text: questionText,      // Ensure this is set for QuizResults component
                    answers,
                    correctAnswer
                  });
                }
              }
            }
          }
          
          // Update the quiz with fetched questions
          setQuiz({
            ...fetchedQuiz,
            questions
          });
          
          // Initialize userAnswers array with the correct length
          setUserAnswers(new Array(questions.length).fill(null));

          // Check if we need to redirect to include a slug in the URL
          const currentPathSegments = window.location.pathname.split('/');
          const pathIncludesSlug = currentPathSegments.length > 4; // /lang/quiz/id/slug
          
          if (!pathIncludesSlug) {
            // Generate a slug from the quiz title or description
            const slug = generateSlug(fetchedQuiz.title || fetchedQuiz.description || '');
            if (slug) {
              router.replace(`/${lang || 'en'}/quiz/${id}/${slug}`);
            }
          }
        } else {
          setError('Quiz not found');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id, lang, router]);

  // Handle user answer
  const handleAnswer = (answerId) => {
    if (!quiz || !quiz.questions) return;
    
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = answerId;
    setUserAnswers(updatedAnswers);
  };

  // Move to next question
  const nextQuestion = () => {
    if (!quiz || !quiz.questions) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Record end time when submitting the quiz
      setEndTime(new Date());
      setShowResults(true);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (!quiz || !quiz.questions) return;
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const submitQuiz = () => {
    if (!quiz || !quiz.questions) return;
    
    // Record end time when submitting the quiz
    const now = new Date();
    setEndTime(now);
    
    // Calculate time taken in seconds
    if (startTime) {
      const timeInSeconds = Math.floor((now - startTime) / 1000);
      setTimeTaken(timeInSeconds);
    }
    
    setShowResults(true);
  };

  // Retry quiz
  const retryQuiz = () => {
    if (!quiz || !quiz.questions) return;
    
    // Reset the quiz state for a new attempt
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setShowResults(false);
    setStartTime(new Date());
    setEndTime(null);
    setTimeTaken(0);
  };

  // Calculate score
  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    
    let correctAnswers = 0;
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = userAnswers[i];
      
      // Check if user's answer matches the correct answer ID
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    return correctAnswers;
  };

  // Calculate time taken when showing results
  useEffect(() => {
    if (showResults && startTime && endTime) {
      const timeInSeconds = Math.floor((endTime - startTime) / 1000);
      setTimeTaken(timeInSeconds);
    }
  }, [showResults, startTime, endTime]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6 text-red-600 dark:text-red-500">404</h1>
        <p className="text-xl mb-8 text-gray-800 dark:text-gray-200">{error}</p>
        <button 
          onClick={() => router.push(`/${lang || 'en'}`)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // If quiz is null after loading is complete and there's no error, display a generic error
  if (!quiz || !quiz.questions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6 text-red-600 dark:text-red-500">Error</h1>
        <p className="text-xl mb-8 text-gray-800 dark:text-gray-200">Unable to load quiz data</p>
        <button 
          onClick={() => router.push(`/${lang || 'en'}`)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col min-h-screen p-4">
        <QuizResults 
          quiz={quiz}
          score={calculateScore()} 
          totalQuestions={quiz.questions.length}
          userAnswers={userAnswers}
          onRetry={retryQuiz}
          timeTaken={timeTaken}
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = userAnswers[currentQuestionIndex];
  const allQuestionsAnswered = userAnswers.every(answer => answer !== null);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{quiz.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
      </header>

      <div className="flex-grow mb-8">
        <Question 
          question={currentQuestion} 
          onAnswer={handleAnswer} 
          selectedAnswer={currentAnswer}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 font-medium rounded-lg transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={submitQuiz}
            disabled={!currentAnswer}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              !currentAnswer
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              !currentAnswer
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-center space-x-2">
          {quiz.questions.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : userAnswers[index] 
                    ? 'bg-green-600 dark:bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}