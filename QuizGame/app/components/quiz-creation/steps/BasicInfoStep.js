'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuizFormContext } from '../QuizFormContext';
import { generateTitleDescWithAI } from '../../../services/ai/quizAIService';
import { useForm, Controller } from 'react-hook-form';

export default function BasicInfoStep() {
  const {
    quizData,
    handleQuizChange,
    updateQuizData,
    currentTag,
    setCurrentTag,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyPress,
    imagePreview,
    categories,
    loadingCategories,
    currentUser,
    setErrorMessage,
    setAiGenerationError,
    useAITitleDesc,
    setUseAITitleDesc,
    isGeneratingTitleDesc,
    setIsGeneratingTitleDesc
  } = useQuizFormContext();
  
  const { register, control, formState: { errors } } = useForm({
    defaultValues: {
      title: quizData.title,
      description: quizData.description,
      categoryId: quizData.categoryId,
      isPublic: quizData.isPublic,
      isFeatured: quizData.isFeatured,
      defaultTimeout: quizData.defaultTimeout
    }
  });
  
  // Handle AI Title/Description generation
  const handleGenerateTitleDescWithAI = async () => {
    if (!quizData.prompt.trim()) {
      setAiGenerationError('Please enter a prompt to generate title and description.');
      return;
    }
    
    setIsGeneratingTitleDesc(true);
    setAiGenerationError('');
    
    const result = await generateTitleDescWithAI(quizData.prompt);
    
    if (result.success) {
      updateQuizData({
        title: result.data.title,
        description: result.data.description
      });
    } else {
      setAiGenerationError(result.error);
    }
    
    setIsGeneratingTitleDesc(false);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Quiz Details
      </h2>
      
      {/* Prompt field for quiz-level AI generation */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Quiz Prompt
        </label>
        <textarea
          name="prompt"
          value={quizData.prompt}
          onChange={handleQuizChange}
          placeholder="Enter a prompt for generating an entire quiz with AI"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="2"
        />
        <p className="text-xs text-gray-500 mt-1">
          This prompt will be used to generate quiz title/description or questions with AI. Only visible to you.
        </p>
      </div>
      
      {/* Math Formula Guide */}
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Math Formula Support</h4>
        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
          This quiz supports mathematical formulas using LaTeX syntax. In your questions and answers:
        </p>
        <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-400 space-y-1 mb-2">
          <li>Use single dollar signs for inline math: <code>$x^2 + y^2 = z^2$</code></li>
          <li>Use double dollar signs for display math: <code>{"$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$"}</code></li>
        </ul>
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          When creating questions, you&apos;ll see a live preview of your math formulas.
        </p>
      </div>

      {/* "Use AI to create entire quiz" checkbox */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="use-ai"
            checked={quizData.useAI}
            onChange={e => {
              updateQuizData({ useAI: e.target.checked });
              if (!e.target.checked) setAiGenerationError('');
            }}
            className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="use-ai" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use AI to create entire quiz
          </label>
          <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            Let AI generate quiz questions based on your description. Enter a description above first.
          </div>
        </div>

        {/* AI Title/Desc Checkbox */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="use-ai-title-desc"
            checked={useAITitleDesc}
            onChange={e => {
              setUseAITitleDesc(e.target.checked);
              if (!e.target.checked) setAiGenerationError('');
            }}
            className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="use-ai-title-desc" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use AI to generate Title and Description
          </label>
          {useAITitleDesc && (
            <button
              type="button"
              onClick={handleGenerateTitleDescWithAI}
              disabled={isGeneratingTitleDesc || !quizData.prompt.trim()}
              className={`ml-4 px-3 py-1 rounded bg-blue-600 text-white text-sm ${isGeneratingTitleDesc || !quizData.prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isGeneratingTitleDesc ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          {...register('title', { required: 'Title is required' })}
          type="text"
          name="title"
          value={quizData.title}
          onChange={handleQuizChange}
          placeholder="Enter quiz title"
          className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.title ? 'border-red-500' : ''
          }`}
          disabled={useAITitleDesc}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          name="description"
          value={quizData.description}
          onChange={handleQuizChange}
          placeholder="Enter quiz description"
          className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.description ? 'border-red-500' : ''
          }`}
          rows="3"
          disabled={useAITitleDesc}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          {...register('categoryId')}
          name="categoryId"
          value={quizData.categoryId} 
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedCategory = categories.find(cat => cat.id === selectedId);
            updateQuizData({
              category: selectedCategory ? selectedCategory.name : '',
              categoryId: selectedId
            });
          }}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={loadingCategories}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id} disabled={!category.isActive}>
              {category.name} {!category.isActive && '(Inactive)'}
            </option>
          ))}
        </select>
        {loadingCategories && (
          <div className="text-sm text-gray-500 mt-1 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            Loading categories...
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Cover Image (Optional)
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-md border dark:border-gray-600">
            {imagePreview ? (
              <Image src={imagePreview} alt="Quiz cover" fill className="object-cover" priority />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Image upload temporarily disabled.
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Image upload functionality will be implemented later.</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Tags
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {quizData.tags && quizData.tags.split(', ').filter(Boolean).map((tag, index) => (
            <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
              <span className="text-sm">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add a tag"
            className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={quizData.isPublic}
                onChange={(e) => {
                  field.onChange(e);
                  updateQuizData({ isPublic: e.target.checked });
                }}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
            )}
          />
          Public Quiz
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">Public quizzes are visible to all users. Private quizzes are only visible to you.</p>
      </div>

      <div className="mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={quizData.isFeatured}
                onChange={(e) => {
                  field.onChange(e);
                  updateQuizData({ isFeatured: e.target.checked });
                }}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
            )}
          />
          Featured Quiz (Administrators only)
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">Featured quizzes are displayed prominently on the dashboard.</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Answer Timeout (seconds)
        </label>
        <div className="relative">
          <Controller
            name="defaultTimeout"
            control={control}
            rules={{ min: 5, max: 12000 }}
            render={({ field }) => (
              <input
                type="number"
                value={quizData.defaultTimeout}
                onChange={(e) => {
                  field.onChange(e);
                  updateQuizData({ defaultTimeout: parseInt(e.target.value) || 20 });
                }}
                min="5"
                max="12000"
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.defaultTimeout ? 'border-red-500' : ''
                }`}
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Time allowed for answering each question. Default is 20 seconds.
          </p>
        </div>
        {errors.defaultTimeout && (
          <p className="mt-1 text-sm text-red-600">
            Timeout must be between 5 and 12000 seconds.
          </p>
        )}
      </div>
    </div>
  );
}
