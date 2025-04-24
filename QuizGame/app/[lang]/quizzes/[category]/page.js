'use client';

import { useState, useEffect } from 'react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/app/firebase/config';
import QuizCard from '@/app/components/QuizCard';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function CategoryQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const { lang, category } = params || {}; // Add a fallback to avoid destructuring undefined

  useEffect(() => {
    // Make sure category exists before fetching
    if (!category) {
      setLoading(false);
      setError('Category parameter is missing');
      return;
    }

    const fetchQuizzesByCategory = async () => {
      try {
        // Get all quizzes first
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          // Filter quizzes that include the category
          const quizzesList = Object.keys(quizzesData)
            .map(key => ({
              id: key,
              ...quizzesData[key]
            }))
            .filter(quiz => {
              // Match if tags contains the category (case insensitive)
              if (!quiz.tags) return false;
              
              const decodedCategory = decodeURIComponent(category).toLowerCase();
              
              // Handle if tags is a string
              if (typeof quiz.tags === 'string') {
                return quiz.tags.toLowerCase().includes(decodedCategory);
              }
              
              // Handle if tags is an array
              if (Array.isArray(quiz.tags)) {
                return quiz.tags.some(tag => 
                  tag.toLowerCase().includes(decodedCategory)
                );
              }
              
              // Handle if tags is an object
              if (typeof quiz.tags === 'object') {
                return Object.values(quiz.tags).some(tag => 
                  String(tag).toLowerCase().includes(decodedCategory)
                );
              }
              
              return false;
            });
          
          setQuizzes(quizzesList);
        } else {
          setQuizzes([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes by category:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzesByCategory();
  }, [category]); // Ensure category is in the dependency array

  const handleStartQuiz = (quizId) => {
    if (lang && quizId) {
      router.push(`/${lang}/quiz/${quizId}`);
    }
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

  // Make sure category exists before trying to manipulate it
  const categoryName = category 
    ? decodeURIComponent(category).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Unknown Category';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{categoryName} Quizzes</h1>
      
      {quizzes.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No quizzes found in this category</h2>
          <p>There are currently no quizzes available for {categoryName.toLowerCase()}. Check back later!</p>
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