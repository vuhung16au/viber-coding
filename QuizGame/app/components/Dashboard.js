'use client';

import { useAuth } from '../firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../firebase/config';
import { ref, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import QuizCard from './QuizCard';
import { useLanguage } from '../context/LanguageContext';
import { getAllCategories } from '../firebase/database';
import Pagination from './Pagination';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [quizzesByCategory, setQuizzesByCategory] = useState({
    'General Knowledge': [],
    'Science & Technology': [],
    'Pop Culture': []
  });
  const [quizzesByTags, setQuizzesByTags] = useState([]);
  const [latestQuizzes, setLatestQuizzes] = useState([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]); // Add state for featured quizzes
  const [mostPlayedQuizzes, setMostPlayedQuizzes] = useState([]); // Add state for most played quizzes
  const [loading, setLoading] = useState(true);
  // New state variables for user activity
  const [recentCreatedQuizzes, setRecentCreatedQuizzes] = useState([]);
  const [recentCompletedQuizzes, setRecentCompletedQuizzes] = useState([]);
  const [userStats, setUserStats] = useState({
    quizzesPlayed: 0,
    quizzesCreated: 0
  });
  const [categories, setCategories] = useState([]); // State for categories from database
  const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedLatestQuizzes, setPaginatedLatestQuizzes] = useState([]);
  
  // If not logged in, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      router.push(`/${locale}/login`);
    }
  }, [currentUser, router, locale]);

  // Fetch quizzes data and user activity
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Reference to quizzes in the database
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        // Reference to results in the database to calculate most played
        const resultsRef = ref(db, 'results');
        const resultsSnapshot = await get(resultsRef);
        
        let quizzesArray = [];
        let quizPlayCountMap = new Map(); // To track play count for each quiz
        
        // Process results to count plays for each quiz
        if (resultsSnapshot.exists()) {
          const resultsData = resultsSnapshot.val();
          Object.values(resultsData).forEach(result => {
            if (result.quizId) {
              const count = quizPlayCountMap.get(result.quizId) || 0;
              quizPlayCountMap.set(result.quizId, count + 1);
            }
          });
        }
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          quizzesArray = Object.keys(quizzesData).map(key => ({
            id: key,
            ...quizzesData[key],
            playCount: quizPlayCountMap.get(key) || 0 // Add play count to each quiz
          }));
          
          // Sort by creation date (newest first)
          const sortedQuizzes = [...quizzesArray].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          
          // Set latest quizzes
          setLatestQuizzes(sortedQuizzes);
          
          // Get featured quizzes
          const featuredQuizzesArray = quizzesArray.filter(quiz => quiz.isFeatured === true).slice(0, 5);
          setFeaturedQuizzes(featuredQuizzesArray);
          
          // Get most played quizzes
          const mostPlayedQuizzesArray = [...quizzesArray]
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
            .slice(0, 5);
          setMostPlayedQuizzes(mostPlayedQuizzesArray);
          
          // Group quizzes by category
          const categorized = {
            'General Knowledge': [],
            'Science & Technology': [],
            'Pop Culture': [],
            'History': [],
            'Geography': [],
            'Sports': [],
            'Other': []
          };
          
          quizzesArray.forEach(quiz => {
            if (quiz.category && categorized[quiz.category]) {
              // Ensure we only add up to 5 quizzes per category
              if (categorized[quiz.category].length < 5) {
                categorized[quiz.category].push(quiz);
              }
            }
          });
          
          // Filter out empty categories
          const filteredCategories = {};
          Object.keys(categorized).forEach(category => {
            if (categorized[category].length > 0) {
              filteredCategories[category] = categorized[category];
            }
          });
          
          setQuizzesByCategory(filteredCategories);
          
          // Group quizzes by tags
          const tagMap = new Map();
          
          quizzesArray.forEach(quiz => {
            // Handle tags safely as a comma-separated string or array
            let quizTags = [];
            
            if (quiz.tags) {
              if (typeof quiz.tags === 'string') {
                quizTags = quiz.tags.split(',').map(tag => tag.trim()).filter(Boolean);
              } else if (Array.isArray(quiz.tags)) {
                quizTags = quiz.tags.filter(tag => tag && typeof tag === 'string');
              }
            }
              
            if (quizTags.length > 0) {
              quizTags.forEach(tag => {
                if (!tagMap.has(tag)) {
                  tagMap.set(tag, []);
                }
                tagMap.get(tag).push(quiz);
              });
            }
          });
          
          // Sort tags by most recent quiz for that tag
          const sortedTags = Array.from(tagMap.entries())
            .sort((a, b) => {
              const aLatest = a[1].reduce((latest, quiz) => {
                const quizDate = new Date(quiz.createdAt || 0);
                return quizDate > latest ? quizDate : latest;
              }, new Date(0));
              
              const bLatest = b[1].reduce((latest, quiz) => {
                const quizDate = new Date(quiz.createdAt || 0);
                return quizDate > latest ? quizDate : latest;
              }, new Date(0));
              
              return bLatest - aLatest;
            })
            .slice(0, 3)
            .map(([tag, quizzes]) => ({ tag, quizzes: quizzes.slice(0, 3) }));
          
          setQuizzesByTags(sortedTags);
          
          // Get quizzes created by current user (up to 5)
          const userCreatedQuizzes = quizzesArray
            .filter(quiz => quiz.userId === currentUser.uid)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);
          
          setRecentCreatedQuizzes(userCreatedQuizzes);
          setUserStats(prev => ({...prev, quizzesCreated: userCreatedQuizzes.length}));
        }
        
        // Fetch user's completed quizzes
        const userResultsRef = ref(db, 'results');
        const userResultsQuery = query(userResultsRef, orderByChild('userId'), equalTo(currentUser.uid));
        const userResultsSnapshot = await get(userResultsQuery);
        
        if (userResultsSnapshot.exists()) {
          const resultsData = userResultsSnapshot.val();
          const resultsArray = Object.keys(resultsData).map(key => ({
            id: key,
            ...resultsData[key]
          }));
          
          // Sort results by date (newest first)
          const sortedResults = resultsArray.sort((a, b) => {
            // Handle different date formats
            const getTime = (date) => {
              if (date?.seconds) return date.seconds * 1000;
              return new Date(date || 0).getTime();
            };
            
            return getTime(b.date) - getTime(a.date);
          });
          
          // Get details for each quiz result
          const recentResults = sortedResults.slice(0, 5);
          const quizDetails = await Promise.all(
            recentResults.map(async (result) => {
              const quizRef = ref(db, `quizzes/${result.quizId}`);
              const quizSnapshot = await get(quizRef);
              const quizData = quizSnapshot.exists() ? quizSnapshot.val() : { title: 'Unknown Quiz' };
              
              return {
                ...result,
                quizTitle: quizData.title,
                quizCategory: quizData.category || 'General',
                quizCoverImage: quizData.coverImage || '/images/default-quiz.jpg'
              };
            })
          );
          
          setRecentCompletedQuizzes(quizDetails);
          setUserStats(prev => ({...prev, quizzesPlayed: sortedResults.length}));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Effect to handle pagination of latest quizzes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLatestQuizzes(latestQuizzes.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, latestQuizzes]);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // Use the getAllCategories function from the database.js
        const categoriesData = await getAllCategories();
        // Sort categories by display order and filter only active ones
        const sortedCategories = categoriesData
          .filter(cat => cat.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
      <main className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {`${t('common.welcome')}, ${currentUser.displayName || currentUser.email}!`}
            </h1>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.yourDashboard')}
              </h2>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Quizzes */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <h3 className="font-medium text-lg mb-4 text-indigo-600 dark:text-indigo-400">
                  {t('dashboard.recentQuizzes')}
                </h3>

                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recent Created Quizzes */}
                    <div>
                      <h4 className="text-sm uppercase font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        {t('dashboard.quizzesCreated')}
                      </h4>
                      
                      {recentCreatedQuizzes.length > 0 ? (
                        <ul className="space-y-2">
                          {recentCreatedQuizzes.map(quiz => (
                            <li key={quiz.id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                              <Link 
                                href={`/${locale}/quiz/${quiz.id}`}
                                className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {quiz.title}
                              </Link>
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{quiz.category}</span>
                                <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {t('dashboard.noQuizzesCreated')}
                        </p>
                      )}
                    </div>

                    {/* Recent Completed Quizzes */}
                    <div>
                      <h4 className="text-sm uppercase font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        {t('dashboard.quizzesCompleted')}
                      </h4>
                      
                      {recentCompletedQuizzes.length > 0 ? (
                        <ul className="space-y-2">
                          {recentCompletedQuizzes.map(quiz => (
                            <li key={quiz.id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                              <Link 
                                href={`/${locale}/quiz/${quiz.quizId}`}
                                className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {quiz.quizTitle}
                              </Link>
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Score: {quiz.score}%</span>
                                <span>
                                  {quiz.date?.seconds 
                                    ? new Date(quiz.date.seconds * 1000).toLocaleDateString() 
                                    : new Date(quiz.date).toLocaleDateString()}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {t('dashboard.noQuizzesCompleted')}
                        </p>
                      )}
                      <div className="mt-4">
                        <Link
                          href={`/${locale}/quizzes`}
                          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm"
                        >
                          {t('dashboard.browseQuizzes')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Your Stats */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <h3 className="font-medium text-lg mb-4 text-indigo-600 dark:text-indigo-400">
                  {t('dashboard.yourStats')}
                </h3>
                
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                          {userStats.quizzesPlayed}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('dashboard.quizzesPlayed')}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                          {userStats.quizzesCreated}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('dashboard.quizzesCreated')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm uppercase font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        {t('dashboard.quickActions')}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        <Link
                          href={`/${locale}/dashboard/my-quizzes`}
                          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                          {t('dashboard.manageMyQuizzes')}
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/my-results`}
                          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                          {t('dashboard.viewAllResults')}
                        </Link>
                        <Link
                          href={`/${locale}/profile`}
                          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                          {t('dashboard.editProfile')}
                        </Link>
                      </div>
                    </div>

                    {/* Admin-only menu */}
                    {currentUser && currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Admin Tools
                        </h4>
                        <div className="space-y-2">
                          <Link 
                            href={`/${locale}/admin/categories`}
                            className="text-red-600 dark:text-red-400 text-sm hover:underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Manage Categories
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 2: Latest Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.latestQuizzes')}
            </h2>
            <Link
              href={`/${locale}/quizzes`}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {t('common.viewAll')} →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : latestQuizzes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedLatestQuizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
              
              {/* Pagination for Latest Quizzes */}
              {latestQuizzes.length > itemsPerPage && (
                <Pagination
                  totalItems={latestQuizzes.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('dashboard.noQuizzesFound')}
            </p>
          )}
        </div>
        
        {/* Featured Categories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.exploreCategoryQuizzes')}
            </h2>
            <Link
              href={`/${locale}/quizzes`}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {t('common.viewAll')} →
            </Link>
          </div>
          
          {/* Most Played Quizzes */}
          <div className="mb-8">
            <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-gray-200">
              {t('dashboard.mostPlayedQuizzes')}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : mostPlayedQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {mostPlayedQuizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('dashboard.noQuizzesFound')}
              </p>
            )}
          </div>
          
          {/* Featured Quizzes */}
          <div>
            <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-gray-200">
              {t('dashboard.featuredQuizzes')}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : featuredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {featuredQuizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('dashboard.noFeaturedQuizzes')}
              </p>
            )}
          </div>
          
          {/* Category Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-gray-200">
              {t('dashboard.browseByCategory')}
            </h3>
            
            {loadingCategories ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.length > 0 ? (
                  categories.slice(0, 6).map(category => (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md">
                      <h3 className="font-medium mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {category.description || t('dashboard.exploreCategory')}
                      </p>
                      <Link
                        href={`/${locale}/quizzes/${category.slug}`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        {t('dashboard.startQuiz')} →
                      </Link>
                    </div>
                  ))
                ) : (
                  /* Fallback categories if no categories are found */
                  <>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md">
                      <h3 className="font-medium mb-2">{t('dashboard.generalKnowledge')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {t('dashboard.testKnowledge')}
                      </p>
                      <Link
                        href={`/${locale}/quizzes/general-knowledge`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        {t('dashboard.startQuiz')} →
                      </Link>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md">
                      <h3 className="font-medium mb-2">{t('dashboard.scienceTech')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {t('dashboard.exploreScience')}
                      </p>
                      <Link
                        href={`/${locale}/quizzes/science-tech`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        {t('dashboard.startQuiz')} →
                      </Link>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md">
                      <h3 className="font-medium mb-2">{t('dashboard.popCulture')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {t('dashboard.testPopCulture')}
                      </p>
                      <Link
                        href={`/${locale}/quizzes/pop-culture`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        {t('dashboard.startQuiz')} →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}