'use client';

import { useParams } from 'next/navigation';
import QuizPage from '../page';

// This is a simple wrapper component that just renders the original QuizPage
// It allows us to keep the human-readable URL while reusing the existing quiz page logic
export default function QuizPageWithSlug() {
  // The QuizPage component will get its own params now
  return <QuizPage />;
}