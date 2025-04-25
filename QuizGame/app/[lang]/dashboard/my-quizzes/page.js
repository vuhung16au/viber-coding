'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../firebase/auth';
import { db } from '../../../firebase/config';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import QuizCard from '../../../components/QuizCard';
import { useLanguage } from '../../../context/LanguageContext';
import { deleteQuiz } from '../../../firebase/database';

export default function MyQuizzes() {
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      router.push(`/${locale}/login`);
    }
  }, [currentUser, router, locale]);

  // Fetch user's quizzes
  useEffect(() => {
    const fetchMyQuizzes = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Reference to quizzes in the database
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          const quizzesArray = Object.keys(quizzesData)
            .map(key => ({
              id: key,
              ...quizzesData[key]
            }))
            .filter(quiz => quiz.userId === currentUser.uid); // Filter quizzes by current user
          
          // Sort by creation date (newest first)
          const sortedQuizzes = [...quizzesArray].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          
          setMyQuizzes(sortedQuizzes);
        } else {
          setMyQuizzes([]);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load your quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyQuizzes();
  }, [currentUser]);

  // Handle editing a quiz
  const handleEditQuiz = (quizId) => {
    router.push(`/${locale}/create-quiz?edit=${quizId}`);
  };

  // Handle deleting a quiz
  const handleDeleteQuiz = async (quizId) => {
    if (confirmDelete !== quizId) {
      // First click - show confirmation
      setConfirmDelete(quizId);
      return;
    }

    // Second click - actually delete
    setDeleteLoading(true);
    try {
      const success = await deleteQuiz(quizId);
      if (success) {
        // Remove the quiz from the local state
        setMyQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
      } else {
        setError('Failed to delete quiz. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  if (!currentUser) {
    return null; // Don't render anything while checking auth status
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('navigation.myQuizzes')}
          </h1>
          <Link
            href={`/${locale}/create-quiz`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a 1 1 0 110 2h-5v5a 1 1 0 11-2 0v-5H4a 1 1 0 110-2h5V4a 1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('common.createQuiz')}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : myQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myQuizzes.map(quiz => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz}
                showActions={true}
                onEdit={() => handleEditQuiz(quiz.id)}
                onDelete={() => handleDeleteQuiz(quiz.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {t('dashboard.noQuizzesCreated')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('dashboard.noQuizzesCreatedDesc')}
            </p>
            <Link
              href={`/${locale}/create-quiz`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a 1 1 0 110 2h-5v5a 1 1 0 11-2 0v-5H4a 1 1 0 110-2h5V4a 1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('common.createQuiz')}
            </Link>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('common.confirmDelete')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('common.confirmDeleteQuizMessage')}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleDeleteQuiz(confirmDelete)}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.deleting')}
                    </span>
                  ) : (
                    t('common.delete')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}