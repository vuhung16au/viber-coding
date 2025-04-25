'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
// Update the Firebase import to match the same one used in the [lang] route
import { database } from '../../../firebase/config';
import { ref, get } from 'firebase/database';
import Question from '../../components/Question';
import QuizResults from '../../components/QuizResults';
import { generateSlug } from '../../../utils/slug';

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

  // Redirect to the slug URL if we only have the ID
  useEffect(() => {
    if (quiz && !window.location.pathname.includes('/' + quiz.id + '/')) {
      const slug = generateSlug(quiz.title || quiz.description || '');
      if (slug) {
        router.replace(`/en/quiz/${quiz.id}/${slug}`);
      }
    }
  }, [quiz, router]);

  useEffect(() => {
    // Fetch quiz by id from Realtime Database
    const fetchQuiz = async () => {
      try {
        const quizId = unwrappedParams.id;
        const fetchedQuiz = await getQuizById(quizId);
        
        if (fetchedQuiz) {
          // Create properly structured questions array
          const questions = [];
          
          // Handle different structures for questions
          if (fetchedQuiz.questions) {
            // If questions is an array directly, use it
            if (Array.isArray(fetchedQuiz.questions)) {
              // If the array contains question IDs, fetch each question
              if (typeof fetchedQuiz.questions[0] === 'string') {
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
                    } else if (questionData.options) {
                      // Convert options array to answers format with proper structure
                      answers.push(...questionData.options.map((option, index) => ({
                        id: String(index),
                        text: option,
                        isCorrect: index === parseInt(questionData.correctAnswer)
                      })));
                    }
                    
                    // Add question with its answers to the questions array
                    questions.push({
                      id: questionId,
                      ...questionData,
                      answers
                    });
                  }
                }
              } else {
                // The array contains full question objects
                questions.push(...fetchedQuiz.questions);
              }
            } 
            // If questions is an object with question IDs as keys
            else if (typeof fetchedQuiz.questions === 'object') {
              for (const questionId of Object.keys(fetchedQuiz.questions)) {
                const questionData = fetchedQuiz.questions[questionId];
                
                // Handle case where questionData might be just a reference
                if (typeof questionData === 'string') {
                  // Fetch the actual question data
                  const questionRef = ref(database, `questions/${questionData}`);
                  const questionSnapshot = await get(questionRef);
                  
                  if (questionSnapshot.exists()) {
                    const fullQuestionData = questionSnapshot.val();
                    questions.push({
                      id: questionData,
                      ...fullQuestionData
                    });
                  }
                } 
                // Handle case where question data is directly embedded
                else {
                  // Process question text
                  const questionText = questionData.question || questionData.text || '';
                  
                  // Process answers
                  let answers = [];
                  
                  // Handle different formats of answers
                  if (questionData.answers) {
                    if (Array.isArray(questionData.answers)) {
                      answers = questionData.answers;
                    } else if (typeof questionData.answers === 'object') {
                      // Convert object to array
                      for (const answerId of Object.keys(questionData.answers)) {
                        answers.push({
                          id: answerId,
                          ...questionData.answers[answerId]
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
                    question: questionText,
                    text: questionText,
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
          
          // Initialize userAnswers array
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
  }, [unwrappedParams.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    // Only add keyboard listeners when quiz is loaded and not showing results
    if (quiz && !showResults && !loading) {
      const handleKeyDown = (e) => {
        // Prevent default browser behavior for these keys
        if (['a', 'b', 'c', 'd', 'n', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }

        const currentQuestion = quiz.questions[currentQuestionIndex];
        
        // Handle A, B, C, D keys to select answers
        if (e.key.toLowerCase() === 'a' && currentQuestion.answers[0]) {
          handleAnswer(currentQuestion.answers[0].id);
        } else if (e.key.toLowerCase() === 'b' && currentQuestion.answers[1]) {
          handleAnswer(currentQuestion.answers[1].id);
        } else if (e.key.toLowerCase() === 'c' && currentQuestion.answers[2]) {
          handleAnswer(currentQuestion.answers[2].id);
        } else if (e.key.toLowerCase() === 'd' && currentQuestion.answers[3]) {
          handleAnswer(currentQuestion.answers[3].id);
        }
        
        // Handle N key for next question or submit
        else if (e.key.toLowerCase() === 'n') {
          const currentAnswer = userAnswers[currentQuestionIndex];
          if (currentAnswer) { // Only proceed if an answer is selected
            if (currentQuestionIndex < quiz.questions.length - 1) {
              nextQuestion();
            } else {
              submitQuiz();
            }
          }
        }
        
        // Handle P key for previous question
        else if (e.key.toLowerCase() === 'p') {
          if (currentQuestionIndex > 0) {
            prevQuestion();
          }
        }
      };
      
      // Add keyboard event listener
      window.addEventListener('keydown', handleKeyDown);
      
      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [quiz, currentQuestionIndex, userAnswers, showResults, loading]);

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
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Press <span className="font-medium">R</span> to retry the quiz</p>
        </div>
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

      {/* Keyboard shortcuts guide */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Keyboard Shortcuts</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-blue-700 dark:text-blue-300">
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">A</span> Select option A</li>
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">B</span> Select option B</li>
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">C</span> Select option C</li>
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">D</span> Select option D</li>
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">N</span> Next question (after selecting)</li>
          <li><span className="inline-block w-6 h-6 mr-2 text-center leading-6 bg-blue-100 dark:bg-blue-800 rounded">P</span> Previous question</li>
        </ul>
      </div>

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
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
          <span className="ml-1 text-xs">(&nbsp;P&nbsp;)</span>
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
            {currentAnswer && <span className="ml-1 text-xs">(&nbsp;N&nbsp;)</span>}
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
            {currentAnswer && <span className="ml-1 text-xs">(&nbsp;N&nbsp;)</span>}
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