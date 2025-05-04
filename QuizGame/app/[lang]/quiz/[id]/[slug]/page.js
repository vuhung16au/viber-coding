'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database } from '../../../../../firebase/config';
import { ref, get } from 'firebase/database';
import Question from '../../../../components/Question';
import QuizResults from '../../../../components/QuizResults';
import { QRCodeCanvas } from 'qrcode.react';
import MathJaxRenderer from '../../../../components/MathJaxRenderer';

export default function QuizPageWithSlug() {
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
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionCache, setQuestionCache] = useState({}); // { [index]: questionObj }
  const [questionLoading, setQuestionLoading] = useState(false);
  
  // Handle question timeout
  const handleQuestionTimeout = () => {
    if (!quiz || !quiz.questions) return;
    
    // Mark the current question as timed out in the user answers array
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = 'timed-out';
    setUserAnswers(updatedAnswers);
    
    // Automatically move to the next question or end the quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End the quiz if this was the last question
      setEndTime(new Date());
      setShowResults(true);
    }
  };
  
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

  // Fetch quiz metadata and question IDs only (not full questions)
  useEffect(() => {
    const fetchQuizMeta = async () => {
      try {
        if (!id) {
          setError('Quiz ID is missing');
          setLoading(false);
          return;
        }
        const quizRef = ref(database, `quizzes/${id}`);
        const snapshot = await get(quizRef);
        if (snapshot.exists()) {
          const quizData = snapshot.val();
          // Only keep metadata and question IDs
          let questionIds = [];
          if (Array.isArray(quizData.questions)) {
            questionIds = quizData.questions;
          } else if (quizData.questions && typeof quizData.questions === 'object') {
            questionIds = Object.values(quizData.questions);
          }
          setQuiz({
            ...quizData,
            questionIds,
            defaultTimeout: quizData.defaultTimeout || 20,
          });
          setUserAnswers(new Array(questionIds.length).fill(null));
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizMeta();
  }, [id, lang]);

  // Fetch a question and its answers by index (if not already cached)
  const fetchQuestionByIndex = async (index) => {
    if (!quiz || !quiz.questionIds || questionCache[index]) return;
    setQuestionLoading(true);
    const questionId = quiz.questionIds[index];
    if (!questionId) {
      setQuestionLoading(false);
      return;
    }
    const questionRef = ref(database, `questions/${questionId}`);
    const questionSnapshot = await get(questionRef);
    if (!questionSnapshot.exists()) {
      setQuestionLoading(false);
      return;
    }
    const questionData = questionSnapshot.val();
    let answers = [];
    if (Array.isArray(questionData.answers)) {
      for (const answerId of questionData.answers) {
        const answerRef = ref(database, `answers/${answerId}`);
        const answerSnapshot = await get(answerRef);
        if (answerSnapshot.exists()) {
          const answerData = answerSnapshot.val();
          answers.push({
            id: answerId,
            text: answerData.answer,
            isCorrect: answerData.isCorrect,
          });
        }
      }
    }
    const correctAnswer = answers.find(a => a.isCorrect)?.id || '';
    const questionObj = {
      id: questionId,
      question: questionData.question,
      text: questionData.question,
      answers,
      correctAnswer,
      timeout: questionData.timeout || quiz.defaultTimeout || 20,
    };
    setQuestionCache(prev => ({ ...prev, [index]: questionObj }));
    setQuestionLoading(false);
  };

  // Fetch current question on index/quiz change
  useEffect(() => {
    if (quiz && quiz.questionIds && quiz.questionIds.length > 0) {
      fetchQuestionByIndex(currentQuestionIndex);
      // Optionally prefetch next question for smoothness
      if (currentQuestionIndex + 1 < quiz.questionIds.length) {
        fetchQuestionByIndex(currentQuestionIndex + 1);
      }
    }
    // eslint-disable-next-line
  }, [quiz, currentQuestionIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    // Only add keyboard listeners when quiz is loaded and not showing results
    if (quiz && !showResults && !loading) {
      const handleKeyDown = (e) => {
        // Prevent default browser behavior for these keys
        if (["a", "b", "c", "d", "n", "p", "Enter"].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
        // Use questionCache for currentQuestion
        const currentQuestion = questionCache[currentQuestionIndex];
        if (!currentQuestion || !Array.isArray(currentQuestion.answers)) return;
        // Handle A, B, C, D keys to select answers
        if (e.key.toLowerCase() === "a" && currentQuestion.answers[0]) {
          handleAnswer(currentQuestion.answers[0].id);
        } else if (e.key.toLowerCase() === "b" && currentQuestion.answers[1]) {
          handleAnswer(currentQuestion.answers[1].id);
        } else if (e.key.toLowerCase() === "c" && currentQuestion.answers[2]) {
          handleAnswer(currentQuestion.answers[2].id);
        } else if (e.key.toLowerCase() === "d" && currentQuestion.answers[3]) {
          handleAnswer(currentQuestion.answers[3].id);
        }
        // Handle N key for next question or submit
        else if (e.key.toLowerCase() === "n") {
          const currentAnswer = userAnswers[currentQuestionIndex];
          if (currentAnswer) {
            if (currentQuestionIndex < quiz.questionIds.length - 1) {
              nextQuestion();
            } else {
              submitQuiz();
            }
          }
        }
        // Handle P key for previous question
        else if (e.key.toLowerCase() === "p") {
          if (currentQuestionIndex > 0) {
            prevQuestion();
          }
        }
        // Handle Enter key to submit current answer and move to next question
        else if (e.key === "Enter") {
          if (currentQuestionIndex === quiz.questionIds.length - 1) {
            submitQuiz();
          } else {
            nextQuestion();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [quiz, questionCache, currentQuestionIndex, userAnswers, showResults, loading]);

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
    if (!quiz || !quiz.questionIds) return;
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz.questionIds.length).fill(null));
    setShowResults(false);
    setStartTime(new Date());
    setEndTime(null);
    setTimeTaken(0);
    setQuestionCache({}); // Clear cached questions for a fresh retry
    setQuestionLoading(false);
  };

  // Calculate score - updated to handle timeouts
  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    
    let correctAnswers = 0;
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = userAnswers[i];
      
      // Check if user's answer matches the correct answer ID and is not a timeout
      if (userAnswer && userAnswer !== 'timed-out' && userAnswer === question.correctAnswer) {
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
  if (!quiz || !quiz.questionIds) {
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

  // Quiz URL for QR code
  const quizUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Show QR code and Start button before quiz starts
  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          <MathJaxRenderer content={quiz.title} />
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400 text-center">Share this QR code so players can join the quiz on their device:</p>
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          {quizUrl && (
            <QRCodeCanvas value={quizUrl} size={200} />
          )}
          <p className="mt-4 text-xs text-gray-500 break-all text-center">{quizUrl}</p>
        </div>
        <button
          onClick={() => setQuizStarted(true)}
          className="mt-4 px-10 py-6 text-2xl font-bold bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Start
        </button>
      </div>
    );
  }

  const currentQuestion = questionCache[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questionIds.length - 1;
  const currentAnswer = userAnswers[currentQuestionIndex];
  const allQuestionsAnswered = userAnswers.every(answer => answer !== null);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          <MathJaxRenderer content={quiz.title} />
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questionIds.length}</p>
      </header>

      {/* Add a question progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6">
        <div 
          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{width: `${((currentQuestionIndex + 1) / quiz.questionIds.length) * 100}%`}}
        ></div>
      </div>

      <div className="flex-grow mb-4">
        {questionLoading || !currentQuestion ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Question 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            selectedAnswer={currentAnswer}
            timeoutInSeconds={currentQuestion.timeout || quiz.defaultTimeout || 20}
            onTimeout={handleQuestionTimeout}
          />
        )}
      </div>

      {/* Redesigned navigation controls - more accessible and better placed */}
      <div className="sticky bottom-4 bg-white dark:bg-gray-800 py-3 px-4 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Question indicator circles */}
          <div className="hidden md:flex items-center space-x-1 flex-1">
            {quiz.questionIds.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex 
                    ? 'bg-blue-600 dark:bg-blue-500' 
                    : userAnswers[index] 
                      ? 'bg-green-600 dark:bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation buttons - centered and more prominent */}
          <div className="flex space-x-3 md:space-x-4 justify-center flex-1">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors flex items-center ${
                currentQuestionIndex === 0
                  ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label="Previous question"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="hidden xs:inline">Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={submitQuiz}
                disabled={!currentAnswer}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors flex items-center ${
                  !currentAnswer
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                aria-label="Submit quiz"
              >
                <span>Submit Quiz</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!currentAnswer}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors flex items-center ${
                  !currentAnswer
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                aria-label="Next question"
              >
                <span className="hidden xs:inline">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Question count indicator */}
          <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400 flex-1 text-right">
            {currentQuestionIndex + 1} / {quiz.questionIds.length}
          </div>
        </div>
      </div>
    </div>
  );
}