'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
// Use the database from the centralized firebase config
import { database } from '../../../../firebase/config';
import { ref, get } from 'firebase/database';
import Question from '../../../components/Question';
import QuizResults from '../../../components/QuizResults';
import { generateSlug } from '../../../../utils/slug';

export default function QuizPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params); // Unwrap the params Promise
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to get a quiz by ID from Firebase Realtime Database
  const getQuizById = async (quizId) => {
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

  useEffect(() => {
    // Fetch quiz by id from Realtime Database
    const fetchQuiz = async () => {
      try {
        if (!unwrappedParams || !unwrappedParams.id) {
          setError('Quiz ID not found');
          setLoading(false);
          return;
        }
        
        const quizId = unwrappedParams.id;
        const fetchedQuiz = await getQuizById(quizId);
        
        if (fetchedQuiz) {
          // If the URL doesn't have a slug yet and we're not on a page with a slug parameter,
          // redirect to the slugified URL
          if (fetchedQuiz.description && !unwrappedParams.slug) {
            const slug = generateSlug(fetchedQuiz.description);
            router.replace(`/${unwrappedParams.lang}/quiz/${quizId}/${slug}`);
            return; // Stop further execution as we're redirecting
          }
          
          // Fetch the questions for this quiz
          const questions = [];
          
          // If questions is an array of IDs, fetch each question
          if (fetchedQuiz.questions && Array.isArray(fetchedQuiz.questions)) {
            for (const questionId of fetchedQuiz.questions) {
              const questionRef = ref(database, `questions/${questionId}`);
              const questionSnapshot = await get(questionRef);
              
              if (questionSnapshot.exists()) {
                const questionData = questionSnapshot.val();
                
                // Make sure we have question text (handle different formats)
                const questionText = questionData.question || questionData.text || '';
                
                // Fetch answers for this question
                let answers = [];
                
                if (questionData.answers && Array.isArray(questionData.answers)) {
                  for (const answerId of questionData.answers) {
                    const answerRef = ref(database, `answers/${answerId}`);
                    const answerSnapshot = await get(answerRef);
                    
                    if (answerSnapshot.exists()) {
                      const answerData = answerSnapshot.val();
                      // Ensure we have a proper answer object with correct ID and text
                      answers.push({
                        id: answerId,
                        text: answerData.text || answerData.answer || answerData.toString(),
                        isCorrect: answerData.isCorrect || false
                      });
                    }
                  }
                }
                
                // Determine correct answer ID
                let correctAnswer = null;
                
                // First check if the question has a correctAnswer property
                if (questionData.correctAnswer) {
                  correctAnswer = questionData.correctAnswer;
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
          
          // Update the quiz with fetched questions
          setQuiz({
            ...fetchedQuiz,
            questions
          });
          
          // Initialize userAnswers array with the correct length
          setUserAnswers(new Array(questions.length).fill(null));
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
  }, [unwrappedParams, router]);

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
    setShowResults(true);
  };

  // Retry quiz
  const retryQuiz = () => {
    if (!quiz || !quiz.questions) return;
    
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setShowResults(false);
  };

  // Calculate score
  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    
    let correctAnswers = 0;
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = userAnswers[i];
      
      // Find the correct answer
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    return correctAnswers;
  };

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
          onClick={() => router.push(`/${unwrappedParams?.lang || 'en'}`)}
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
          onClick={() => router.push(`/${unwrappedParams?.lang || 'en'}`)}
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