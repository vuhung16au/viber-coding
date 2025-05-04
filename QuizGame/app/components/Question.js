import { useState, useEffect, useRef } from 'react';
import MathJaxRenderer from './MathJaxRenderer';

// Utility to unescape HTML entities (if any)
function unescapeHtml(s) {
  if (!s) return '';
  const doc = typeof window !== 'undefined' ? window.document : null;
  if (doc) {
    const textarea = doc.createElement('textarea');
    textarea.innerHTML = s;
    return textarea.value;
  }
  // fallback for SSR
  return s.replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
}

export default function Question({ question, onAnswer, showResult = false, selectedAnswer = null, timeoutInSeconds = 20, onTimeout }) {
  const [selected, setSelected] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(timeoutInSeconds);
  const timeoutCallbackRef = useRef(onTimeout);
  
  // Update the ref when onTimeout changes
  useEffect(() => {
    timeoutCallbackRef.current = onTimeout;
  }, [onTimeout]);
  
  // Update selected state when selectedAnswer prop changes
  useEffect(() => {
    setSelected(selectedAnswer);
  }, [selectedAnswer]);
  
  // Setup countdown timer
  useEffect(() => {
    // Reset timer when question changes
    setTimeRemaining(timeoutInSeconds);
    
    // Only start countdown if not showing results and timeout is enabled
    if (!showResult && timeoutInSeconds > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Trigger timeout callback when time reaches zero
            const currentOnTimeout = timeoutCallbackRef.current;
            if (currentOnTimeout) {
              // Use setTimeout to avoid state updates during render
              setTimeout(() => {
                currentOnTimeout();
              }, 0);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Cleanup interval on unmount or when question changes
      return () => clearInterval(timer);
    }
  }, [question.id, timeoutInSeconds, showResult]);
  
  const handleOptionClick = (answerId) => {
    if (showResult) return; // Prevent changing answer if showing results
    setSelected(answerId);
    onAnswer(answerId);
  };

  // Calculate color for timer based on remaining time
  const getTimerColor = () => {
    if (timeRemaining > timeoutInSeconds * 0.6) return 'text-green-500';
    if (timeRemaining > timeoutInSeconds * 0.3) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Timer Display */}
      {timeoutInSeconds > 0 && !showResult && (
        <div className="mb-4 flex justify-end">
          <div className={`text-lg font-bold ${getTimerColor()}`}>
            {timeRemaining}s
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        <MathJaxRenderer content={unescapeHtml(question.question)} />
      </h2>
      
      <div className="space-y-3">
        {question.answers && question.answers.map((answer, index) => {
          const isCorrect = selected === answer.id && answer.id === question.correctAnswer;
          const isIncorrect = selected === answer.id && answer.id !== question.correctAnswer;
          
          // Get answer text from the appropriate property
          // Check for all possible property names where the answer text could be stored
          const answerText = answer.text || answer.answer || (typeof answer === 'string' ? answer : '');
          
          return (
            <button
              key={answer.id}
              onClick={() => handleOptionClick(answer.id)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                selected === answer.id 
                  ? showResult
                    ? isCorrect 
                      ? 'bg-green-100 dark:bg-green-800 border-2 border-green-500' 
                      : 'bg-red-100 dark:bg-red-800 border-2 border-red-500'
                    : 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-pressed={selected === answer.id}
              disabled={showResult}
            >
              <div className="flex items-center">
                <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1"><MathJaxRenderer content={unescapeHtml(answerText)} /></span>
                
                {showResult && answer.id === question.correctAnswer && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                
                {showResult && isIncorrect && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}