'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/config';
import QuizCard from '@/app/components/QuizCard';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const lang = params.lang || 'en';

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          const quizzesList = Object.keys(quizzesData).map(key => ({
            id: key,
            ...quizzesData[key]
          }));
          setQuizzes(quizzesList);
        } else {
          setQuizzes([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId) => {
    // Use the Next.js router to navigate instead of window.location
    router.push(`/${lang}/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Quizzes</h1>
      
      {quizzes.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No quizzes found</h2>
          <p>There are currently no quizzes available. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              onStart={() => handleStartQuiz(quiz.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}