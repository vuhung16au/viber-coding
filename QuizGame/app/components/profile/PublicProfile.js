'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase/config';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicProfile({ username, activeTab = 'profile' }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    highestScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the user ID from username
        const usernamesRef = ref(db, 'usernames');
        const usernamesSnapshot = await get(usernamesRef);
        
        if (!usernamesSnapshot.exists()) {
          throw new Error('Username not found');
        }
        
        const usernames = usernamesSnapshot.val();
        const userId = usernames[username];
        
        if (!userId) {
          throw new Error('Username not found');
        }
        
        // Get user profile data
        const userProfileRef = ref(db, `users/${userId}/profile`);
        const profileSnapshot = await get(userProfileRef);
        
        if (!profileSnapshot.exists()) {
          throw new Error('User profile not found');
        }
        
        const profileData = profileSnapshot.val();
        setUserData({
          ...profileData,
          userId
        });
        
        // Fetch user's quizzes
        const quizzesRef = ref(db, 'quizzes');
        const quizzesSnapshot = await get(quizzesRef);
        
        if (quizzesSnapshot.exists()) {
          const quizzesData = quizzesSnapshot.val();
          const userQuizList = Object.keys(quizzesData)
            .map(key => ({
              id: key,
              ...quizzesData[key]
            }))
            .filter(quiz => quiz.createdBy === userId && quiz.isPublic);
          
          setUserQuizzes(userQuizList);
        }
        
        // Fetch user's quiz results if they have enabled public results
        if (profileData.showPublicResults) {
          const resultsRef = ref(db, `users/${userId}/results`);
          const resultsSnapshot = await get(resultsRef);
          
          if (resultsSnapshot.exists()) {
            const resultsData = resultsSnapshot.val();
            const resultsArray = Object.keys(resultsData)
              .map(key => ({
                id: key,
                ...resultsData[key]
              }))
              .filter(result => result.isPublic);
            
            setQuizResults(resultsArray);
            setQuizHistory(resultsArray);
            
            // Calculate stats
            if (resultsArray.length > 0) {
              const totalQuizzes = resultsArray.length;
              const totalScore = resultsArray.reduce((sum, result) => sum + (result.score || 0), 0);
              const averageScore = totalScore / totalQuizzes;
              const highestScore = Math.max(...resultsArray.map(result => result.score || 0));
              
              const totalQuestions = resultsArray.reduce((sum, result) => sum + (result.totalQuestions || 0), 0);
              const correctAnswers = resultsArray.reduce((sum, result) => sum + (result.correctAnswers || 0), 0);
              const incorrectAnswers = totalQuestions - correctAnswers;
              const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
              
              setStats({
                totalQuizzesTaken: totalQuizzes,
                averageScore,
                highestScore,
                totalQuestionsAnswered: totalQuestions,
                correctAnswers,
                incorrectAnswers,
                accuracy,
              });
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (username) {
      fetchUserData();
    }
  }, [username]);
  
  const handleTabClick = (tabName) => {
    router.push(`/${username}/${tabName === 'profile' ? 'profile' : tabName}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">User not found: </strong>
        <span className="block sm:inline">The requested profile does not exist.</span>
      </div>
    );
  }
  
  return (
    <div>
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {userData.photoURL ? (
            <img 
              src={userData.photoURL} 
              alt={`${userData.displayName}'s profile`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{username}</p>
          
          {userData.bio && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{userData.bio}</p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
            {userData.language && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {userData.language}
              </span>
            )}
            
            {userData.timezone && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {userData.timezone}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => handleTabClick('profile')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Profile
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabClick('quiz')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'quiz'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Quizzes
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabClick('quiz-results')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'quiz-results'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Quiz Results
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabClick('statistics')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'statistics'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabClick('quiz-history')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'quiz-history'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Quiz History
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabClick('quiz-leaderboard')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'quiz-leaderboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Leaderboard
            </button>
          </li>
        </ul>
      </div>
      
      {/* Profile tab content */}
      {activeTab === 'profile' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">About {userData.displayName}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {userData.bio ? (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{userData.bio}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">This user hasn't added a bio yet.</p>
            )}
            
            {/* Additional profile information if available */}
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mt-4">
              {userData.language && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.language}</dd>
                </div>
              )}
              
              {userData.timezone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.timezone}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
      
      {/* Quiz tab content */}
      {activeTab === 'quiz' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{userData.displayName}'s Quizzes</h2>
          
          {userQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userQuizzes.map(quiz => (
                <div key={quiz.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-lg mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {quiz.description?.substring(0, 100)}{quiz.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {quiz.questions?.length || 0} Questions
                    </span>
                    <Link href={`/quiz/${quiz.id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      View Quiz →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400 mb-4">This user hasn't created any public quizzes yet.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Quiz Results tab content */}
      {activeTab === 'quiz-results' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{userData.displayName}'s Quiz Results</h2>
          
          {userData.showPublicResults ? (
            quizResults.length > 0 ? (
              <div className="space-y-4">
                {quizResults.map(result => (
                  <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{result.quizTitle || 'Unnamed Quiz'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Completed on {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold">
                          {result.score}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {result.correctAnswers} / {result.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-500 dark:text-gray-400">This user hasn't completed any quizzes yet or hasn't made any results public.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">This user has chosen to keep their quiz results private.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Statistics tab content */}
      {activeTab === 'statistics' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{userData.displayName}'s Quiz Statistics</h2>
          
          {userData.showPublicResults ? (
            stats.totalQuizzesTaken > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 shadow">
                  <h3 className="text-gray-600 dark:text-gray-400 mb-2">Quizzes Taken</h3>
                  <p className="text-3xl font-bold">{stats.totalQuizzesTaken}</p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 shadow">
                  <h3 className="text-gray-600 dark:text-gray-400 mb-2">Average Score</h3>
                  <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 shadow">
                  <h3 className="text-gray-600 dark:text-gray-400 mb-2">Highest Score</h3>
                  <p className="text-3xl font-bold">{stats.highestScore}%</p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 shadow">
                  <h3 className="text-gray-600 dark:text-gray-400 mb-2">Accuracy</h3>
                  <p className="text-3xl font-bold">{stats.accuracy.toFixed(1)}%</p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 md:col-span-2 bg-white dark:bg-gray-800 shadow">
                  <h3 className="text-gray-600 dark:text-gray-400 mb-2">Questions</h3>
                  <div className="flex items-center mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-l-full" 
                        style={{ width: `${stats.accuracy}%` }}
                      ></div>
                    </div>
                    <div className="ml-4 text-sm">
                      <span className="text-green-500 font-medium">{stats.correctAnswers}</span> correct / 
                      <span className="text-red-500 font-medium"> {stats.incorrectAnswers}</span> incorrect
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-500 dark:text-gray-400">This user hasn't completed any quizzes yet or hasn't made their statistics public.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">This user has chosen to keep their statistics private.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Quiz History tab content */}
      {activeTab === 'quiz-history' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{userData.displayName}'s Quiz History</h2>
          
          {userData.showPublicResults ? (
            quizHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quiz</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Taken</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {quizHistory.map(history => (
                      <tr key={history.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(history.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {history.quizTitle || 'Unnamed Quiz'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {history.score}%
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {history.timeTaken ? Math.floor(history.timeTaken / 60) + 'm ' + (history.timeTaken % 60) + 's' : 'N/A'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {history.correctAnswers}/{history.totalQuestions} ({((history.correctAnswers / history.totalQuestions) * 100).toFixed(1)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-500 dark:text-gray-400">This user hasn't completed any quizzes yet or hasn't made their quiz history public.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">This user has chosen to keep their quiz history private.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Leaderboard tab content */}
      {activeTab === 'quiz-leaderboard' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{userData.displayName}'s Leaderboard Rankings</h2>
          
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-500 dark:text-gray-400">Leaderboard data is loading or not available.</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later to see {userData.displayName}'s rankings.</p>
          </div>
        </div>
      )}
    </div>
  );
}