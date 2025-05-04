'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../firebase/auth';
import { db } from '../firebase/config';
import { ref, push, set, serverTimestamp, get, update } from 'firebase/database';
import { recordQuizCreated } from '../firebase/statistics';
import { getAllCategories } from '../firebase/database';
import { generateQuiz } from '../actions/quizActions';
import MathJaxRenderer from './MathJaxRenderer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable question item component
function SortableQuestionItem({ question, index, onEdit, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <div 
              className="mr-2 text-gray-400 cursor-move" 
              {...attributes} 
              {...listeners}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {index + 1}. <MathJaxRenderer content={question.question} />
            </p>
          </div>
          <ul className="mt-2 space-y-1 ml-7">
            {question.options.map((option, optIndex) => (
              <li 
                key={optIndex} 
                className={option === question.correctAnswer ? 
                  'text-green-600 dark:text-green-400' : 
                  'text-gray-600 dark:text-gray-400'
                }
              >
                {String.fromCharCode(65 + optIndex)}. <MathJaxRenderer content={option} />
                {option === question.correctAnswer && ' ✓'}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Edit question"
            title="Edit question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(question.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete question"
            title="Delete question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className={`${isFirst ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
            aria-label="Move question up"
            title="Move question up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className={`${isLast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
            aria-label="Move question down"
            title="Move question down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizCreationForm({ editQuizId: propEditQuizId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editQuizId = propEditQuizId || (searchParams ? searchParams.get('edit') : null);
  const isEditMode = !!editQuizId;
  const { currentUser } = useAuth();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    prompt: '', // Add prompt field
    coverImage: '/images/default-quiz.jpg', // Default placeholder image
    category: '',
    categoryId: '', 
    tags: '', 
    questions: [],
    isFeatured: false,
    isPublic: false, // Default to private for backward compatibility
    defaultTimeout: 20 // Default timeout in seconds
  });
  
  // Add new state variables for AI generation
  const [useAI, setUseAI] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState('');
  // New: State for AI title/desc generation
  const [useAITitleDesc, setUseAITitleDesc] = useState(false);
  const [isGeneratingTitleDesc, setIsGeneratingTitleDesc] = useState(false);

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
  const [loadingQuiz, setLoadingQuiz] = useState(isEditMode);

  // Fetch quiz data if in edit mode
  useEffect(() => {
    const fetchQuizForEdit = async () => {
      if (!editQuizId) return;

      try {
        setLoadingQuiz(true);
        const quizRef = ref(db, `quizzes/${editQuizId}`);
        const snapshot = await get(quizRef);

        if (snapshot.exists()) {
          const quizToEdit = snapshot.val();
          
          // Check if user has permission to edit
          if (quizToEdit.userId !== currentUser?.uid) {
            setErrorMessage("You don't have permission to edit this quiz");
            return;
          }

          // Create a copy of the original quiz data
          const editData = {
            title: quizToEdit.title || '',
            description: quizToEdit.description || '',
            prompt: quizToEdit.prompt || '', // Load prompt if present
            coverImage: quizToEdit.coverImage || '/images/default-quiz.jpg',
            category: quizToEdit.category || '',
            categoryId: quizToEdit.categoryId || '',
            tags: quizToEdit.tags || '',
            isFeatured: quizToEdit.isFeatured || false,
            isPublic: quizToEdit.isPublic || false,
            defaultTimeout: quizToEdit.defaultTimeout || 20,
            questions: []
          };

          // Fetch questions
          if (Array.isArray(quizToEdit.questions)) {
            for (const questionId of quizToEdit.questions) {
              const questionRef = ref(db, `questions/${questionId}`);
              const questionSnapshot = await get(questionRef);
              
              if (questionSnapshot.exists()) {
                const questionData = questionSnapshot.val();
                let options = [];
                let correctAnswer = '';

                // Fetch answers for this question
                if (Array.isArray(questionData.answers)) {
                  for (const answerId of questionData.answers) {
                    const answerRef = ref(db, `answers/${answerId}`);
                    const answerSnapshot = await get(answerRef);
                    
                    if (answerSnapshot.exists()) {
                      const answerData = answerSnapshot.val();
                      options.push(answerData.answer);
                      if (answerData.isCorrect) {
                        correctAnswer = answerData.answer;
                      }
                    }
                  }
                }

                // Add the question to our questions array
                if (options.length > 0) {
                  editData.questions.push({
                    id: editData.questions.length + 1,
                    question: questionData.question,
                    options,
                    correctAnswer
                  });
                }
              }
            }
          }

          // Set the form data
          setQuizData(editData);
          
          // If the quiz has a custom image, set the preview
          if (quizToEdit.coverImage && quizToEdit.coverImage !== '/images/default-quiz.jpg') {
            setImagePreview(quizToEdit.coverImage);
          }
        } else {
          setErrorMessage("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz for edit:", error);
        setErrorMessage("Failed to load quiz for editing");
      } finally {
        setLoadingQuiz(false);
      }
    };

    if (isEditMode && currentUser) {
      fetchQuizForEdit();
    }
  }, [editQuizId, currentUser]);

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
    
    // Ensure category has a default value if not provided
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
      prompt: quizData.prompt || '', // Save prompt
      coverImage: quizData.coverImage,
      category: category, // For backward compatibility
      categoryId: quizData.categoryId || null, // Store the category ID
      tags: quizData.tags || '', // Save as string directly
      questions: questionIds,
      userId: userId,
      createdAt: serverTimestamp(),
      isFeatured: quizData.isFeatured || false, // Add isFeatured property
      isPublic: quizData.isPublic || false, // Add isPublic property
      defaultTimeout: quizData.defaultTimeout || 20 // Add default timeout property
    });
    
    return quizId;
  };

  // Update an existing quiz in Firebase Realtime Database
  const updateQuiz = async (quizId, quizData, userId) => {
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
    
    // Ensure category has a default value if not provided
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
      
    // Update the quiz with new question references
    const quizRef = ref(db, `quizzes/${quizId}`);
    
    await update(quizRef, {
      title: quizData.title,
      description: quizData.description,
      prompt: quizData.prompt || '', // Save prompt
      coverImage: quizData.coverImage,
      category: category,
      categoryId: quizData.categoryId || null,
      tags: quizData.tags || '',
      questions: questionIds,
      // Don't update userId - keep the original creator
      updatedAt: serverTimestamp(),
      isFeatured: quizData.isFeatured || false,
      isPublic: quizData.isPublic || false, // Add isPublic property
      defaultTimeout: quizData.defaultTimeout || 20 // Add default timeout property
    });
    
    return quizId;
  };

  // Handle AI quiz generation
  const handleGenerateWithAI = async () => {
    try {
      if (quizData.prompt.trim() === '') {
        setAiGenerationError('Please enter a prompt before generating with AI');
        return;
      }

      setIsGeneratingWithAI(true);
      setAiGenerationError('');

      // Escape backslashes in the prompt for JSON safety (AI generation only)
      const safePrompt = quizData.prompt.replace(/\\/g, '\\\\');

      // Use the server action to generate questions
      const result = await generateQuiz(safePrompt, 10);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Map the generated questions to our quiz format
      const formattedQuestions = result.data.map((q, index) => ({
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
      
      // Display a more user-friendly error message
      if (error.message && error.message.includes('Missing API key')) {
        setAiGenerationError(
          'Missing API key. Please configure your Gemini API key in the environment variables (GEMINI_API_KEY).'
        );
      } else if (error.message && error.message.toLowerCase().includes('api key not valid')) {
        setAiGenerationError(
          'The Gemini API key is invalid. Please check your API key in the environment variables (GEMINI_API_KEY).'
        );
      } else if (error.message && error.message.includes('quota')) {
        setAiGenerationError(
          'AI generation quota reached. You can still create a quiz manually, or try again later when your quota resets.'
        );
      } else if (error.message && error.message.includes('429')) {
        setAiGenerationError(
          'AI service is currently busy. Please try again in a few minutes or create your quiz manually.'
        );
      } else {
        setAiGenerationError(`${error.message || 'An unexpected error occurred during quiz generation'}`);
      }
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  // New: AI generate title/desc from prompt
  const handleGenerateTitleDescWithAI = async () => {
    if (!quizData.prompt.trim()) {
      setAiGenerationError('Please enter a prompt to generate title and description.');
      return;
    }
    setIsGeneratingTitleDesc(true);
    setAiGenerationError('');
    try {
      // Use the same generateQuiz action, but only get the title/desc from the result
      const safePrompt = quizData.prompt.replace(/\\/g, '\\\\');
      // Request only 1 question, but expect title/desc in result
      const result = await generateQuiz(safePrompt, 1, { onlyTitleDesc: true });
      if (!result.success) throw new Error(result.error);
      // Assume result.data.title and result.data.description are returned
      setQuizData(qd => ({
        ...qd,
        title: result.data.title || '',
        description: result.data.description || ''
      }));
    } catch (error) {
      setAiGenerationError(error.message || 'Failed to generate title/description');
    } finally {
      setIsGeneratingTitleDesc(false);
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
      
      let quizId;
      if (isEditMode) {
        // Update existing quiz
        quizId = await updateQuiz(editQuizId, quizToSave, currentUser.uid);
      } else {
        // Create new quiz
        quizId = await createQuiz(quizToSave, currentUser.uid);
        
        // Record quiz creation in statistics (only for new quizzes)
        if (currentUser.uid && quizId) {
          await recordQuizCreated(currentUser.uid, quizId);
        }
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

  // Handle moving a question up (decreasing its index)
  const handleMoveQuestionUp = (index) => {
    if (index <= 0) return; // Already at the top
    
    const reorderedQuestions = Array.from(quizData.questions);
    const [removed] = reorderedQuestions.splice(index, 1);
    reorderedQuestions.splice(index - 1, 0, removed);
    
    setQuizData({
      ...quizData,
      questions: reorderedQuestions
    });
  };

  // Handle moving a question down (increasing its index)
  const handleMoveQuestionDown = (index) => {
    if (index >= quizData.questions.length - 1) return; // Already at the bottom
    
    const reorderedQuestions = Array.from(quizData.questions);
    const [removed] = reorderedQuestions.splice(index, 1);
    reorderedQuestions.splice(index + 1, 0, removed);
    
    setQuizData({
      ...quizData,
      questions: reorderedQuestions
    });
  };

  // Handle drag end event from dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeIndex = quizData.questions.findIndex(
        (question) => question.id.toString() === active.id
      );
      const overIndex = quizData.questions.findIndex(
        (question) => question.id.toString() === over.id
      );
      
      setQuizData({
        ...quizData,
        questions: arrayMove(quizData.questions, activeIndex, overIndex)
      });
    }
  };
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loadingQuiz) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Loading quiz data...</span>
      </div>
    );
  }

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
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Quiz' : 'Quiz Details'}
          </h2>
          {/* Prompt field, only visible to owner (logged-in user) */}
          {currentUser && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Prompt
              </label>
              <textarea
                name="prompt"
                value={quizData.prompt}
                onChange={handleQuizChange}
                placeholder="Enter a prompt for AI quiz generation"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="2"
              />
              <p className="text-xs text-gray-500 mt-1">This prompt will be used to generate quiz questions with AI. Only visible to you.</p>
            </div>
          )}

          {/* New: AI Title/Desc Checkbox */}
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
              disabled={useAITitleDesc}
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
              disabled={useAITitleDesc}
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
                name="isPublic"
                checked={quizData.isPublic}
                onChange={(e) => setQuizData({
                  ...quizData,
                  isPublic: e.target.checked
                })}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              Public Quiz
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Public quizzes are visible to all users. Private quizzes are only visible to you.</p>
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Answer Timeout (seconds)
            </label>
            <div className="relative">
              <input
                type="number"
                name="defaultTimeout"
                value={quizData.defaultTimeout}
                onChange={handleQuizChange}
                min="5"
                max="120"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Time allowed for answering each question. Default is 20 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Questions</h2>
          
          {/* Existing Questions List */}
          {quizData.questions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                Added Questions
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  (Drag to reorder)
                </span>
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={quizData.questions.map(question => question.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {quizData.questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id.toString()}
                      question={question}
                      index={index}
                      onEdit={(editedQuestion) => {
                        setCurrentQuestion({
                          ...editedQuestion,
                          options: [...editedQuestion.options]
                        });
                        handleRemoveQuestion(editedQuestion.id);
                      }}
                      onRemove={handleRemoveQuestion}
                      onMoveUp={handleMoveQuestionUp}
                      onMoveDown={handleMoveQuestionDown}
                      isFirst={index === 0}
                      isLast={index === quizData.questions.length - 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
            {isSubmitting 
              ? (isEditMode ? 'Updating Quiz...' : 'Creating Quiz...') 
              : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </form>
    </div>
  );
}