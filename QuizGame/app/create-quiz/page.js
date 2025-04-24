'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the quiz creation form with no SSR
const QuizCreationWrapper = dynamic(
  () => import('../components/QuizCreationForm').then(mod => ({ 
    default: () => mod.default 
  })),
  { ssr: false }
);

export default function CreateQuizPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Create a New Quiz</h1>
      
      {isClient ? (
        <QuizCreationWrapper />
      ) : (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}