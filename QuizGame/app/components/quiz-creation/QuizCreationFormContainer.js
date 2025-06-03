'use client';

import { useState } from 'react';
import { QuizFormProvider, useQuizFormContext } from './QuizFormContext';
import BasicInfoStep from './steps/BasicInfoStep';
import QuestionsStep from './steps/QuestionsStep';
import ReviewStep from './steps/ReviewStep';

export default function QuizCreationFormContainer({ editQuizId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { name: 'Quiz Details', component: <BasicInfoStep /> },
    { name: 'Questions', component: <QuestionsStep /> },
    { name: 'Review & Submit', component: <ReviewStep /> }
  ];
  
  return (
    <QuizFormProvider editQuizId={editQuizId}>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <button 
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`text-sm font-medium ${
                  currentStep === index 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {step.name}
              </button>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Error Messages */}
        <QuizFormErrors />
        
        {/* Current Step */}
        <div className="mt-4">
          {steps[currentStep].component}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-2 ${
              currentStep === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            } text-gray-800 dark:text-gray-200 rounded-md transition-colors`}
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </QuizFormProvider>
  );
}

// Component to display error messages
function QuizFormErrors() {
  const { errorMessage, aiGenerationError } = useQuizContextRender();
  
  return (
    <>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      {aiGenerationError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {aiGenerationError}
        </div>
      )}
    </>
  );
}

// Hook to safely get context values
function useQuizContextRender() {
  // Try/catch to prevent errors during SSR
  try {
    const context = useQuizFormContext();
    return context;
  } catch (e) {
    return { errorMessage: '', aiGenerationError: '' };
  }
}
