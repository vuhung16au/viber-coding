'use client';

import React, { Suspense } from 'react';
import QuizCreationForm from '../../components/QuizCreationForm';
import { useTranslation } from '../../translations';
import { useParams, useSearchParams } from 'next/navigation';

function CreateQuizContent({ title }) {
  const searchParams = useSearchParams();
  const editQuizId = searchParams.get('edit');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {title}
      </h1>
      <QuizCreationForm editQuizId={editQuizId} />
    </div>
  );
}

export default function CreateQuizPage() {
  const params = useParams();
  const lang = params?.lang || 'en';
  const { t } = useTranslation(lang);

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8" />}>
      <CreateQuizContent
        title={t('createQuiz.title', 'Create a New Quiz')}
      />
    </Suspense>
  );
}
