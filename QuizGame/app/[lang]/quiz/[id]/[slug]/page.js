'use client';

import { useParams } from 'next/navigation';
import QuizPage from '../page';

// This is a simple wrapper component that just renders the original QuizPage
// It allows us to keep the human-readable URL while reusing the existing quiz page logic
export default function QuizPageWithSlug() {
  // Use the useParams hook instead of destructuring it from props
  const params = useParams();
  
  // Pass the params to the original QuizPage component
  return <QuizPage params={params} />;
}