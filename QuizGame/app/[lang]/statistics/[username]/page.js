'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/LanguageContext';
import { getUserStatisticsByUsername, getUserResults } from '@/app/firebase/statistics';
import { useTranslation } from '@/app/translations';

export default function UserStatisticsPage({ params }) {
  const { lang, username } = params;
  const { t } = useTranslation(lang);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, played, created

  useEffect(() => {
    const fetchUserStatistics = async () => {
      try {
        // Get user statistics by username
        const userStats = await getUserStatisticsByUsername(username);
        
        // If we have the user ID from the stats, fetch their quiz results
        if (userStats) {
          const userId = Object.keys(userStats)[0]; // Get the user ID from the stats
          const results = await getUserResults(userId);
          setQuizResults(results);
        }
        
        setStats(userStats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserStatistics();
    } else {
      setIsLoading(false);
    }
  }, [username]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{t('userNotFound')}</h1>
        <p className="text-gray-400 mb-8">{t('userStatsNotFound').replace('{username}', username)}</p>
        <Link href={`/${lang}/statistics`} className="text-blue-500 hover:underline">
          {t('backToStatistics')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 relative rounded-full overflow-hidden bg-gray-600 mr-4">
          {stats.photoURL ? (
            <Image 
              src={stats.photoURL} 
              alt={username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{username}</h1>
          <p className="text-gray-400">{t('userStatistics')}</p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => handleTabChange('overview')}
            className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('overview')}
          </button>
          <button
            onClick={() => handleTabChange('played')}
            className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'played' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('quizzesPlayed')}
          </button>
          <button
            onClick={() => handleTabChange('created')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'created' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('quizzesCreated')}
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{t('quizzesCreated')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('total')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesCreated?.total || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last30Days')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesCreated?.last30Days || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last7Days')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesCreated?.last7Days || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last24Hours')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesCreated?.last24Hours || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{t('quizzesPlayed')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('total')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesPlayed?.total || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last30Days')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last30Days || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last7Days')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last7Days || 0}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">{t('last24Hours')}</p>
                  <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last24Hours || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent quiz results */}
          {quizResults.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{t('recentResults')}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-3">{t('quizName')}</th>
                      <th className="pb-3">{t('score')}</th>
                      <th className="pb-3">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.slice(0, 5).map((result) => (
                      <tr key={result.id} className="border-b border-gray-700 last:border-0">
                        <td className="py-3">
                          <Link href={`/${lang}/quiz/${result.quizId}`} className="hover:text-blue-400">
                            {result.quizTitle || t('unknownQuiz')}
                          </Link>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            result.score >= 80 ? 'bg-green-900 text-green-300' : 
                            result.score >= 60 ? 'bg-blue-900 text-blue-300' : 
                            result.score >= 40 ? 'bg-yellow-900 text-yellow-300' : 
                            'bg-red-900 text-red-300'
                          }`}>
                            {result.score}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">
                          {result.date ? new Date(result.date.seconds * 1000).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {quizResults.length > 5 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => handleTabChange('played')}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    {t('viewAllResults')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'played' && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">{t('quizzesPlayed')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('total')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesPlayed?.total || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last30Days')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last30Days || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last7Days')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last7Days || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last24Hours')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesPlayed?.last24Hours || 0}</p>
              </div>
            </div>
          </div>
          
          {/* All quiz results */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">{t('allQuizResults')}</h3>
            {quizResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-3">{t('quizName')}</th>
                      <th className="pb-3">{t('score')}</th>
                      <th className="pb-3">{t('correctAnswers')}</th>
                      <th className="pb-3">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map((result) => (
                      <tr key={result.id} className="border-b border-gray-700 last:border-0">
                        <td className="py-3">
                          <Link href={`/${lang}/quiz/${result.quizId}`} className="hover:text-blue-400">
                            {result.quizTitle || t('unknownQuiz')}
                          </Link>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            result.score >= 80 ? 'bg-green-900 text-green-300' : 
                            result.score >= 60 ? 'bg-blue-900 text-blue-300' : 
                            result.score >= 40 ? 'bg-yellow-900 text-yellow-300' : 
                            'bg-red-900 text-red-300'
                          }`}>
                            {result.score}%
                          </span>
                        </td>
                        <td className="py-3">
                          {result.correctAnswers}/{result.totalQuestions}
                        </td>
                        <td className="py-3 text-gray-400">
                          {result.date ? new Date(result.date.seconds * 1000).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">{t('noQuizResults')}</p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'created' && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{t('quizzesCreated')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('total')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesCreated?.total || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last30Days')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesCreated?.last30Days || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last7Days')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesCreated?.last7Days || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400">{t('last24Hours')}</p>
                <p className="text-3xl font-bold">{stats?.quizzesCreated?.last24Hours || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Placeholder for created quizzes - typically you would list the quizzes created by the user here */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">{t('createdQuizzes')}</h3>
            {/* This would be populated with actual quiz data */}
            <p className="text-gray-400">{t('quizListUnavailable')}</p>
            <div className="mt-4">
              <Link href={`/${lang}/user/${username}`} className="text-blue-500 hover:text-blue-400">
                {t('viewUserProfile')}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <Link href={`/${lang}/statistics`} className="text-blue-500 hover:underline">
          {t('backToStatistics')}
        </Link>
      </div>
    </div>
  );
}