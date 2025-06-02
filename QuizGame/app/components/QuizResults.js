import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';
import { saveQuizResult } from '../firebase/database';
import { recordQuizPlayed } from '../firebase/statistics';
import MathJaxRenderer from './MathJaxRenderer';

export default function QuizResults({ quiz, questions, score, totalQuestions, totalPoints, totalPossiblePoints, userAnswers, onRetry }) {
  const { currentUser } = useAuth();
  const percentage = Math.round((score / totalQuestions) * 100);
  const pointPercentage = totalPossiblePoints > 0 ? Math.round((totalPoints / totalPossiblePoints) * 100) : 0;
  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});
  const [explanationErrors, setExplanationErrors] = useState({});
  const [resultSaved, setResultSaved] = useState(false);
  
  // Save quiz result when component mounts
  useEffect(() => {
    const saveResult = async () => {
      if (!currentUser || !quiz || resultSaved) return;
      
      try {
        // Save the quiz result to database
        const resultId = await saveQuizResult(
          quiz.id,
          currentUser.uid,
          percentage,
          score,
          totalQuestions,
          null, // timeTaken - could be added later
          new Date(), // dateTaken
          totalPoints,
          totalPossiblePoints
        );
        
        // Also record in statistics
        if (resultId) {
          await recordQuizPlayed(
            currentUser.uid,
            quiz.id,
            percentage,
            totalQuestions,
            score,
            null, // timeTaken
            totalPoints,
            totalPossiblePoints
          );
        }
        
        setResultSaved(true);
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    };
    
    saveResult();
  }, [currentUser, quiz, score, totalQuestions, totalPoints, totalPossiblePoints, percentage, resultSaved]);

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

  // Handle getting explanation for a specific question
  const handleExplain = async (questionIndex, question) => {
    // If we already have an explanation, just toggle its visibility
    if (explanations[questionIndex]) {
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: undefined
      }));
      return;
    }

    // Start loading state
    setLoadingExplanations(prev => ({
      ...prev,
      [questionIndex]: true
    }));
    
    try {
      // Get user answer and correct answer
      const userAnswerId = userAnswers[questionIndex];
      const userAnswer = question.answers.find(a => a.id === userAnswerId);
      const correctAnswer = question.answers.find(a => a.id === question.correctAnswer);
      
      // Call the API endpoint to generate an explanation
      const response = await fetch('/api/quiz/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          userAnswer: userAnswer ? userAnswer.text || userAnswer.answer : "Not answered",
          correctAnswer: correctAnswer ? correctAnswer.text || correctAnswer.answer : "N/A"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate explanation');
      }
      
      const data = await response.json();
      
      // Save the explanation
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: data.explanation
      }));
      
      // Clear any previous errors
      setExplanationErrors(prev => ({
        ...prev,
        [questionIndex]: undefined
      }));
    } catch (error) {
      console.error("Error generating explanation:", error);
      setExplanationErrors(prev => ({
        ...prev,
        [questionIndex]: error.message || "Failed to generate explanation. Please try again."
      }));
    } finally {
      // End loading state
      setLoadingExplanations(prev => ({
        ...prev,
        [questionIndex]: false
      }));
    }
  };

  let message = '';
  let messageClass = '';
  
  // Use point percentage for messaging if points are available, otherwise use regular percentage
  const displayPercentage = (totalPoints !== undefined && totalPossiblePoints !== undefined) ? pointPercentage : percentage;
  
  if (displayPercentage >= 90) {
    message = 'Excellent! You\'re a genius!';
    messageClass = 'text-green-600 dark:text-green-400';
  } else if (displayPercentage >= 70) {
    message = 'Great job! Well done!';
    messageClass = 'text-green-600 dark:text-green-400';
  } else if (displayPercentage >= 50) {
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
        {totalPoints !== undefined && totalPossiblePoints !== undefined && (
          <div className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400">
            Points: {totalPoints} / {totalPossiblePoints} ({pointPercentage}%)
          </div>
        )}
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
          const hasExplanation = explanations[index];
          const questionPoints = question.points || 1;
          
          return (
            <div 
              key={index}
              className={`p-4 border rounded-lg ${
                isCorrect 
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                  : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span className="flex-1"><MathJaxRenderer content={question.question} /></span>
                </div>
                <div className="flex items-center">
                  {/* Point indicator */}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium mr-2 ${
                    questionPoints === 2 
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
                      : questionPoints === 0 
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {questionPoints === 2 ? '2 pts' : questionPoints === 0 ? '0 pts' : '1 pt'}
                  </span>
                  {isCorrect ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <button
                    onClick={() => handleExplain(index, question)}
                    disabled={loadingExplanations[index]}
                    className={`px-2 py-1 text-sm font-medium rounded ${
                      hasExplanation
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors`}
                  >
                    {loadingExplanations[index] ? 'Loading...' : (hasExplanation ? 'Hide Explanation' : 'Explain')}
                  </button>
                </div>
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
              
              {/* Explanation section */}
              {explanationErrors[index] && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
                  <p className="font-medium">Error: {explanationErrors[index]}</p>
                </div>
              )}
              
              {explanations[index] && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Explanation:</h4>
                  <div className="prose dark:prose-invert max-w-none">
                    <MathJaxRenderer content={explanations[index]} />
                  </div>
                </div>
              )}
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