'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/firebase/auth';
import { getUserResults, getQuizById } from '@/app/firebase/database';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define category display names mapping
const CATEGORY_DISPLAY_NAMES = {
  'general': 'General Knowledge',
  'science': 'Science',
  'history': 'History',
  'geography': 'Geography',
  'entertainment': 'Entertainment',
  'sports': 'Sports',
  'technology': 'Technology',
  'other': 'Other',
};

export default function MyQuizResults() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  
  const [resultsSummary, setResultsSummary] = useState({
    totalCompleted: 0,
    averageScore: 0,
    categories: {},
    recentQuizzes: []
  });
  const [detailedResults, setDetailedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Fetch the user's quiz results summary
  useEffect(() => {
    async function fetchResultsSummary() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userResults = await getUserResults(currentUser.uid);
        
        // Make sure we only have results for the current user
        const filteredUserResults = userResults.filter(result => result.userId === currentUser.uid);
        
        // Sort all results by date (newest first)
        const sortedResults = [...filteredUserResults].sort((a, b) => {
          const dateA = a.date ? new Date(a.date.seconds * 1000) : new Date(0);
          const dateB = b.date ? new Date(b.date.seconds * 1000) : new Date(0);
          return dateB - dateA;
        });
        
        // Get detailed results for each quiz completed
        const detailedResultsPromises = sortedResults.slice(0, 10).map(async (result) => {
          try {
            // Fetch the quiz to get additional information
            const quiz = await getQuizById(result.quizId);
            
            return {
              id: result.id,
              quizId: result.quizId,
              quizTitle: quiz?.title || 'Unknown Quiz',
              score: result.score || 0,
              correctAnswers: result.correctAnswers || 0,
              totalQuestions: result.totalQuestions || quiz?.questions?.length || 0,
              timeTaken: result.timeTaken || 0, // in seconds
              date: result.date ? new Date(result.date.seconds * 1000) : new Date(),
              category: CATEGORY_DISPLAY_NAMES[quiz?.category] || quiz?.category || 'Uncategorized'
            };
          } catch (error) {
            console.error("Error fetching quiz details for detailed results:", error);
            return null;
          }
        });
        
        const resolvedDetailedResults = await Promise.all(detailedResultsPromises);
        const validDetailedResults = resolvedDetailedResults.filter(r => r !== null);
        setDetailedResults(validDetailedResults);
        
        // Create a summary of all quizzes
        const totalCompleted = filteredUserResults.length;
        const totalScore = filteredUserResults.reduce((sum, result) => sum + (result.score || 0), 0);
        const averageScore = totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0;
        
        // Calculate category statistics
        const categoryStats = {};
        const categoryList = [];
        
        // Get quiz details for recent quizzes
        const recentQuizzesPromises = sortedResults.slice(0, 5).map(async (result) => {
          try {
            const quiz = await getQuizById(result.quizId);
            
            // Get the display name for the category
            const category = quiz?.category || 'uncategorized';
            const categoryDisplayName = CATEGORY_DISPLAY_NAMES[category] || category;
            
            // Add to category stats
            if (!categoryStats[categoryDisplayName]) {
              categoryStats[categoryDisplayName] = {
                count: 0,
                totalScore: 0,
                averageScore: 0
              };
              categoryList.push(categoryDisplayName);
            }
            
            categoryStats[categoryDisplayName].count += 1;
            categoryStats[categoryDisplayName].totalScore += (result.score || 0);
            categoryStats[categoryDisplayName].averageScore = Math.round(
              categoryStats[categoryDisplayName].totalScore / categoryStats[categoryDisplayName].count
            );
            
            return {
              id: result.id,
              quizId: result.quizId,
              quizTitle: quiz?.title || 'Unknown Quiz',
              score: result.score || 0,
              category: categoryDisplayName,
              date: result.date ? new Date(result.date.seconds * 1000) : new Date(),
              questionsCount: quiz?.questions ? quiz.questions.length : 0,
            };
          } catch (error) {
            console.error("Error fetching quiz details:", error);
            return null;
          }
        });
        
        // Filter out any null values from failed quiz fetches
        const recentQuizzesWithDetails = await Promise.all(recentQuizzesPromises);
        const validRecentQuizzes = recentQuizzesWithDetails.filter(q => q !== null);
        
        setResultsSummary({
          totalCompleted,
          averageScore,
          categories: categoryStats,
          recentQuizzes: validRecentQuizzes
        });
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResultsSummary();
  }, [currentUser]);

  // Format date to local string
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    try {
      // Handle Firebase Timestamp objects
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString(locale || 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // Handle JavaScript Date objects
      if (date instanceof Date && !isNaN(date)) {
        return date.toLocaleDateString(locale || 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      return 'Unknown date';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Unknown date';
    }
  };

  // Format time taken in a more readable way
  const formatTimeTaken = (seconds) => {
    if (!seconds || seconds <= 0) return 'Not recorded';
    
    if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? '' : 's'}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes === 1 ? '' : 's'}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}` : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours === 1 ? '' : 's'}${minutes > 0 ? ` ${minutes} minute${minutes === 1 ? '' : 's'}` : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-800 dark:text-gray-200">{t('common.loading')}</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('navigation.myResults')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('auth.login')} {t('results.toViewResults')}
        </p>
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200">
          {t('auth.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('results.title')}</h2>
      
      {resultsSummary.totalCompleted === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{t('results.noResults')}</p>
          <Link href="/quizzes" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200">
            {t('results.takeQuiz')}
          </Link>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              {t('results.summary')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Quizzes Completed */}
              <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                  {resultsSummary.totalCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('results.totalQuizzesCompleted')}
                </div>
              </div>

              {/* Average Score */}
              <div className="bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-2">
                  {resultsSummary.averageScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('results.averageScore')}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-purple-50 dark:bg-purple-900/40 border border-purple-100 dark:border-purple-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-2">
                  {Object.keys(resultsSummary.categories).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('results.categoriesExplored')}
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(resultsSummary.categories).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                {t('results.categoryBreakdown')}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('quiz.category')}
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('results.quizzesCompleted')}
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('results.averageScore')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {Object.entries(resultsSummary.categories).map(([category, stats]) => (
                      <tr key={category} className="hover:bg-gray-50 dark:hover:bg-gray-700/60">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          {category}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          {stats.count}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                            ${stats.averageScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 
                            stats.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                            {stats.averageScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Quizzes */}
          {resultsSummary.recentQuizzes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                {t('results.recentQuizzes')}
              </h3>
              
              <div className="space-y-3">
                {resultsSummary.recentQuizzes.map((quiz) => (
                  <div key={quiz.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-1">{quiz.quizTitle}</h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(quiz.date)} • {quiz.category}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mr-3
                        ${quiz.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 
                        quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                        {quiz.score}%
                      </span>
                      <button 
                        onClick={() => router.push(`/${locale}/quiz/${quiz.quizId}`)}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        {t('results.retake')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link href={`/${locale}/quizzes`} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  {t('results.findMoreQuizzes')} →
                </Link>
              </div>
            </div>
          )}

          {/* Detailed Results */}
          {detailedResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                {t('results.detailedResults')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {detailedResults.map((result) => (
                  <div key={result.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-5">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium text-gray-800 dark:text-white">{result.quizTitle}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                        ${result.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                        {result.score}%
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Correct Answers</p>
                        <p className="font-medium text-gray-800 dark:text-white">{result.correctAnswers} / {result.totalQuestions}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Percentage Correct</p>
                        <p className="font-medium text-gray-800 dark:text-white">{result.score}%</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Time Taken</p>
                        <p className="font-medium text-gray-800 dark:text-white">{formatTimeTaken(result.timeTaken)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-800 dark:text-white">{result.category}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Taken</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatDate(result.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => router.push(`/${locale}/quiz/${result.quizId}`)}
                        className="w-full text-center py-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        {t('results.retake')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}