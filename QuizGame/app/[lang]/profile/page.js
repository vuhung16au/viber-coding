'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/firebase/auth';
import { db } from '@/app/firebase/config';
import { ref, get, update } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useAuth();
  const router = useRouter();
  const { t, locale, changeLanguage, languageOptions } = useLanguage();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    bio: '',
    favoriteCategories: [],
    preferredLanguage: locale,
    username: '',
    originalUsername: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    photoURL: '',
    timezone: ''
  });
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    quizzesCreated: 0,
    averageScore: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const categories = [
    'General Knowledge',
    'Science & Technology',
    'History',
    'Geography',
    'Entertainment',
    'Sports',
    'Art & Literature',
    'Pop Culture',
  ];

  useEffect(() => {
    if (!currentUser) {
      router.push(`/${locale}/login`);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Get user profile data from Firebase
        const userRef = ref(db, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setProfile({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            bio: userData.bio || '',
            favoriteCategories: userData.favoriteCategories || [],
            preferredLanguage: userData.preferredLanguage || locale,
            username: userData.username || '',
            originalUsername: userData.username || '', // Store original username for comparison
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
            photoURL: userData.photoURL || currentUser.photoURL || '',
            timezone: userData.timezone || 'UTC+00:00'
          });
        } else {
          setProfile({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            bio: '',
            favoriteCategories: [],
            preferredLanguage: locale,
            username: '',
            originalUsername: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: '',
            photoURL: currentUser.photoURL || '',
            timezone: 'UTC+00:00'
          });
        }
        
        // Get user stats
        const quizzesRef = ref(db, 'quizzes');
        const quizzesSnapshot = await get(quizzesRef);
        const resultsRef = ref(db, 'quiz_results');
        const resultsSnapshot = await get(resultsRef);
        
        let quizzesCreated = 0;
        let quizzesTaken = 0;
        let totalScore = 0;
        
        if (quizzesSnapshot.exists()) {
          const quizzesData = quizzesSnapshot.val();
          quizzesCreated = Object.values(quizzesData).filter(quiz => quiz.authorId === currentUser.uid).length;
        }
        
        if (resultsSnapshot.exists()) {
          const resultsData = resultsSnapshot.val();
          const userResults = Object.values(resultsData).filter(result => result.userId === currentUser.uid);
          quizzesTaken = userResults.length;
          
          if (quizzesTaken > 0) {
            totalScore = userResults.reduce((total, result) => {
              return total + (result.score / result.totalQuestions) * 100;
            }, 0);
          }
        }
        
        setStats({
          quizzesCreated,
          quizzesTaken,
          averageScore: quizzesTaken > 0 ? totalScore / quizzesTaken : 0,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load your profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, router, locale]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setProfile(prev => {
      const categories = [...prev.favoriteCategories];
      
      if (categories.includes(category)) {
        return {
          ...prev,
          favoriteCategories: categories.filter(cat => cat !== category)
        };
      } else {
        return {
          ...prev,
          favoriteCategories: [...categories, category]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess(false);
    
    try {
      // Validate username (required, unique, max 20 chars)
      if (!profile.username) {
        setError(t('profile.usernameRequired'));
        setUpdateLoading(false);
        return;
      }
      
      if (profile.username.length > 20) {
        setError(t('profile.usernameTooLong'));
        setUpdateLoading(false);
        return;
      }
      
      // Check for username uniqueness (only if username changed)
      if (profile.username !== profile.originalUsername) {
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          const userExists = Object.values(users).some(
            user => user.username === profile.username && user.uid !== currentUser.uid
          );
          
          if (userExists) {
            setError(t('profile.usernameAlreadyExists'));
            setUpdateLoading(false);
            return;
          }
        }
      }
      
      // Update display name
      if (profile.displayName !== currentUser.displayName) {
        await updateUserProfile(currentUser, { displayName: profile.displayName });
      }
      
      // Update profile data in Firebase
      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, {
        bio: profile.bio,
        favoriteCategories: profile.favoriteCategories,
        preferredLanguage: profile.preferredLanguage,
        username: profile.username,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        photoURL: profile.photoURL,
        timezone: profile.timezone
      });
      
      // Update language if it changed
      if (profile.preferredLanguage !== locale) {
        changeLanguage(profile.preferredLanguage);
      }
      
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update your profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('profile.yourProfile')}</h1>
        
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {t('profile.profileUpdated')}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={profile.displayName}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                    />
                  ) : (
                    profile.displayName || 'User'
                  )}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('profile.editProfile')}
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={updateLoading}
                  >
                    {updateLoading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {t('profile.saveChanges')}
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                {/* Username field (required) */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.username') || 'Username'} <span className="text-red-500">*</span></h3>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                        maxLength={20}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                        placeholder={t('profile.enterUsername') || 'Enter username'}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('profile.usernameMaxLength') || 'Maximum 20 characters'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.username || t('profile.noUsername') || 'No username set'}
                    </p>
                  )}
                </div>
                
                {/* Profile Picture (disabled upload for now) */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.profilePicture') || 'Profile Picture'}</h3>
                  <div className="flex items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                      {profile.photoURL ? (
                        <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-400">{profile.displayName?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    {isEditing && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('profile.profilePictureUploadDisabled') || 'Profile picture upload will be available soon.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Phone Number field */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.phoneNumber') || 'Phone Number'}</h3>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                      placeholder={t('profile.enterPhoneNumber') || 'Enter phone number'}
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.phoneNumber || t('profile.noPhoneNumber') || 'No phone number added'}
                    </p>
                  )}
                </div>
                
                {/* Address field */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.address') || 'Address'}</h3>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-lg"
                      placeholder={t('profile.enterAddress') || 'Enter address'}
                    ></textarea>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.address || t('profile.noAddress') || 'No address added'}
                    </p>
                  )}
                </div>
                
                {/* Date of Birth field */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.dateOfBirth') || 'Date of Birth'}</h3>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.dateOfBirth || t('profile.noDateOfBirth') || 'No date of birth added'}
                    </p>
                  )}
                </div>
                
                {/* Timezone field */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.timezone') || 'Timezone'}</h3>
                  {isEditing ? (
                    <select
                      name="timezone"
                      value={profile.timezone}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                    >
                      <option value="UTC-12:00">UTC-12:00 (Baker Island, Howland Island)</option>
                      <option value="UTC-11:00">UTC-11:00 (American Samoa, Niue)</option>
                      <option value="UTC-10:00">UTC-10:00 (Hawaii, Tahiti)</option>
                      <option value="UTC-09:00">UTC-09:00 (Alaska, Gambier Islands)</option>
                      <option value="UTC-08:00">UTC-08:00 (Los Angeles, Vancouver, Tijuana)</option>
                      <option value="UTC-07:00">UTC-07:00 (Denver, Edmonton, Phoenix)</option>
                      <option value="UTC-06:00">UTC-06:00 (Chicago, Mexico City, Winnipeg)</option>
                      <option value="UTC-05:00">UTC-05:00 (New York, Toronto, Bogota)</option>
                      <option value="UTC-04:00">UTC-04:00 (Halifax, Caracas, Santiago)</option>
                      <option value="UTC-03:00">UTC-03:00 (São Paulo, Buenos Aires, Montevideo)</option>
                      <option value="UTC-02:00">UTC-02:00 (South Georgia Island)</option>
                      <option value="UTC-01:00">UTC-01:00 (Azores, Cape Verde)</option>
                      <option value="UTC+00:00">UTC+00:00 (London, Lisbon, Dakar)</option>
                      <option value="UTC+01:00">UTC+01:00 (Berlin, Paris, Rome, Madrid)</option>
                      <option value="UTC+02:00">UTC+02:00 (Cairo, Athens, Johannesburg)</option>
                      <option value="UTC+03:00">UTC+03:00 (Moscow, Istanbul, Riyadh)</option>
                      <option value="UTC+04:00">UTC+04:00 (Dubai, Baku, Tbilisi)</option>
                      <option value="UTC+05:00">UTC+05:00 (Karachi, Tashkent, Yekaterinburg)</option>
                      <option value="UTC+05:30">UTC+05:30 (New Delhi, Mumbai, Colombo)</option>
                      <option value="UTC+06:00">UTC+06:00 (Dhaka, Almaty, Omsk)</option>
                      <option value="UTC+07:00">UTC+07:00 (Bangkok, Jakarta, Hanoi)</option>
                      <option value="UTC+08:00">UTC+08:00 (Beijing, Singapore, Hong Kong)</option>
                      <option value="UTC+09:00">UTC+09:00 (Tokyo, Seoul, Pyongyang)</option>
                      <option value="UTC+09:30">UTC+09:30 (Adelaide, Darwin)</option>
                      <option value="UTC+10:00">UTC+10:00 (Sydney, Melbourne, Brisbane)</option>
                      <option value="UTC+11:00">UTC+11:00 (Noumea, Solomon Islands)</option>
                      <option value="UTC+12:00">UTC+12:00 (Auckland, Fiji, Marshall Islands)</option>
                      <option value="UTC+13:00">UTC+13:00 (Samoa, Tonga, Kiribati)</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.timezone || 'UTC+00:00'}
                    </p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t('profile.bio')}</h3>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full"
                      placeholder={t('profile.tellAboutYourself')}
                    ></textarea>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile.bio || t('profile.noBio')}
                    </p>
                  )}
                </div>
                
                {/* Language Preference Section */}
                {isEditing && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{t('profile.languagePreference')}</h3>
                    <select
                      name="preferredLanguage"
                      value={profile.preferredLanguage}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full max-w-sm"
                      aria-label={t('profile.selectLanguage')}
                    >
                      {languageOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('profile.selectLanguage')}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('profile.favoriteCategories')}</h3>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            profile.favoriteCategories.includes(category)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteCategories.length > 0 ? (
                        profile.favoriteCategories.map(category => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('profile.noFavoriteCategories')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('profile.stats')}</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.quizzesTaken')}</p>
                    <p className="text-xl font-semibold">{stats.quizzesTaken}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.quizzesCreated')}</p>
                    <p className="text-xl font-semibold">{stats.quizzesCreated}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.averageScore')}</p>
                    <p className="text-xl font-semibold">{Math.round(stats.averageScore)}%</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Link
                      href={`/${locale}/statistics`}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center"
                    >
                      {t('profile.viewDetailedStats')} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="text-lg font-semibold">{t('profile.quickLinks')}</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/dashboard/my-quizzes`}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('profile.myQuizzes')}
                </Link>
                <Link
                  href={`/${locale}/dashboard/my-results`}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('profile.myResults')}
                </Link>
                <Link
                  href={`/${locale}/create-quiz`}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t('profile.createNewQuiz')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}