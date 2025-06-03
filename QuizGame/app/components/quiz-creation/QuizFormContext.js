'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useQuizForm, useQuestionForm, useCategories, useAI } from '../../hooks/useQuizForm';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

// Create the context
const QuizFormContext = createContext(null);

// Hook to use the quiz form context
export const useQuizFormContext = () => {
  const context = useContext(QuizFormContext);
  if (context === null) {
    throw new Error('useQuizFormContext must be used within a QuizFormProvider');
  }
  return context;
};

// Provider component for the quiz form context
export const QuizFormProvider = ({ children, editQuizId }) => {
  const router = useRouter();
  const quizForm = useQuizForm(editQuizId);
  const questionForm = useQuestionForm();
  const { categories, loadingCategories } = useCategories();
  const aiState = useAI();
  
  // For form steps management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3; // Basic Info, Questions, Review & Submit
  
  // Form validation with React Hook Form
  const methods = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      defaultTimeout: 20,
      isPublic: false,
      isFeatured: false
    },
    mode: 'onChange'
  });
  
  // Update React Hook Form values when quizData changes
  useEffect(() => {
    methods.reset({
      title: quizForm.quizData.title,
      description: quizForm.quizData.description,
      category: quizForm.quizData.categoryId,
      defaultTimeout: quizForm.quizData.defaultTimeout,
      isPublic: quizForm.quizData.isPublic,
      isFeatured: quizForm.quizData.isFeatured
    });
  }, [quizForm.quizData, methods]);
  
  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };
  
  // For editing questions
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    questionForm.setCurrentQuestion({ 
      ...quizForm.quizData.questions[index], 
      options: [...quizForm.quizData.questions[index].options] 
    });
  };
  
  const handleSaveEditedQuestion = () => {
    if (!questionForm.validateQuestion(quizForm.setErrorMessage)) {
      return;
    }
    
    const updatedQuestions = quizForm.quizData.questions.map((q, idx) =>
      idx === editingQuestionIndex ? { ...questionForm.currentQuestion, id: q.id } : q
    );
    
    quizForm.setQuizData({ 
      ...quizForm.quizData, 
      questions: updatedQuestions 
    });
    
    setEditingQuestionIndex(null);
    questionForm.resetQuestion();
    quizForm.setErrorMessage('');
  };
  
  const handleCancelEdit = () => {
    setEditingQuestionIndex(null);
    questionForm.resetQuestion();
    quizForm.setErrorMessage('');
  };
  
  // For adding questions
  const handleAddQuestion = () => {
    if (!questionForm.validateQuestion(quizForm.setErrorMessage)) {
      return;
    }
    
    // Add question with a unique ID
    const newQuestion = {
      ...questionForm.currentQuestion,
      id: quizForm.quizData.questions.length + 1
    };
    
    quizForm.setQuizData({
      ...quizForm.quizData,
      questions: [...quizForm.quizData.questions, newQuestion]
    });
    
    // Reset the current question form
    questionForm.resetQuestion();
    quizForm.setErrorMessage('');
  };
  
  // Value object to provide through context
  const contextValue = {
    ...quizForm,
    ...questionForm,
    categories,
    loadingCategories,
    ...aiState,
    editQuizId,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    router,
    methods,
    editingQuestionIndex,
    handleEditQuestion,
    handleSaveEditedQuestion,
    handleCancelEdit,
    handleAddQuestion
  };
  
  return (
    <QuizFormContext.Provider value={contextValue}>
      {children}
    </QuizFormContext.Provider>
  );
};
