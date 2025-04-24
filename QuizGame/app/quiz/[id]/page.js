'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
// Update the Firebase import to match the same one used in the [lang] route
import { database } from '../../../firebase/config';
import { ref, get } from 'firebase/database';
import Question from '../../components/Question';
import QuizResults from '../../components/QuizResults';

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
        const quizId = unwrappedParams.id;
        const fetchedQuiz = await getQuizById(quizId);
        
        if (fetchedQuiz) {
          // Fetch the questions for this quiz
          const questions = [];
          
          // If questions is an array of IDs, fetch each question
          if (fetchedQuiz.questions && Array.isArray(fetchedQuiz.questions)) {
            for (const questionId of fetchedQuiz.questions) {
              const questionRef = ref(database, `questions/${questionId}`);
              const questionSnapshot = await get(questionRef);
              
              if (questionSnapshot.exists()) {
                const questionData = questionSnapshot.val();
                const answers = [];
                
                // Fetch answers for this question
                if (questionData.answers && Array.isArray(questionData.answers)) {
                  for (const answerId of questionData.answers) {
                    const answerRef = ref(database, `answers/${answerId}`);
                    const answerSnapshot = await get(answerRef);
                    
                    if (answerSnapshot.exists()) {
                      answers.push({
                        id: answerId,
                        ...answerSnapshot.val()
                      });
                    }
                  }
                }
                
                // Add question with its answers to the questions array
                questions.push({
                  id: questionId,
                  ...questionData,
                  answers
                });
              }
            }
          }
          
          // Update the quiz with fetched questions
          setQuiz({
            ...fetchedQuiz,
            questions
          });
          
          // Initialize userAnswers array
          setUserAnswers(new Array(fetchedQuiz.questions.length).fill(null));
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
  }, [unwrappedParams.id]);

  // Handle user answer
  const handleAnswer = (answerId) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = answerId;
    setUserAnswers(updatedAnswers);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const submitQuiz = () => {
    setShowResults(true);
  };

  // Retry quiz
  const retryQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setShowResults(false);
  };

  // Calculate score
  const calculateScore = () => {
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
          onClick={() => router.push('/')}
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