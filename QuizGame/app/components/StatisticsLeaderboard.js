'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLeaderboardQuizzesPlayed, getLeaderboardQuizzesCreated } from '@/app/firebase/statistics';
import { useTranslation } from '@/app/translations';

const StatisticsLeaderboard = ({ lang, type = 'played', limit = 10 }) => {
  const { t } = useTranslation(lang);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let data;
        if (type === 'played') {
          data = await getLeaderboardQuizzesPlayed(limit);
        } else {
          data = await getLeaderboardQuizzesCreated(limit);
        }
        setLeaderboard(data);
      } catch (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, limit]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        {t('noLeaderboardData')}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">
        {type === 'played' ? t('topQuizPlayers') : t('topQuizCreators')}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-3">{t('rank')}</th>
              <th className="pb-3">{t('user')}</th>
              <th className="pb-3 text-right">
                {type === 'played' ? t('quizzesPlayed') : t('quizzesCreated')}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.userId} className="border-b border-gray-700 last:border-0">
                <td className="py-3 w-12">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                    {index + 1}
                  </div>
                </td>
                <td className="py-3">
                  <Link href={`/${lang}/statistics/${user.username}`} className="flex items-center hover:text-blue-400">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-600 mr-3">
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.username}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{user.username}</span>
                  </Link>
                </td>
                <td className="py-3 text-right font-bold">
                  {type === 'played' ? user.quizzesPlayed : user.quizzesCreated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticsLeaderboard;