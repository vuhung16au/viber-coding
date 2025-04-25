'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../firebase/auth';
import { db } from '../firebase/config';
import { ref, push, set, serverTimestamp, get } from 'firebase/database';
import { recordQuizCreated } from '../firebase/statistics';
import { getAllCategories } from '../firebase/database';
import { generateQuizWithAI } from '../services/geminiService';

export default function QuizCreationForm() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    coverImage: '/images/default-quiz.jpg', // Default placeholder image
    category: '',
    categoryId: '', 
    tags: '', 
    questions: [],
    isFeatured: false 
  });
  
  // Add new state variables for AI generation
  const [useAI, setUseAI] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState('');

  const [currentTag, setCurrentTag] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]); 
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // Use the getAllCategories function from the database.js
        const categoriesData = await getAllCategories();
        // Sort categories by display order
        const sortedCategories = categoriesData.sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form field changes for quiz details
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value
    });
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (currentTag.trim() !== '') {
      // Split by commas and filter out empty strings
      const newTags = currentTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      if (newTags.length > 0) {
        // If we already have tags, add to them with comma separation
        const existingTags = quizData.tags ? quizData.tags + ', ' : '';
        setQuizData({
          ...quizData,
          tags: existingTags + newTags.join(', ')
        });
        setCurrentTag('');
      }
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    const tagsArray = quizData.tags.split(', ').filter(tag => tag !== tagToRemove);
    setQuizData({
      ...quizData,
      tags: tagsArray.join(', ')
    });
  };

  // Handle tag input keypress (add on Enter)
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle changes to the current question being edited
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value
    });
  };

  // Handle changes to options in the current question
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  // Add the current question to the quiz
  const handleAddQuestion = () => {
    // Validate question
    if (currentQuestion.question.trim() === '') {
      setErrorMessage('Question text cannot be empty');
      return;
    }

    // Validate options (all must be filled)
    if (currentQuestion.options.some(option => option.trim() === '')) {
      setErrorMessage('All options must be filled in');
      return;
    }

    // Validate that a correct answer is selected
    if (!currentQuestion.correctAnswer) {
      setErrorMessage('Please select a correct answer');
      return;
    }

    // Add question with a unique ID
    const newQuestion = {
      ...currentQuestion,
      id: quizData.questions.length + 1
    };

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });

    // Reset the current question form
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });

    setErrorMessage('');
  };

  // Remove a question from the quiz
  const handleRemoveQuestion = (questionId) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(question => question.id !== questionId)
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image file is too large. Maximum size is 5MB.');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('File must be an image.');
        return;
      }
      
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  // Create a new quiz in Firebase Realtime Database
  const createQuiz = async (quizData, userId) => {
    // Create answers for each question
    const questionIds = [];
    
    for (const questionData of quizData.questions) {
      const answerIds = [];
      
      // Create each answer
      for (const option of questionData.options) {
        const answersRef = ref(db, 'answers');
        const newAnswerRef = push(answersRef);
        const answerId = newAnswerRef.key;
        
        await set(newAnswerRef, {
          answer: option,
          isCorrect: option === questionData.correctAnswer
        });
        
        answerIds.push(answerId);
      }
      
      // Create the question with answer references
      const questionsRef = ref(db, 'questions');
      const newQuestionRef = push(questionsRef);
      const questionId = newQuestionRef.key;
      
      await set(newQuestionRef, {
        question: questionData.question,
        answers: answerIds
      });
      
      questionIds.push(questionId);
    }
    
    // Ensure category has a default value if not provided and map to proper display format
    const categoryMappings = {
      'general': 'General Knowledge',
      'science': 'Science & Technology',
      'technology': 'Science & Technology',
      'history': 'History',
      'geography': 'Geography',
      'entertainment': 'Pop Culture',
      'sports': 'Sports',
      'other': 'Other'
    };
    
    const category = quizData.category && quizData.category.trim() !== '' 
      ? (categoryMappings[quizData.category] || quizData.category)
      : 'General Knowledge';
      
    // No need to convert tags to array anymore, use the string directly
    
    // Create the quiz with question references
    const quizzesRef = ref(db, 'quizzes');
    const newQuizRef = push(quizzesRef);
    const quizId = newQuizRef.key;
    
    await set(newQuizRef, {
      title: quizData.title,
      description: quizData.description,
      coverImage: quizData.coverImage,
      category: category, // For backward compatibility
      categoryId: quizData.categoryId || null, // Store the category ID
      tags: quizData.tags || '', // Save as string directly
      questions: questionIds,
      userId: userId,
      createdAt: serverTimestamp(),
      isFeatured: quizData.isFeatured || false // Add isFeatured property
    });
    
    // Record quiz creation in statistics
    if (userId && quizId) {
      await recordQuizCreated(userId, quizId);
    }
    
    return quizId;
  };

  // Handle AI quiz generation
  const handleGenerateWithAI = async () => {
    try {
      if (quizData.description.trim() === '') {
        setAiGenerationError('Please enter a quiz description before generating with AI');
        return;
      }

      setIsGeneratingWithAI(true);
      setAiGenerationError('');

      // Generate questions using the Gemini API
      const generatedQuestions = await generateQuizWithAI(quizData.description, 10);
      
      // Map the generated questions to our quiz format
      const formattedQuestions = generatedQuestions.map((q, index) => ({
        id: quizData.questions.length + index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));

      // Update quiz data with generated title if not already provided
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
      
      setQuizData(updatedQuizData);
      setAiGenerationError(''); // Clear any errors
    } catch (error) {
      console.error('Error generating quiz with AI:', error);
      setAiGenerationError(`Failed to generate quiz: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  // Upload quiz image to a public URL (this is a placeholder)
  // In a real app, you would use Firebase Storage for this
  const uploadQuizImage = async (file, userId) => {
    // This is a placeholder. In a real app, implement image upload to Firebase Storage
    // For now, we'll just use the default image
    console.log('Image upload placeholder called with file:', file);
    return '/images/default-quiz.jpg';
  };

  // Submit the quiz form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate quiz data
    if (quizData.title.trim() === '') {
      setErrorMessage('Quiz title is required');
      return;
    }
    
    if (quizData.description.trim() === '') {
      setErrorMessage('Quiz description is required');
      return;
    }
    
    if (quizData.questions.length === 0) {
      setErrorMessage('Add at least one question to your quiz');
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be logged in to create a quiz');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Process quiz data to save to Firebase
      let quizToSave = { ...quizData };
      
      // Image upload is disabled, always use the default image
      // unless an image preview was already set (from earlier uploads)
      if (!imagePreview) {
        quizToSave.coverImage = '/images/default-quiz.jpg';
      }
      
      // Save the quiz to Realtime Database
      const quizId = await createQuiz(quizToSave, currentUser.uid);
      
      // Redirect to the quizzes page without showing an alert
      router.push('/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
      setErrorMessage(`Failed to create quiz: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
      
      <form onSubmit={handleSubmit}>
        {/* Quiz Basic Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quiz Details</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={quizData.title}
              onChange={handleQuizChange}
              placeholder="Enter quiz title"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={quizData.description}
              onChange={handleQuizChange}
              placeholder="Enter quiz description"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
              required
            />
          </div>
          
          {/* AI Generation Section */}
          <div className="mb-6 p-4 border border-blue-200 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="mb-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={() => setUseAI(!useAI)}
                  className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                Use AI to create quizzes
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6 dark:text-gray-400">
                Let AI generate quiz questions based on your description. Enter a description above first.
              </p>
            </div>
            
            {useAI && (
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGeneratingWithAI || quizData.description.trim() === ''}
                className={`w-full py-2 mt-2 ${
                  isGeneratingWithAI || quizData.description.trim() === ''
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
                    Generating Quiz...
                  </>
                ) : (
                  'Create Quiz with AI'
                )}
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              name="categoryId"
              value={quizData.categoryId} 
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedCategory = categories.find(cat => cat.id === selectedId);
                setQuizData({
                  ...quizData,
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
              <input
                type="checkbox"
                name="isFeatured"
                checked={quizData.isFeatured}
                onChange={(e) => setQuizData({
                  ...quizData,
                  isFeatured: e.target.checked
                })}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              Featured Quiz (Administrators only)
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Featured quizzes are displayed prominently on the dashboard.</p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Questions</h2>
          
          {/* Existing Questions List */}
          {quizData.questions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Added Questions</h3>
              <div className="space-y-3">
                {quizData.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {index + 1}. {question.question}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <li 
                              key={optIndex} 
                              className={option === question.correctAnswer ? 
                                'text-green-600 dark:text-green-400' : 
                                'text-gray-600 dark:text-gray-400'
                              }
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {option === question.correctAnswer && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add New Question Form */}
          <div className="p-5 border rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Add New Question</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Question Text
              </label>
              <input
                type="text"
                name="question"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
                placeholder="Enter your question"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
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
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="ml-2">
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
            
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Question
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-colors`}
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}