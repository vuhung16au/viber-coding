'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/firebase/auth';
import { getGlobalStatistics, scheduleStatisticsCleanup, cleanupStatistics } from '@/app/firebase/statistics';
import { useTranslation } from '@/app/translations';
import StatisticsLeaderboard from '@/app/components/StatisticsLeaderboard';

export default function StatisticsPage() {
  const params = useParams();
  const { lang } = params;
  const { t } = useTranslation(lang);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'played', or 'created'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Schedule statistics cleanup when the component mounts
    // This will run once when the statistics page is first loaded
    scheduleStatisticsCleanup();
    
    const fetchStatistics = async () => {
      try {
        // Get global statistics
        const globalStats = await getGlobalStatistics();
        setStats(globalStats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCleanupStatistics = async () => {
    setRefreshing(true);
    try {
      await cleanupStatistics();
      // Refresh statistics after cleanup
      const globalStats = await getGlobalStatistics();
      setStats(globalStats);
    } catch (error) {
      console.error("Error during statistics cleanup:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white text-gray-800">{t('statistics.title')}</h1>
      
      {/* Tab Navigation */}
      <div className="mb-8 border-b dark:border-gray-700 border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => handleTabChange('overview')}
            className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('statistics.overview')}
          </button>
          <button
            onClick={() => handleTabChange('played')}
            className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'played' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('statistics.quizzesPlayed')}
          </button>
          <button
            onClick={() => handleTabChange('created')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'created' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t('statistics.quizzesCreated')}
          </button>
        </div>
      </div>
      
      {/* User-specific button */}
      {user && (
        <div className="mb-8">
          <Link href={`/${lang}/statistics/${user.displayName || 'profile'}`} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            {t('statistics.viewMyStats')}
          </Link>
        </div>
      )}
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Global Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.quizzesCreated')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.total')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.total || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last30Days')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last30Days || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last7Days')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last7Days || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last24Hours')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last24Hours || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.quizzesPlayed')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.total')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.total || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last30Days')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last30Days || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last7Days')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last7Days || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">{t('statistics.last24Hours')}</p>
                  <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last24Hours || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation menu for different statistics views */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.exploreStatistics')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/${lang}/statistics/quizzes-played`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.allQuizzesPlayed')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-created`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.allQuizzesCreated')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-played/last-30-days`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesPlayedLast30Days')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-created/last-30-days`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesCreatedLast30Days')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-played/last-7-days`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesPlayedLast7Days')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-created/last-7-days`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesCreatedLast7Days')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-played/last-24-hours`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesPlayedLast24Hours')}
              </Link>
              <Link href={`/${lang}/statistics/quizzes-created/last-24-hours`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-lg transition dark:text-white text-gray-800">
                {t('statistics.quizzesCreatedLast24Hours')}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'played' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.quizzesPlayed')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.total')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.total || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last30Days')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last30Days || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last7Days')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last7Days || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last24Hours')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesPlayed?.last24Hours || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Leaderboard for quizzes played */}
          <StatisticsLeaderboard lang={lang} type="played" limit={10} />
        </div>
      )}
      
      {activeTab === 'created' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.quizzesCreated')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.total')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.total || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last30Days')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last30Days || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last7Days')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last7Days || 0}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('statistics.last24Hours')}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-800">{stats?.quizzesCreated?.last24Hours || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Leaderboard for quizzes created */}
          <StatisticsLeaderboard lang={lang} type="created" limit={10} />
        </div>
      )}
      
      {/* Admin section */}
      {user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
        <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white text-gray-800">{t('statistics.adminTools')}</h3>
          <button 
            onClick={handleCleanupStatistics}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            {refreshing ? t('statistics.refreshing') : t('statistics.refreshAllStatistics')}
          </button>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('statistics.refreshStatsWarning')}</p>
        </div>
      )}
    </div>
  );
}