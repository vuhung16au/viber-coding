'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import QuizPage from '../page';

// This is a simple wrapper component that just renders the original QuizPage
// It allows us to keep the human-readable URL while reusing the existing quiz page logic
export default function QuizPageWithSlug({ params }) {
  // Use the params instead of directly accessing them
  // This ensures React hook consistency
  
  // The logic here is simple - just rendering the original QuizPage and passing the params
  // The original page only cares about the quiz ID, not the slug
  return <QuizPage params={params} />;
}