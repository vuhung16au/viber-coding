'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';
import { fetchQuizForEdit } from '../services/firebase/quizService';
import { getAllCategories } from '../firebase/database';

// Hook to manage quiz form state
export const useQuizForm = (editQuizId = null) => {
  const { currentUser } = useAuth();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    prompt: '',
    coverImage: '/images/default-quiz.jpg',
    category: '',
    categoryId: '', 
    tags: '', 
    questions: [],
    isFeatured: false,
    isPublic: false,
    defaultTimeout: 20,
    useAI: false,
    promptImages: [] // Array to store the images to be used for AI generation
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(!!editQuizId);
  const [isEditMode] = useState(!!editQuizId);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Fetch quiz data if in edit mode
  useEffect(() => {
    const loadQuiz = async () => {
      if (!editQuizId || !currentUser) return;
      
      setLoadingQuiz(true);
      const result = await fetchQuizForEdit(editQuizId, currentUser.uid);
      setLoadingQuiz(false);
      
      if (result.success) {
        setQuizData(result.data);
        
        // If the quiz has a custom image, set the preview
        if (result.data.coverImage && result.data.coverImage !== '/images/default-quiz.jpg') {
          setImagePreview(result.data.coverImage);
        }
      } else {
        setErrorMessage(result.error);
      }
    };
    
    if (editQuizId && currentUser) {
      loadQuiz();
    }
  }, [editQuizId, currentUser]);
  
  // Handle form field changes for quiz details
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value
    });
  };
  
  // Update quiz data (for batch updates)
  const updateQuizData = (newData) => {
    setQuizData(prevData => ({
      ...prevData,
      ...newData
    }));
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
  
  // Add questions to the quiz
  const addQuestions = (newQuestions) => {
    // Calculate next ID based on existing questions
    const nextId = quizData.questions.length > 0 
      ? Math.max(...quizData.questions.map(q => q.id)) + 1 
      : 1;
    
    // Format new questions with IDs
    const formattedQuestions = newQuestions.map((q, index) => ({
      ...q,
      id: nextId + index
    }));
    
    // Add to existing questions
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, ...formattedQuestions]
    });
  };
  
  // Update an existing question
  const updateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      ...updatedQuestion
    };
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };
  
  // Remove a question
  const removeQuestion = (questionId) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(question => question.id !== questionId)
    });
  };
  
  // Move questions (reorder)
  const moveQuestion = (fromIndex, toIndex) => {
    const questions = [...quizData.questions];
    const [removed] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, removed);
    
    setQuizData({
      ...quizData,
      questions
    });
  };
  
  // Handle prompt image uploads
  const handlePromptImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      const imageFiles = Array.from(files);
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB max per file
      const maxFiles = 3; // Maximum 3 images
      
      // Validate file type and size
      const validImages = imageFiles.filter(file => {
        if (!validImageTypes.includes(file.type)) {
          setErrorMessage(`File "${file.name}" is not a supported image type. Please use JPEG, PNG, GIF, or WEBP.`);
          return false;
        }
        
        if (file.size > maxFileSize) {
          setErrorMessage(`File "${file.name}" exceeds the 5MB size limit.`);
          return false;
        }
        
        return true;
      });
      
      // Check number of files limit
      if (validImages.length > maxFiles) {
        setErrorMessage(`You can upload a maximum of ${maxFiles} images.`);
        return;
      }
      
      // Process each valid image file
      const imageDataPromises = validImages.map(async file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const base64Data = e.target.result.split(',')[1]; // Get only the base64 data part without the prefix
            resolve({
              name: file.name,
              data: base64Data,
              mimeType: file.type,
              size: file.size,
              preview: URL.createObjectURL(file)
            });
          };
          
          reader.readAsDataURL(file);
        });
      });
      
      // Wait for all image processing to complete
      const newImages = await Promise.all(imageDataPromises);
      
      // Update quiz data with the new images
      setQuizData(prevData => ({
        ...prevData,
        promptImages: [...newImages]
      }));
      
      setErrorMessage('');
    } catch (error) {
      console.error("Error processing image uploads:", error);
      setErrorMessage('Error processing image uploads: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };
  
  // Remove a prompt image
  const removePromptImage = (indexToRemove) => {
    setQuizData(prevData => ({
      ...prevData,
      promptImages: prevData.promptImages.filter((_, index) => index !== indexToRemove)
    }));
  };
  
  // Validate the quiz data
  const validateQuiz = () => {
    if (quizData.title.trim() === '') {
      setErrorMessage('Quiz title is required');
      return false;
    }
    
    if (quizData.description.trim() === '') {
      setErrorMessage('Quiz description is required');
      return false;
    }
    
    if (quizData.questions.length === 0) {
      setErrorMessage('Add at least one question to your quiz');
      return false;
    }
    
    if (!currentUser) {
      setErrorMessage('You must be logged in to create a quiz');
      return false;
    }
    
    return true;
  };

  return {
    quizData,
    setQuizData,
    updateQuizData,
    currentTag,
    setCurrentTag,
    errorMessage,
    uploadingImages,
    setErrorMessage,
    isSubmitting,
    setIsSubmitting,
    imagePreview,
    setImagePreview,
    selectedFile,
    setSelectedFile,
    loadingQuiz,
    isEditMode,
    handleQuizChange,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyPress,
    addQuestions,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    validateQuiz,
    handlePromptImageUpload,
    removePromptImage,
    currentUser
  };
};

// Hook to manage question form state
export const useQuestionForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    prompt: '',
    points: 1
  });
  
  // Reset the question form
  const resetQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      prompt: '',
      points: 1
    });
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
    
    // If the changed option was the correct answer, update the correct answer too
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (newCorrectAnswer === currentQuestion.options[index]) {
      newCorrectAnswer = value;
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };
  
  // Validate the current question
  const validateQuestion = (setError) => {
    if (currentQuestion.question.trim() === '') {
      setError('Question text cannot be empty');
      return false;
    }

    if (currentQuestion.options.some(option => option.trim() === '')) {
      setError('All options must be filled in');
      return false;
    }

    if (!currentQuestion.correctAnswer) {
      setError('Please select a correct answer');
      return false;
    }
    
    return true;
  };
  
  return {
    currentQuestion,
    setCurrentQuestion,
    resetQuestion,
    handleQuestionChange,
    handleOptionChange,
    validateQuestion
  };
};

// Hook to fetch categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
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
  
  return { categories, loadingCategories };
};

// Hook for AI-related state
export const useAI = () => {
  // State for AI generation
  const [useAI, setUseAI] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState('');
  const [useAITitleDesc, setUseAITitleDesc] = useState(false);
  const [isGeneratingTitleDesc, setIsGeneratingTitleDesc] = useState(false);
  
  return {
    useAI,
    setUseAI,
    isGeneratingWithAI,
    setIsGeneratingWithAI,
    aiGenerationError,
    setAiGenerationError,
    useAITitleDesc,
    setUseAITitleDesc,
    isGeneratingTitleDesc,
    setIsGeneratingTitleDesc
  };
};
