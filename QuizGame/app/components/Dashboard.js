'use client';

import { useAuth } from '../firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../firebase/config';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import QuizCard from './QuizCard';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { currentUser } = useAuth(); // Removed logout since we don't need it anymore
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [quizzesByCategory, setQuizzesByCategory] = useState({
    'General Knowledge': [],
    'Science & Technology': [],
    'Pop Culture': []
  });
  const [quizzesByTags, setQuizzesByTags] = useState([]);
  const [latestQuizzes, setLatestQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // If not logged in, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      router.push(`/${locale}/login`);
    }
  }, [currentUser, router, locale]);

  // Fetch quizzes data
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Reference to quizzes in the database
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          const quizzesArray = Object.keys(quizzesData).map(key => ({
            id: key,
            ...quizzesData[key]
          }));
          
          // Sort by creation date (newest first)
          const sortedQuizzes = [...quizzesArray].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          
          // Set latest quizzes (up to 10)
          setLatestQuizzes(sortedQuizzes.slice(0, 10));
          
          // Group quizzes by category
          const categorized = {
            'General Knowledge': [],
            'Science & Technology': [],
            'Pop Culture': []
          };
          
          quizzesArray.forEach(quiz => {
            if (quiz.category && categorized[quiz.category]) {
              if (categorized[quiz.category].length < 5) {
                categorized[quiz.category].push(quiz);
              }
            }
          });
          
          setQuizzesByCategory(categorized);
          
          // Group quizzes by tags (get 3 most recent tags and their quizzes)
          const tagMap = new Map();
          
          quizzesArray.forEach(quiz => {
            // Handle tags as a comma-separated string
            const quizTags = quiz.tags ? quiz.tags.split(', ').filter(Boolean) : [];
              
            if (quizTags.length > 0) {
              quizTags.forEach(tag => {
                if (tag && typeof tag === 'string') {
                  if (!tagMap.has(tag)) {
                    tagMap.set(tag, []);
                  }
                  tagMap.get(tag).push(quiz);
                }
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
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchQuizzes();
    }
  }, [currentUser]);

  if (!currentUser) {
    return null; // Don't render anything while checking auth status
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <main className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('common.welcome')}, {currentUser.displayName || currentUser.email}!
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
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a 1 1 0 110 2h-5v5a 1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a 1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('common.createQuiz')}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <h3 className="font-medium text-lg mb-2 text-indigo-600 dark:text-indigo-400">
                  {t('dashboard.recentQuizzes')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('dashboard.noQuizzesTaken')}
                </p>
                <Link
                  href={`/${locale}/quizzes`}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t('dashboard.browseQuizzes')} →
                </Link>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <h3 className="font-medium text-lg mb-2 text-indigo-600 dark:text-indigo-400">
                  {t('dashboard.yourStats')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('dashboard.completeQuizzes')}
                </p>
                <Link
                  href={`/${locale}/profile`}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t('dashboard.viewProfile')} →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 2: Quizzes by Recent Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.quizzesByRecentTags')}
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
          ) : quizzesByTags.length > 0 ? (
            <div className="space-y-8">
              {quizzesByTags.map(({ tag, quizzes }) => (
                <div key={tag}>
                  <h3 className="text-lg font-medium mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm mr-2">
                      #{tag}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map(quiz => (
                      <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('dashboard.noTaggedQuizzes')}
            </p>
          )}
        </div>
        
        {/* Section 3: Latest Quizzes */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {latestQuizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('dashboard.noQuizzesFound')}
            </p>
          )}
        </div>
        
        {/* Featured Quizzes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.featuredQuizzes')}
            </h2>
            <div className="flex space-x-2">
              <Link
                href={`/${locale}/create-quiz`}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a 1 1 0 110 2h-5v5a 1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a 1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('dashboard.createYourOwn')}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          </div>
        </div>
      </main>
    </div>
  );
}