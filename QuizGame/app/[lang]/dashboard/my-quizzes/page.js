'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../app/firebase/auth';
import { db } from '../../../../app/firebase/config';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import QuizCard from '../../../../app/components/QuizCard';
import { useLanguage } from '../../../../app/context/LanguageContext';
import { deleteQuiz } from '../../../../app/firebase/database';
import Pagination from '../../../../app/components/Pagination';

export default function MyQuizzes() {
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedQuizzes, setPaginatedQuizzes] = useState([]);

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
          setFilteredQuizzes(sortedQuizzes); // Initialize filtered quizzes with all quizzes
        } else {
          setMyQuizzes([]);
          setFilteredQuizzes([]);
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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuizzes(myQuizzes);
      setCurrentPage(1); // Reset to first page when clearing search
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    const filtered = myQuizzes.filter(quiz => {
      // Search in title and description
      if (
        quiz.title?.toLowerCase().includes(normalizedSearchTerm) ||
        quiz.description?.toLowerCase().includes(normalizedSearchTerm)
      ) {
        return true;
      }
      
      // Search in categories (can be string, array, or object)
      let categories = [];
      if (quiz.categories) {
        if (typeof quiz.categories === 'string') {
          categories = [quiz.categories];
        } else if (Array.isArray(quiz.categories)) {
          categories = quiz.categories;
        } else if (typeof quiz.categories === 'object') {
          categories = Object.values(quiz.categories);
        }
        
        if (categories.some(category => 
          category.toLowerCase().includes(normalizedSearchTerm)
        )) {
          return true;
        }
      }
      
      // Search in tags (can be string, array, or object)
      let tags = [];
      if (quiz.tags) {
        if (typeof quiz.tags === 'string') {
          tags = quiz.tags.split(',').map(tag => tag.trim());
        } else if (Array.isArray(quiz.tags)) {
          tags = quiz.tags;
        } else if (typeof quiz.tags === 'object') {
          tags = Object.values(quiz.tags);
        }
        
        if (tags.some(tag => 
          tag.toLowerCase().includes(normalizedSearchTerm)
        )) {
          return true;
        }
      }
      
      // Search in questions and answers
      if (quiz.questions) {
        const questions = Array.isArray(quiz.questions) 
          ? quiz.questions 
          : typeof quiz.questions === 'object'
            ? Object.values(quiz.questions)
            : [];
            
        return questions.some(question => {
          // Search in question text
          if (question.text?.toLowerCase().includes(normalizedSearchTerm)) {
            return true;
          }
          
          // Search in answers
          if (question.answers) {
            const answers = Array.isArray(question.answers)
              ? question.answers
              : typeof question.answers === 'object'
                ? Object.values(question.answers)
                : [];
                
            return answers.some(answer => 
              answer.text?.toLowerCase().includes(normalizedSearchTerm)
            );
          }
          
          return false;
        });
      }
      
      return false;
    });
    
    setFilteredQuizzes(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, myQuizzes]);

  // Effect to handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedQuizzes(filteredQuizzes.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, filteredQuizzes]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

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
        setFilteredQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
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

  // Handle duplicating a quiz
  const handleDuplicateQuiz = async (quizId) => {
    if (!currentUser) return;
    
    setDuplicateLoading(true);
    setError(null);
    
    try {
      // Import the function from the correct path
      const { duplicateQuiz } = await import('../../../../app/firebase/database');
      
      // Duplicate the quiz
      const newQuizId = await duplicateQuiz(quizId, currentUser.uid);
      
      if (newQuizId) {
        // Get the new quiz data to add to state
        const quizRef = ref(db, `quizzes/${newQuizId}`);
        const snapshot = await get(quizRef);
        
        if (snapshot.exists()) {
          const newQuiz = {
            id: newQuizId,
            ...snapshot.val()
          };
          
          // Add the new quiz to our state
          setMyQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
          setFilteredQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
          setCurrentPage(1); // Go back to first page to show the new quiz
          
          // Show success feedback
          setError({ 
            type: 'success', 
            message: 'Quiz duplicated successfully!' 
          });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setError(null);
          }, 3000);
        }
      } else {
        setError({ 
          type: 'error', 
          message: 'Failed to duplicate quiz. Please try again.' 
        });
      }
    } catch (err) {
      console.error('Error duplicating quiz:', err);
      setError({ 
        type: 'error', 
        message: 'Failed to duplicate quiz. Please try again.' 
      });
    } finally {
      setDuplicateLoading(false);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the quiz list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page when changing items per page
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
        
        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('search.searchQuizzes')}
              className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {filteredQuizzes.length === 0 && searchTerm && !loading && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('search.noQuizzesFound')}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          typeof error === 'string' ? (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : error.type === 'success' ? (
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-green-700 dark:text-green-300">
              {error.message}
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
              {error.message}
            </div>
          )
        ) : filteredQuizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedQuizzes.map(quiz => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz}
                  isOwner={true} // Ensure action buttons show
                  onEdit={() => handleEditQuiz(quiz.id)}
                  onDelete={() => handleDeleteQuiz(quiz.id)}
                  onDuplicate={() => handleDuplicateQuiz(quiz.id)}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {filteredQuizzes.length > 0 && (
              <Pagination
                totalItems={filteredQuizzes.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
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