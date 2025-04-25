'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/config';
import QuizCard from '@/app/components/QuizCard';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/firebase/auth';
import { duplicateQuiz } from '@/app/firebase/database';
import Pagination from '@/app/components/Pagination';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const lang = params.lang || 'en';
  const { currentUser } = useAuth();
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState(null);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedQuizzes, setPaginatedQuizzes] = useState([]);

  // Filter options state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          const quizzesList = Object.keys(quizzesData)
            .map(key => ({
              id: key,
              ...quizzesData[key]
            }))
            // Sort by creation date (newest first)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          
          setQuizzes(quizzesList);
          setFilteredQuizzes(quizzesList);
          
          // Extract all unique categories for the filter dropdown
          const allCategories = new Set();
          quizzesList.forEach(quiz => {
            if (quiz.categories) {
              const quizCategories = Array.isArray(quiz.categories) 
                ? quiz.categories 
                : typeof quiz.categories === 'object'
                  ? Object.values(quiz.categories)
                  : [quiz.categories];
                  
              quizCategories.forEach(category => {
                if (category) allCategories.add(category);
              });
            }
          });
          setCategories(Array.from(allCategories).sort());
        } else {
          setQuizzes([]);
          setFilteredQuizzes([]);
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

  // Handle search and filter
  useEffect(() => {
    let results = [...quizzes];
    
    // Apply category filter if selected
    if (selectedCategory) {
      results = results.filter(quiz => {
        const quizCategories = getCategoriesArray(quiz.categories);
        return quizCategories.some(category => 
          category.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }
    
    // Apply search term if entered
    if (searchTerm.trim() !== '') {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      
      results = results.filter(quiz => {
        // Search in title and description
        if (
          quiz.title?.toLowerCase().includes(normalizedSearchTerm) ||
          quiz.description?.toLowerCase().includes(normalizedSearchTerm)
        ) {
          return true;
        }
        
        // Search in categories
        const quizCategories = getCategoriesArray(quiz.categories);
        if (quizCategories.some(category => 
          category.toLowerCase().includes(normalizedSearchTerm)
        )) {
          return true;
        }
        
        // Search in tags
        const quizTags = getTagsArray(quiz.tags);
        if (quizTags.some(tag => 
          tag.toLowerCase().includes(normalizedSearchTerm)
        )) {
          return true;
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
    }
    
    setFilteredQuizzes(results);
    setCurrentPage(1); // Reset to first page when search or filter changes
  }, [searchTerm, selectedCategory, quizzes]);

  // Helper functions to handle different data formats
  const getCategoriesArray = (categories) => {
    if (!categories) return [];
    if (typeof categories === 'string') return [categories];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'object') return Object.values(categories);
    return [];
  };
  
  const getTagsArray = (tags) => {
    if (!tags) return [];
    if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim());
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'object') return Object.values(tags);
    return [];
  };

  // Paginate filtered results
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
  
  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Handle page change for pagination
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

  // Handle duplicating a quiz
  const handleDuplicateQuiz = async (quizId) => {
    if (!currentUser) {
      router.push(`/${lang}/login`);
      return;
    }
    
    setDuplicateLoading(true);
    
    try {
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
          setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
          
          // Update filtered quizzes as well
          setFilteredQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
          
          // Go back to first page to show the new quiz
          setCurrentPage(1); 
          
          // Show success message
          setDuplicateSuccess(newQuizId);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setDuplicateSuccess(null);
          }, 3000);
        }
      } else {
        setError('Failed to duplicate quiz. Please try again.');
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error duplicating quiz:', err);
      setError('Failed to duplicate quiz. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
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
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          {t('navigation.quizzes')}
        </h1>
        
        {/* Search and Filter Controls */}
        <div className="mb-6">
          {/* Search Box */}
          <div className="relative mb-4">
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
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Filter by category"
              >
                <option value="">{t('search.allCategories')}</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button - only show if any filter is applied */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {t('search.clearFilters')}
              </button>
            )}
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {t('search.showingResults', { count: filteredQuizzes.length, total: quizzes.length })}
          </div>
          
          {/* No results message */}
          {filteredQuizzes.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('search.noQuizzesFound')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('search.tryDifferentSearch')}
              </p>
            </div>
          )}
        </div>

        {/* Success message */}
        {duplicateSuccess && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300">
            Quiz duplicated successfully! You can find it in your "My Quizzes" page.
          </div>
        )}
      
        {/* Quiz Cards Grid */}
        {filteredQuizzes.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedQuizzes.map(quiz => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onStart={() => handleStartQuiz(quiz.id)}
                  showActions={!!currentUser}
                  onDuplicate={() => handleDuplicateQuiz(quiz.id)}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {filteredQuizzes.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination
                  totalItems={filteredQuizzes.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}