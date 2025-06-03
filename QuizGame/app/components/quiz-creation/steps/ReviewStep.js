'use client';

import { useQuizFormContext } from '../QuizFormContext';
import { createQuiz, updateQuiz } from '../../../services/firebase/quizService';
import { exportQuizToPDF } from '../../../../utils/pdfExport';
import MathJaxRenderer from '../../MathJaxRenderer';

export default function ReviewStep() {
  const {
    quizData,
    isSubmitting,
    setIsSubmitting,
    setErrorMessage,
    isEditMode,
    router,
    currentUser,
    validateQuiz,
    editQuizId
  } = useQuizFormContext();
  
  // Submit the quiz form
  const handleSubmit = async () => {
    if (!validateQuiz()) {
      return;
    }

    // Ensure user is logged in before submission
    if (!currentUser) {
      setErrorMessage('You must be logged in to save a quiz.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Process quiz data to save to Firebase
      let quizToSave = { ...quizData };
      
      let quizId;
      if (isEditMode) {
        // Update existing quiz
        quizId = await updateQuiz(editQuizId, quizToSave, currentUser.uid);
      } else {
        // Create new quiz
        quizId = await createQuiz(quizToSave, currentUser.uid);
      }
      
      // Redirect to the quizzes page without showing an alert
      router.push('/quizzes');
    } catch (error) {
      console.error('Error saving quiz:', error);
      setErrorMessage(`Failed to save quiz: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Export to PDF
  const handleExport = async () => {
    try {
      await exportQuizToPDF(quizData);
    } catch (error) {
      console.error('Error exporting quiz to PDF:', error);
      setErrorMessage('Failed to export quiz: ' + (error.message || 'Unknown error'));
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Review Quiz</h2>
      
      {/* Quiz Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            {quizData.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {quizData.description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
            <span className="text-gray-600 dark:text-gray-400">{quizData.category || 'Uncategorized'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Questions</span>
            <span className="text-gray-600 dark:text-gray-400">{quizData.questions.length}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</span>
            <span className="text-gray-600 dark:text-gray-400">
              {quizData.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer Timeout</span>
            <span className="text-gray-600 dark:text-gray-400">{quizData.defaultTimeout || 20} seconds</span>
          </div>
        </div>
        
        {quizData.tags && (
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</span>
            <div className="flex flex-wrap gap-2">
              {quizData.tags.split(', ').filter(Boolean).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Questions Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions ({quizData.questions.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {quizData.questions.map((question, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}.
                </span>
                <div className="flex-grow">
                  <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <MathJaxRenderer content={question.question} />
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                      question.points === 2 
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
                        : question.points === 0 
                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {question.points === 2 ? '2 pts' : question.points === 0 ? '0 pts' : '1 pt'}
                    </span>
                  </div>
                  
                  <ul className="mt-2 space-y-1 pl-4">
                    {question.options.map((option, optIndex) => (
                      <li 
                        key={optIndex} 
                        className={`flex items-center ${option === question.correctAnswer ? 
                          'text-green-600 dark:text-green-400' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className="w-6">{String.fromCharCode(65 + optIndex)}.</span>
                        <MathJaxRenderer content={option} />
                        {option === question.correctAnswer && (
                          <svg className="h-4 w-4 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex-grow py-3 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-colors`}
        >
          {isSubmitting 
            ? (isEditMode ? 'Updating Quiz...' : 'Creating Quiz...') 
            : (isEditMode ? 'Update Quiz' : 'Create Quiz')
          }
        </button>
        
        {isEditMode && (
          <button
            type="button"
            onClick={handleExport}
            className="sm:flex-grow-0 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to PDF
          </button>
        )}
      </div>
    </div>
  );
}
