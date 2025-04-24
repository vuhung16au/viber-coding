'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../firebase/auth';
import { db } from '../firebase/config'; // Import the database reference
import { ref, get, remove } from 'firebase/database'; // Import Realtime Database methods
import QuizCard from '../components/QuizCard';

export default function UserQuizzes() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to get all quizzes from Firebase Realtime Database
  const getAllQuizzes = async () => {
    const quizzesRef = ref(db, 'quizzes');
    const snapshot = await get(quizzesRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  };

  // Function to delete a quiz
  const deleteQuiz = async (quizId) => {
    const quizRef = ref(db, `quizzes/${quizId}`);
    await remove(quizRef);
    return quizId;
  };

  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!currentUser && !loading) {
      router.push('/login');
      return;
    }

    // Fetch quizzes from Firebase Realtime Database
    const fetchQuizzes = async () => {
      try {
        const allQuizzes = await getAllQuizzes();
        // Convert object to array with IDs
        const quizArray = Object.entries(allQuizzes || {}).map(([id, data]) => ({
          id,
          ...data
        }));
        setQuizzes(quizArray);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [currentUser, loading, router]);

  // Function to handle quiz deletion
  const handleDeleteQuiz = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        // Update the UI by removing the deleted quiz
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Quizzes</h1>
        <button 
          onClick={() => router.push('/create-quiz')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No quizzes available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating your first quiz and share it with others!</p>
          <button 
            onClick={() => router.push('/create-quiz')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              showActions={currentUser && quiz.userId === currentUser.uid}
              onEdit={() => router.push(`/edit-quiz/${quiz.id}`)}
              onDelete={() => handleDeleteQuiz(quiz.id)}
              onStart={() => router.push(`/quiz/${quiz.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}