import { useState, useEffect } from 'react';
import MathJaxRenderer from './MathJaxRenderer';

export default function QuizResults({ quiz, questions, score, totalQuestions, userAnswers, onRetry }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Add keyboard shortcuts for retry
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen for 'R' key to retry quiz
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onRetry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRetry]);

  let message = '';
  let messageClass = '';
  
  if (percentage >= 90) {
    message = 'Excellent! You\'re a genius!';
    messageClass = 'text-green-600 dark:text-green-400';
  } else if (percentage >= 70) {
    message = 'Great job! Well done!';
    messageClass = 'text-green-600 dark:text-green-400';
  } else if (percentage >= 50) {
    message = 'Good effort! Keep learning!';
    messageClass = 'text-yellow-600 dark:text-yellow-400';
  } else {
    message = 'Keep practicing! You\'ll get better!';
    messageClass = 'text-red-600 dark:text-red-400';
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Quiz Results
      </h2>
      
      <div className="mb-10 text-center">
        <div className="text-5xl font-bold mb-2">{score} / {totalQuestions}</div>
        <div className="text-2xl font-semibold mb-3">{percentage}%</div>
        <div className={`text-xl font-medium ${messageClass}`}>{message}</div>
      </div>
      
      <div className="space-y-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Question Review
        </h3>
        
        {(questions || quiz.questions || []).map((question, index) => {
          if (!question || !question.answers) return null;
          const userAnswerId = userAnswers[index];
          const userAnswer = question.answers.find(a => a.id === userAnswerId);
          const correctAnswer = question.answers.find(a => a.id === question.correctAnswer);
          const isCorrect = userAnswerId === question.correctAnswer;
          
          return (
            <div 
              key={index}
              className={`p-4 border rounded-lg ${
                isCorrect 
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                  : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start mb-2">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span className="flex-1"><MathJaxRenderer content={question.question} /></span>
                {isCorrect ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className="ml-6 space-y-1">
                <div className={`${
                  isCorrect ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-300'
                }`}>
                  <span className="font-medium">Your answer: </span>
                  {userAnswer ? <MathJaxRenderer content={userAnswer.text || userAnswer.answer} /> : 'Not answered'}
                </div>
                
                {!isCorrect && (
                  <div className="text-green-700 dark:text-green-400">
                    <span className="font-medium">Correct answer: </span>
                    {correctAnswer ? <MathJaxRenderer content={correctAnswer.text || correctAnswer.answer} /> : 'N/A'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}