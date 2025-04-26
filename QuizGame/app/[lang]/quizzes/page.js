'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { get, query, ref, orderByChild, equalTo } from 'firebase/database';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/auth';
import QuizCard from '../../components/QuizCard';
import Pagination from '../../components/Pagination';

export default function Quizzes() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showingResults, setShowingResults] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(9);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = ref(db, 'categories');
        const categoriesSnapshot = await get(categoriesRef);
        
        if (categoriesSnapshot.exists()) {
          const categoriesData = Object.values(categoriesSnapshot.val())
            .filter(cat => cat.isActive)
            .map(cat => ({ ...cat, id: cat.id || `cat-${Math.random().toString(36).substr(2, 9)}` })) // Ensure each category has a unique ID
            .sort((a, b) => a.displayOrder - b.displayOrder);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const quizzesRef = ref(db, 'quizzes');
        const quizzesSnapshot = await get(quizzesRef);
        
        if (!quizzesSnapshot.exists()) {
          setLoading(false);
          setQuizzes([]);
          return;
        }
        
        let quizzesData = Object.entries(quizzesSnapshot.val()).map(([id, quiz]) => ({
          id,
          ...quiz
        }));

        // Filter quizzes based on public/private visibility
        // Show all quizzes owned by the current user, but only public quizzes from others
        if (currentUser) {
          quizzesData = quizzesData.filter(quiz => 
            quiz.userId === currentUser.uid || quiz.isPublic === true
          );
        } else {
          // For non-logged-in users, only show public quizzes
          quizzesData = quizzesData.filter(quiz => quiz.isPublic === true);
        }
        
        // Sort by creation date (most recent first)
        quizzesData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowingResults(true);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on category change
    setShowingResults(true);
  };

  // Filter quizzes based on search and category
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = 
      searchTerm === '' ||
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      quiz.category === selectedCategory ||
      quiz.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get current quizzes for pagination
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Quizzes
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search quizzes..."
                  className="w-full p-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            
            <div className="w-full md:w-1/3">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option key="all-categories" value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {showingResults && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              search.showingResults: {filteredQuizzes.length} results
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">Loading quizzes...</span>
        </div>
      ) : (
        <>
          {currentQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentQuizzes.map(quiz => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  isOwner={currentUser && quiz.userId === currentUser.uid}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                No quizzes found
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {showingResults
                  ? "No quizzes match your search criteria."
                  : "There are no quizzes available at the moment."}
              </p>
              {currentUser && (
                <button
                  onClick={() => router.push('/create-quiz')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create a Quiz
                </button>
              )}
            </div>
          )}
          
          {currentQuizzes.length > 0 && (
            <Pagination
              itemsPerPage={quizzesPerPage}
              totalItems={filteredQuizzes.length}
              currentPage={currentPage}
              paginate={paginate}
            />
          )}
        </>
      )}
    </div>
  );
}