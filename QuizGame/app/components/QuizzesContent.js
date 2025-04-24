'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QuizCard from './QuizCard';
import Link from 'next/link';
import { getQuizzes, getMostPopularQuizzes, getRecentQuizzes } from '../firebase/database';

export default function QuizzesContent() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState([]);
  const [popularQuizzes, setPopularQuizzes] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [allQuizzes, mostPopular, mostRecent] = await Promise.all([
          getQuizzes(),
          getMostPopularQuizzes(5),
          getRecentQuizzes(5)
        ]);
        setQuizzes(allQuizzes);
        setFilteredQuizzes(allQuizzes);
        setPopularQuizzes(mostPopular);
        setRecentQuizzes(mostRecent);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(lowercaseQuery) || 
        quiz.description.toLowerCase().includes(lowercaseQuery) ||
        (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderQuizList = () => {
    let quizzesToShow = [];
    
    switch (activeTab) {
      case 'popular':
        quizzesToShow = popularQuizzes;
        break;
      case 'recent':
        quizzesToShow = recentQuizzes;
        break;
      case 'all':
      default:
        quizzesToShow = searchQuery ? filteredQuizzes : quizzes;
        break;
    }

    if (isLoading) {
      return (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (quizzesToShow.length === 0) {
      return (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          {searchQuery 
            ? t?.quizzes?.noSearchResults || "No quizzes match your search criteria." 
            : t?.quizzes?.noQuizzes || "No quizzes available at the moment."}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzesToShow.map(quiz => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="tabs-container">
          <button 
            onClick={() => handleTabChange('all')} 
            className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            {t?.quizzes?.allTab || "All Quizzes"}
          </button>
          <button 
            onClick={() => handleTabChange('popular')} 
            className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'popular' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            {t?.quizzes?.popularTab || "Most Popular"}
          </button>
          <button 
            onClick={() => handleTabChange('recent')} 
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'recent' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            {t?.quizzes?.recentTab || "Recently Added"}
          </button>
        </div>
        
        <div className="w-full md:w-auto flex items-center">
          <input
            type="text"
            placeholder={t?.quizzes?.searchPlaceholder || "Search quizzes..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full md:w-64"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {t?.quizzes?.searchButton || "Search"}
          </button>
        </div>
      </div>
      
      {renderQuizList()}
      
      {currentUser && (
        <div className="mt-8 flex justify-center">
          <Link href="/create-quiz" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            {t?.quizzes?.createButton || "Create Your Own Quiz"}
          </Link>
        </div>
      )}
    </div>
  );
}