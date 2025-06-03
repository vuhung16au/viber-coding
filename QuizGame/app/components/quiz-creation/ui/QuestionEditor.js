'use client';

import { useQuizFormContext } from '../QuizFormContext';
import { generateQuestionWithAI } from '../../../services/ai/quizAIService';
import MathJaxRenderer from '../../MathJaxRenderer';

export default function QuestionEditor() {
  const {
    currentQuestion,
    setCurrentQuestion,
    handleQuestionChange,
    handleOptionChange,
    handleAddQuestion,
    handleSaveEditedQuestion,
    handleCancelEdit,
    aiGenerationError,
    setAiGenerationError,
    isGeneratingWithAI,
    setIsGeneratingWithAI,
    editingQuestionIndex
  } = useQuizFormContext();
  
  // Handle AI single question generation
  const handleGenerateQuestionWithAI = async () => {
    try {
      if (!currentQuestion.prompt || currentQuestion.prompt.trim() === '') {
        setAiGenerationError('Please enter a prompt before generating a question with AI');
        return;
      }

      setIsGeneratingWithAI(true);
      setAiGenerationError('');

      const result = await generateQuestionWithAI(currentQuestion.prompt);
      
      if (result.success) {
        // Update current question with the AI generated content
        setCurrentQuestion({
          ...currentQuestion,
          question: result.data.question,
          options: result.data.options,
          correctAnswer: result.data.correctAnswer
        });
      } else {
        setAiGenerationError(result.error);
      }
    } finally {
      setIsGeneratingWithAI(false);
    }
  };
  
  // If we're editing an existing question, show different UI
  if (editingQuestionIndex !== null) {
    return (
      <div className="p-5 border rounded-lg dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Edit Question</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Question Text</label>
          <textarea
            name="question"
            value={currentQuestion.question}
            onChange={handleQuestionChange}
            placeholder="Enter your question (Use $x^2$ for inline math or $$x^2$$ for block math)"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y min-h-[100px]"
            rows={4}
          />
          {currentQuestion.question && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
              <MathJaxRenderer content={currentQuestion.question} />
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Tip: Use $...$ for inline math like $x^2$ or $$...$$ for display math like $$\frac{1}{2}$$
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Options</label>
          {currentQuestion.options.map((option, optIdx) => (
            <div key={optIdx} className="flex items-center mb-2">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                {String.fromCharCode(65 + optIdx)}
              </div>
              <div className="flex-grow">
                <textarea
                  value={option}
                  onChange={e => handleOptionChange(optIdx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)} (Use $...$ for math formulas)`}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y min-h-[80px]"
                  rows={3}
                />
                {option && (
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                    <MathJaxRenderer content={option} />
                  </div>
                )}
              </div>
              <div className="ml-2 flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={option}
                  checked={currentQuestion.correctAnswer === option}
                  onChange={handleQuestionChange}
                  className="w-4 h-4 text-blue-600 dark:text-blue-500"
                  disabled={!option}
                />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">Correct</span>
              </div>
            </div>
          ))}
        </div>

        {/* Point Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Point Value
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="points"
                value={1}
                checked={currentQuestion.points === 1}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  points: parseInt(e.target.value)
                })}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Normal (1 point)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="points"
                value={2}
                checked={currentQuestion.points === 2}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  points: parseInt(e.target.value)
                })}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Double (2 points)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="points"
                value={0}
                checked={currentQuestion.points === 0}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  points: parseInt(e.target.value)
                })}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">No points (0)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose the point value for this question. Points are calculated after quiz completion.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={handleSaveEditedQuestion} 
            className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={handleCancelEdit} 
            className="flex-1 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  // Add new question form
  return (
    <div className="p-5 border rounded-lg dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Add New Question</h3>
      
      {/* Prompt field for per-question AI generation */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Prompt
        </label>
        <div className="flex">
          <textarea
            name="questionPrompt"
            value={currentQuestion.prompt || ''}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion,
              prompt: e.target.value
            })}
            placeholder="Enter a prompt to generate a question with AI"
            className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y min-h-[100px]"
            rows={4}
          />
          <button
            type="button"
            onClick={handleGenerateQuestionWithAI}
            disabled={isGeneratingWithAI || !(currentQuestion.prompt || '').trim()}
            className={`px-4 border border-l-0 rounded-r-md ${
              isGeneratingWithAI || !(currentQuestion.prompt || '').trim()
                ? 'bg-blue-300 cursor-not-allowed text-white border-blue-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700'
            } transition-colors flex items-center justify-center`}
          >
            {isGeneratingWithAI ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="whitespace-nowrap">Generating...</span>
              </>
            ) : (
              <span className="whitespace-nowrap">Generate question</span>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Enter a prompt to generate a single quiz question with AI.</p>
        {aiGenerationError && (
          <p className="text-xs text-red-500 mt-1">{aiGenerationError}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Question Text
        </label>
        <textarea
          name="question"
          value={currentQuestion.question}
          onChange={handleQuestionChange}
          placeholder="Enter your question (Use $x^2$ for inline math or $$x^2$$ for block math)"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y min-h-[100px]"
          rows={4}
        />
        {currentQuestion.question && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
            <MathJaxRenderer content={currentQuestion.question} />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Tip: Use $...$ for inline math like $x^2$ or $$...$$ for display math like $$\frac{1}{2}$$
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Options
        </label>
        {currentQuestion.options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-grow">
              <textarea
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)} (Use $...$ for math formulas)`}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y min-h-[80px]"
                rows={3}
              />
              {option && (
                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                  <MathJaxRenderer content={option} />
                </div>
              )}
            </div>
            <div className="ml-2 flex items-center">
              <input
                type="radio"
                name="correctAnswer"
                value={option}
                checked={currentQuestion.correctAnswer === option}
                onChange={handleQuestionChange}
                className="w-4 h-4 text-blue-600 dark:text-blue-500"
                disabled={!option}
              />
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">Correct</span>
            </div>
          </div>
        ))}
      </div>

      {/* Point Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Point Value
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="points"
              value={1}
              checked={currentQuestion.points === 1}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                points: parseInt(e.target.value)
              })}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Normal (1 point)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="points"
              value={2}
              checked={currentQuestion.points === 2}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                points: parseInt(e.target.value)
              })}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Double (2 points)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="points"
              value={0}
              checked={currentQuestion.points === 0}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                points: parseInt(e.target.value)
              })}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No points (0)</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Choose the point value for this question. Points are calculated after quiz completion.
        </p>
      </div>
      
      <button
        type="button"
        onClick={handleAddQuestion}
        className="w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Add Question
      </button>
    </div>
  );
}
