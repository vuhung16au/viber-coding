import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { recordQuizPlayed } from '../firebase/statistics';

export default function QuizResults({ quiz, score, totalQuestions, userAnswers, onRetry, timeTaken }) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Record quiz completed in statistics
  useEffect(() => {
    if (currentUser && quiz) {
      // Calculate the number of correct answers from the score
      const correctAnswers = score;
      
      // Record the quiz in both places for backward compatibility
      // 1. Use the statistics module for detailed tracking
      recordQuizPlayed(
        currentUser.uid, 
        quiz.id, 
        percentage, 
        totalQuestions, 
        correctAnswers, 
        timeTaken || null
      );
      
      // 2. Also save to the main results collection
      import('../firebase/database').then(({ saveQuizResult }) => {
        saveQuizResult(
          quiz.id, 
          currentUser.uid, 
          percentage, 
          correctAnswers,
          totalQuestions,
          timeTaken || null,
          new Date()
        )
          .catch(error => console.error('Error saving quiz result:', error));
      });
    }
  }, [currentUser, quiz, score, totalQuestions, percentage, timeTaken]);

  const toggleDetails = () => {
    setExpandedDetails(!expandedDetails);
  };
  
  // Format time taken in a readable way
  const formatTimeTaken = (seconds) => {
    if (!seconds || seconds <= 0) return 'Not recorded';
    
    if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? '' : 's'}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes === 1 ? '' : 's'}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}` : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours === 1 ? '' : 's'}${minutes > 0 ? ` ${minutes} minute${minutes === 1 ? '' : 's'}` : ''}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quiz Results</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{quiz.title}</p>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48 mb-4">
          <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex justify-center items-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {percentage}%
            </div>
          </div>
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#f3f4f6" 
              strokeWidth="8" 
              className="dark:stroke-gray-700"
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : percentage >= 40 ? '#f59e0b' : '#ef4444'} 
              strokeWidth="8" 
              strokeDasharray={`${percentage * 2.83}, 1000`} 
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        <div className="text-center mb-2">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            You got {score} out of {totalQuestions} questions correct
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {percentage >= 80 ? 'Excellent work!' : 
             percentage >= 60 ? 'Good job!' : 
             percentage >= 40 ? 'Not bad, keep practicing!' : 
             'You can do better!'}
          </p>
          
          {timeTaken && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Time taken: {formatTimeTaken(timeTaken)}
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <button 
          onClick={toggleDetails}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Question Details
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedDetails ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {expandedDetails && (
          <div className="mt-4 space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              // Find the user's selected answer text
              const userAnswerObj = question.answers?.find(a => a.id === userAnswer);
              const userAnswerText = userAnswerObj ? (userAnswerObj.text || userAnswerObj.answer || 'No answer') : 'No answer';
              
              // Find the correct answer text
              const correctAnswerObj = question.answers?.find(a => a.id === question.correctAnswer);
              const correctAnswerText = correctAnswerObj ? (correctAnswerObj.text || correctAnswerObj.answer || 'No correct answer') : 'No correct answer';
              
              // Display text can be in question.text or question.question field
              const questionText = question.text || question.question || '';
              
              return (
                <div key={question.id} className={`border ${isCorrect ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20'} rounded-lg p-4`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`shrink-0 mt-1 w-6 h-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                      {isCorrect ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Question {index + 1}: {questionText}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600 dark:text-gray-400">Your answer: </span> 
                          <span className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {userAnswerText}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Correct answer: </span>
                            <span className="text-green-600 dark:text-green-400">{correctAnswerText}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex-1 sm:flex-none flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Try Again
        </button>
        <Link
          href={`/${locale || 'en'}/quizzes`}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors flex-1 sm:flex-none text-center flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          More Quizzes
        </Link>
      </div>
    </div>
  );
}