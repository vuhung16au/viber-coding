'use client';

import { useSearchParams } from 'next/navigation';
import QuizCreationFormContainer from './quiz-creation/QuizCreationFormContainer';

export default function QuizCreationForm() {
  // Get the quiz ID from the URL if we're in edit mode
  const searchParams = useSearchParams();
  const editQuizId = searchParams.get('id');
  
  // Use our container component which manages all the form steps
  return (
    <QuizCreationFormContainer editQuizId={editQuizId} />
  );
}