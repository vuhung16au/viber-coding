'use client';

import { useParams } from 'next/navigation';
import QuizCreationForm from '../../../../components/QuizCreationForm';

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params?.id;
  // Optionally, you can use the slug for SEO, but only quizId is needed for editing
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Edit Quiz
      </h1>
      <QuizCreationForm editQuizId={quizId} />
    </div>
  );
}
