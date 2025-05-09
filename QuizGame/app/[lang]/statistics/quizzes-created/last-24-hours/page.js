'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { getGlobalStatistics } from '@/firebase/statistics';
import { useTranslation } from '@/app/translations';

export default function QuizzesCreatedLast24HoursPage({ params }) {
  const { lang } = params;
  const { t } = useTranslation(lang);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('quizzesCreated')}</h1>
      <p className="text-gray-400 mb-8">{t('last24HoursStatistics')}</p>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-2xl font-semibold mb-4">{t('overview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">{t('last24Hours')}</p>
            <p className="text-3xl font-bold">{stats?.quizzesCreated?.last24Hours || 0}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">{t('percentageOfTotal')}</p>
            <p className="text-3xl font-bold">
              {stats?.quizzesCreated?.total > 0 
                ? Math.round((stats?.quizzesCreated?.last24Hours / stats?.quizzesCreated?.total) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Time period navigation */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
        <h3 className="text-xl font-semibold mb-4">{t('viewByTimePeriod')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/${lang}/statistics/quizzes-created`} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition">
            {t('allTime')}
          </Link>
          <Link href={`/${lang}/statistics/quizzes-created/last-30-days`} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition">
            {t('last30Days')}
          </Link>
          <Link href={`/${lang}/statistics/quizzes-created/last-7-days`} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition">
            {t('last7Days')}
          </Link>
          <div className="bg-blue-900 p-4 rounded-lg">
            {t('last24Hours')}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href={`/${lang}/statistics`} className="text-blue-500 hover:underline">
          {t('backToStatistics')}
        </Link>
      </div>
    </div>
  );
}