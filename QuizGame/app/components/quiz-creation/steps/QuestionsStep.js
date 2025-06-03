'use client';

import { useQuizFormContext } from '../QuizFormContext';
import QuestionDragDropList from '../ui/QuestionDragDropList';
import QuestionEditor from '../ui/QuestionEditor';
import { generateQuestionsWithAI } from '../../../services/ai/quizAIService';

export default function QuestionsStep() {
  const {
    quizData,
    updateQuizData,
    useAI,
    setUseAI,
    isGeneratingWithAI,
    setIsGeneratingWithAI,
    aiGenerationError,
    setAiGenerationError
  } = useQuizFormContext();

  // Handle AI quiz generation (generates multiple questions)
  const handleGenerateWithAI = async () => {
    try {
      if (quizData.prompt.trim() === '') {
        setAiGenerationError('Please enter a prompt before generating with AI');
        return;
      }

      setIsGeneratingWithAI(true);
      setAiGenerationError('');

      // Use our AI service to generate questions - passing any uploaded images
      const result = await generateQuestionsWithAI(
        quizData.prompt, 
        10, // Default number of questions
        quizData.promptImages // Pass any uploaded images if they exist
      );
      
      if (result.success) {
        // Map the generated questions to our quiz format
        const formattedQuestions = result.data.map((q, index) => ({
          id: quizData.questions.length + index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: 1
        }));

        // Update quiz data with the new questions from AI
        let updatedQuizData = { ...quizData };
        
        if (!quizData.title.trim()) {
          // Create a title based on the description
          const titleWords = quizData.description.split(' ');
          const title = titleWords.length <= 3
            ? `${quizData.description} Quiz`
            : `${titleWords.slice(0, 3).join(' ')}... Quiz`;
          
          updatedQuizData.title = title;
        }
        
        // Add the generated questions to the quiz
        updatedQuizData.questions = [
          ...quizData.questions,
          ...formattedQuestions
        ];
        
        updateQuizData(updatedQuizData);
      } else {
        setAiGenerationError(result.error);
      }
    } finally {
      setIsGeneratingWithAI(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Questions</h2>
      
      {/* AI Generation Section for whole quiz */}
      <div className="mb-6 p-4 border border-blue-200 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="mb-2">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useAI}
              onChange={() => setUseAI(!useAI)}
              className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            Use AI to create quiz questions
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6 dark:text-gray-400">
            Let AI generate quiz questions based on your description. Enter a prompt first.
          </p>
        </div>
        
        {useAI && (
          <button
            type="button"
            onClick={() => {
              // If there's no prompt but there's a description, use it
              if (!quizData.prompt.trim() && quizData.description.trim()) {
                updateQuizData({ prompt: quizData.description });
                setTimeout(handleGenerateWithAI, 0);
              } else {
                handleGenerateWithAI();
              }
            }}
            disabled={isGeneratingWithAI || (!quizData.prompt.trim() && !quizData.description.trim())}
            className={`w-full py-2 mt-2 ${
              isGeneratingWithAI || (!quizData.prompt.trim() && !quizData.description.trim())
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium rounded-md transition-colors flex items-center justify-center`}
          >
            {isGeneratingWithAI ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Questions...
              </>
            ) : (
              'Generate Questions with AI'
            )}
          </button>
        )}
      </div>
      
      {/* Existing Questions List */}
      <QuestionDragDropList />
      
      {/* Question Editor Component */}
      <QuestionEditor />
    </div>
  );
}
