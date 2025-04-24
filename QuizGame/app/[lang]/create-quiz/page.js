'use client';

import React from 'react';
import QuizCreationForm from '../../components/QuizCreationForm';
import { useTranslation } from '../../translations';

export default function CreateQuizPage({ params }) {
  // Use React.use to unwrap the params object safely
  const unwrappedParams = React.use(params);
  const { t } = useTranslation(unwrappedParams?.lang || 'en');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {t('createQuiz.title', 'Create a New Quiz')}
      </h1>
      <QuizCreationForm />
    </div>
  );
}