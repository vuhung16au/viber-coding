'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';
import { getGlobalStatistics, getUserStatistics } from '../firebase/statistics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr disabled to prevent server-side rendering issues
const StatisticsContent = dynamic(() => Promise.resolve(StatisticsPageContent), {
  ssr: false
});

export default function StatisticsPage() {
  return <StatisticsContent />;
}

function StatisticsPageContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [globalStats, setGlobalStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch global and user statistics
        const global = await getGlobalStatistics();
        const user = await getUserStatistics(currentUser.uid);
        
        setGlobalStats(global);
        setUserStats(user);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getTimeframeText = (timeframe) => {
    switch (timeframe) {
      case 'last24Hours':
        return t('statistics.last24Hours');
      case 'last7Days':
        return t('statistics.last7Days');
      case 'last30Days':
        return t('statistics.last30Days');
      case 'total':
        return t('statistics.allTime');
      default:
        return timeframe;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('statistics.title')}</h1>
      
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('statistics.overview')}
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('quizzesPlayed')}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'quizzesPlayed'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('statistics.quizzesPlayed')}
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('quizzesCreated')}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'quizzesCreated'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('statistics.quizzesCreated')}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('global')}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'global'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('statistics.globalStats')}
            </button>
          </li>
        </ul>
      </div>
      
      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('statistics.yourQuizActivity')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.quizzesPlayed')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesPlayed?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.quizzesCreated')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesCreated?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.playedLast7Days')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesPlayed?.last7Days || 0}
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.createdLast7Days')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesCreated?.last7Days || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('statistics.globalStatistics')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.totalQuizzesPlayed')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {globalStats?.quizzesPlayed?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.totalQuizzesCreated')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {globalStats?.quizzesCreated?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.playedLast24Hours')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {globalStats?.quizzesPlayed?.last24Hours || 0}
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.createdLast24Hours')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {globalStats?.quizzesCreated?.last24Hours || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('statistics.quickLinks')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/quizzes" 
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">{t('statistics.browseQuizzes')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.discoverNewQuizzes')}</p>
              </Link>
              <Link 
                href="/create-quiz" 
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">{t('statistics.createQuiz')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.shareKnowledge')}</p>
              </Link>
              <Link 
                href={`/${currentUser.displayName || currentUser.uid}/quiz-history`}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">{t('statistics.quizHistory')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.viewQuizHistory')}</p>
              </Link>
              <Link 
                href={`/${currentUser.displayName || currentUser.uid}/profile`}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">{t('profile.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('statistics.viewEditProfile')}</p>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of the content remains the same, but with t() function calls for translation */}
      {/* Quizzes Played Tab Content */}
      {activeTab === 'quizzesPlayed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t('statistics.yourQuizPlayStats')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {['last24Hours', 'last7Days', 'last30Days', 'total'].map((timeframe) => (
              <div key={timeframe} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{getTimeframeText(timeframe)}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesPlayed?.[timeframe] || 0}
                </p>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('statistics.recentQuizActivity')}</h3>
          
          {userStats?.quizzesPlayed?.history && Object.keys(userStats.quizzesPlayed.history).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.quiz')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.score')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(userStats.quizzesPlayed.history)
                    .sort(([timestampA], [timestampB]) => Number(timestampB) - Number(timestampA))
                    .slice(0, 10)
                    .map(([timestamp, entry]) => (
                      <tr key={timestamp} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {t('statistics.quizId')} #{entry.quizId.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(Number(timestamp)).toLocaleString(locale)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {entry.score} / {entry.totalQuestions} ({Math.round((entry.score / entry.totalQuestions) * 100)}%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/quiz/${entry.quizId}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                            {t('statistics.playAgain')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {t('statistics.noQuizzesPlayedYet')} <Link href="/quizzes" className="text-blue-600 dark:text-blue-500 hover:underline">{t('statistics.browseQuizzes')}</Link> {t('statistics.toGetStarted')}
            </p>
          )}
        </div>
      )}
      
      {/* Quizzes Created Tab Content */}
      {activeTab === 'quizzesCreated' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t('statistics.yourQuizCreationStats')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {['last24Hours', 'last7Days', 'last30Days', 'total'].map((timeframe) => (
              <div key={timeframe} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{getTimeframeText(timeframe)}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.quizzesCreated?.[timeframe] || 0}
                </p>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('statistics.recentlyCreatedQuizzes')}</h3>
          
          {userStats?.quizzesCreated?.history && Object.keys(userStats.quizzesCreated.history).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.quiz')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.dateCreated')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('statistics.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(userStats.quizzesCreated.history)
                    .sort(([timestampA], [timestampB]) => Number(timestampB) - Number(timestampA))
                    .slice(0, 10)
                    .map(([timestamp, entry]) => (
                      <tr key={timestamp} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {t('statistics.quizId')} #{entry.quizId.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(Number(timestamp)).toLocaleString(locale)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <Link href={`/quiz/${entry.quizId}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                              {t('statistics.viewQuiz')}
                            </Link>
                            <Link href={`/quiz/${entry.quizId}/edit`} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                              {t('statistics.edit')}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {t('statistics.noQuizzesCreatedYet')} <Link href="/create-quiz" className="text-blue-600 dark:text-blue-500 hover:underline">{t('statistics.createYourFirstQuiz')}</Link>!
            </p>
          )}
          
          <div className="mt-6 flex justify-center">
            <Link 
              href="/create-quiz" 
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('statistics.createNewQuiz')}
            </Link>
          </div>
        </div>
      )}
      
      {/* Global Statistics Tab Content */}
      {activeTab === 'global' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t('statistics.globalQuizStatistics')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('statistics.quizzesPlayed')}</h3>
              <div className="space-y-4">
                {['last24Hours', 'last7Days', 'last30Days', 'total'].map((timeframe) => (
                  <div key={timeframe} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{getTimeframeText(timeframe)}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {globalStats?.quizzesPlayed?.[timeframe] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('statistics.quizzesCreated')}</h3>
              <div className="space-y-4">
                {['last24Hours', 'last7Days', 'last30Days', 'total'].map((timeframe) => (
                  <div key={timeframe} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex justify-between items-center">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{getTimeframeText(timeframe)}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {globalStats?.quizzesCreated?.[timeframe] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}