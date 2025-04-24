'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/auth';
import { useRouter } from 'next/navigation';
import { ref, get, set, update, remove } from 'firebase/database';
import { db } from '../../firebase/config';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import QuizResults from '../QuizResults';

export default function UserProfile() {
  const { currentUser, updateUserProfile, deleteUserAccount, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    username: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    bio: '',
    timezone: '',
    language: 'English',
    photoURL: currentUser?.photoURL || '',
    showPublicResults: false,
    isPublic: true,
    _originalUsername: '', // To track username changes
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(currentUser?.photoURL || '');
  const [loading, setLoading] = useState(true); // Start with loading to show spinner initially
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(true); // Disable upload functionality as required
  
  // User data states
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    totalQuizzesCreated: 0,
    averageScore: 0,
    highestScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
  });
  
  // Fetch user profile data from Firebase
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (currentUser?.uid) {
          // Reference to the user profile in the database
          const userProfileRef = ref(db, `users/${currentUser.uid}/profile`);
          const snapshot = await get(userProfileRef);
          
          if (snapshot.exists()) {
            const profileData = snapshot.val();
            setUserProfile(prevProfile => ({
              ...prevProfile,
              ...profileData,
              displayName: currentUser.displayName || profileData.displayName || '',
              email: currentUser.email || profileData.email || '',
              photoURL: currentUser.photoURL || profileData.photoURL || '',
              // Add any missing fields with default values
              phoneNumber: profileData.phoneNumber || '',
              address: profileData.address || '',
              dateOfBirth: profileData.dateOfBirth || '',
              timezone: profileData.timezone || '',
              // Store the original username to compare for changes later
              _originalUsername: profileData.username || '',
            }));
            
            if (profileData.photoURL) {
              setImagePreview(profileData.photoURL);
            }
          } else {
            // If profile doesn't exist yet, create it with default values
            await set(userProfileRef, {
              displayName: currentUser.displayName || '',
              email: currentUser.email,
              username: '',
              phoneNumber: '',
              address: '',
              dateOfBirth: '',
              bio: '',
              timezone: '',
              language: 'English',
              photoURL: currentUser.photoURL || '',
              isPublic: true,
              showPublicResults: false,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage({ text: 'Error loading profile data.', type: 'error' });
      } finally {
        // Always reset loading state when done
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchUserProfile();
    } else {
      // If no user is logged in, reset loading state
      setLoading(false);
    }
  }, [currentUser]);
  
  // Fetch user's quizzes
  useEffect(() => {
    const fetchUserQuizzes = async () => {
      if (!currentUser?.uid) return;
      
      try {
        // Fetch quizzes created by the user
        const userQuizzesRef = ref(db, 'quizzes');
        const snapshot = await get(userQuizzesRef);
        
        if (snapshot.exists()) {
          const quizzesData = snapshot.val();
          const quizzesArray = Object.keys(quizzesData)
            .map(key => ({
              id: key,
              ...quizzesData[key]
            }))
            .filter(quiz => quiz.createdBy === currentUser.uid);
          
          setUserQuizzes(quizzesArray);
        }
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
      }
    };
    
    fetchUserQuizzes();
  }, [currentUser]);
  
  // Fetch user's quiz results and history
  useEffect(() => {
    const fetchUserQuizResults = async () => {
      if (!currentUser?.uid) return;
      
      try {
        // First check if we have pre-calculated statistics in the database
        const statsRef = ref(db, `users/${currentUser.uid}/statistics`);
        const statsSnapshot = await get(statsRef);
        
        if (statsSnapshot.exists()) {
          // If we have stored statistics, use them first
          setStats(statsSnapshot.val());
        }
        
        // Fetch results from both locations in the database
        // 1. Check in the user's results node
        const userResultsRef = ref(db, `users/${currentUser.uid}/results`);
        const userResultsSnapshot = await get(userResultsRef);
        
        // 2. Check in the global quizResults collection where userId matches
        const quizResultsRef = ref(db, `quizResults`);
        const quizResultsSnapshot = await get(quizResultsRef);
        
        let resultsArray = [];
        
        // Process results from user's results node
        if (userResultsSnapshot.exists()) {
          const userResultsData = userResultsSnapshot.val();
          const userResultsArray = Object.keys(userResultsData).map(key => ({
            id: key,
            ...userResultsData[key]
          }));
          resultsArray = [...resultsArray, ...userResultsArray];
        }
        
        // Process results from global quizResults collection
        if (quizResultsSnapshot.exists()) {
          const allQuizResults = quizResultsSnapshot.val();
          const userQuizResults = Object.keys(allQuizResults)
            .filter(key => allQuizResults[key].userId === currentUser.uid)
            .map(key => ({
              id: key,
              ...allQuizResults[key]
            }));
          
          // Merge with existing results, avoiding duplicates
          userQuizResults.forEach(result => {
            if (!resultsArray.some(r => r.id === result.id)) {
              resultsArray.push(result);
            }
          });
        }
        
        // Set quiz results and history
        setQuizResults(resultsArray);
        setQuizHistory(resultsArray);
        
        // Calculate stats if we have results
        if (resultsArray.length > 0) {
          const totalQuizzes = resultsArray.length;
          const totalScore = resultsArray.reduce((sum, result) => sum + (result.score || 0), 0);
          const averageScore = totalScore / totalQuizzes;
          const highestScore = Math.max(...resultsArray.map(result => result.score || 0));
          
          const totalQuestions = resultsArray.reduce((sum, result) => sum + (result.totalQuestions || 0), 0);
          const correctAnswers = resultsArray.reduce((sum, result) => sum + (result.correctAnswers || 0), 0);
          const incorrectAnswers = totalQuestions - correctAnswers;
          const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
          
          // Create statistics object
          const userStats = {
            totalQuizzesTaken: totalQuizzes,
            totalQuizzesCreated: userQuizzes.length,
            averageScore,
            highestScore,
            totalQuestionsAnswered: totalQuestions,
            correctAnswers,
            incorrectAnswers,
            accuracy,
            lastUpdated: new Date().toISOString()
          };
          
          setStats(userStats);
          
          // Store the statistics in the database
          updateUserStatistics(userStats);
        }
      } catch (error) {
        console.error('Error fetching user quiz results:', error);
      }
    };
    
    fetchUserQuizResults();
  }, [currentUser, userQuizzes]);
  
  // Update user statistics in the database
  const updateUserStatistics = async (statsData) => {
    if (!currentUser?.uid) return;
    
    try {
      // Update statistics in the database
      const statsRef = ref(db, `users/${currentUser.uid}/statistics`);
      await update(statsRef, statsData);
    } catch (error) {
      console.error('Error updating user statistics:', error);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value
    });
  };
  
  // Check if username is available
  const checkUsernameAvailability = async () => {
    const username = userProfile.username.trim();
    
    if (!username) return;
    
    // Don't check if the username hasn't changed from what's already saved
    if (username === userProfile._originalUsername) {
      return;
    }
    
    // Validate username format
    if (username.length > 20) {
      setIsUsernameAvailable(false);
      setMessage({ text: 'Username must be 20 characters or less', type: 'error' });
      return;
    }
    
    setUsernameChecking(true);
    
    try {
      // Check if the username exists in the database
      const usernamesRef = ref(db, 'usernames');
      const snapshot = await get(usernamesRef);
      
      if (snapshot.exists()) {
        const usernames = snapshot.val();
        // Check if the username exists and doesn't belong to the current user
        const isUsernameExists = usernames[username] && usernames[username] !== currentUser.uid;
        setIsUsernameAvailable(!isUsernameExists);
        
        if (isUsernameExists) {
          setMessage({ text: 'This username is already taken. Please choose another one.', type: 'error' });
        }
      } else {
        // No usernames exist in the database yet, so it's available
        setIsUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      // In case of error, assume it's available and let the server handle validation
      setIsUsernameAvailable(true);
    } finally {
      setUsernameChecking(false);
    }
  };
  
  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Show a message that upload functionality is disabled
      setMessage({ 
        text: 'Profile image upload is currently disabled. Image preview is shown, but the image will not be saved.',
        type: 'info' 
      });
    }
  };
  
  // Save user profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Validate username
      const username = userProfile.username.trim();
      if (!username) {
        throw new Error('Username is required');
      }
      
      // Only check username availability if it has changed
      if (username !== userProfile._originalUsername) {
        // Check username availability again before submitting
        setUsernameChecking(true);
        const usernamesRef = ref(db, 'usernames');
        const snapshot = await get(usernamesRef);
        
        if (snapshot.exists()) {
          const usernames = snapshot.val();
          const isUsernameExists = usernames[username] && usernames[username] !== currentUser.uid;
          
          if (isUsernameExists) {
            setIsUsernameAvailable(false);
            throw new Error('This username is already taken. Please choose another one.');
          }
        }
        setUsernameChecking(false);
      }
      
      // Update profile object
      const profileData = { ...userProfile };
      delete profileData.email; // Email changes require separate flow with re-authentication
      delete profileData._originalUsername; // Remove the internal tracking property
      
      // NOTE: Actual image upload is disabled, but left code structure for future implementation
      if (profileImage && !uploadDisabled) {
        // This code block will not execute while uploadDisabled is true
        const storage = getStorage();
        const imageRef = storageRef(storage, `profile-images/${currentUser.uid}`);
        
        // Upload the image
        await uploadBytes(imageRef, profileImage);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(imageRef);
        
        // Update the profile data with the new image URL
        profileData.photoURL = downloadURL;
        
        // Update Firebase Auth profile
        await updateUserProfile(currentUser, {
          displayName: profileData.displayName,
          photoURL: downloadURL
        });
      } else {
        // Update Firebase Auth profile without changing photo
        await updateUserProfile(currentUser, {
          displayName: profileData.displayName
        });
      }
      
      // Update user profile in Realtime Database
      const userProfileRef = ref(db, `users/${currentUser.uid}/profile`);
      await update(userProfileRef, profileData);
      
      // Update usernames registry if username changed
      if (username !== userProfile._originalUsername) {
        const usernamesRef = ref(db, 'usernames');
        
        // Get current usernames data
        const snapshot = await get(usernamesRef);
        const usernames = snapshot.exists() ? snapshot.val() : {};
        
        // Remove the old username if it exists and belongs to the current user
        if (userProfile._originalUsername && usernames[userProfile._originalUsername] === currentUser.uid) {
          delete usernames[userProfile._originalUsername];
        }
        
        // Add the new username
        usernames[username] = currentUser.uid;
        
        // Update the usernames registry
        await set(usernamesRef, usernames);
        
        // Update the original username value in the state for future comparisons
        setUserProfile(prev => ({
          ...prev,
          _originalUsername: username
        }));
      }
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: `Error updating profile: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user account
  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Delete user profile data from Realtime Database
      const userDataRef = ref(db, `users/${currentUser.uid}`);
      await remove(userDataRef);
      
      // Delete profile image if exists
      if (userProfile.photoURL) {
        try {
          const storage = getStorage();
          const imageRef = storageRef(storage, `profile-images/${currentUser.uid}`);
          await deleteObject(imageRef);
        } catch (imageError) {
          console.error('Error deleting profile image:', imageError);
          // Continue with account deletion even if image deletion fails
        }
      }
      
      // Delete user authentication account
      await deleteUserAccount(currentUser);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ text: `Error deleting account: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };
  
  return (
    <div>
      {/* Navigation tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('profile')}
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
              onClick={() => setActiveTab('quizzes')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'quizzes'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              My Quizzes
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'results'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Quiz Results
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('stats')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          </li>
        </ul>
      </div>
      
      {/* Status message */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div>
          {/* Navigation links */}
          <div className="mb-8 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link href={`/${userProfile.username}/profile`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Public Profile
              </Link>
              <Link href="/profile" className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Private Profile
              </Link>
              <Link href={`/${userProfile.username}/quiz`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Public Quizzes
              </Link>
              <Link href={`/${userProfile.username}/quiz-results`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                My Quiz Results
              </Link>
              <Link href={`/${userProfile.username}/statistics`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                My Statistics
              </Link>
              <Link href={`/${userProfile.username}/quiz-history`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Quiz History
              </Link>
              <Link href={`/${userProfile.username}/quiz-leaderboard`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Quiz Leaderboard
              </Link>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-3">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    id="profile-image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to change your profile picture
              </p>
            </div>
            
            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={userProfile.displayName}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email* <span className="text-xs text-gray-500">(unique identifier)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userProfile.email}
                  disabled
                  className="block w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email is your unique account identifier and cannot be changed
                </p>
              </div>
            </div>
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username* <span className="text-xs text-gray-500">(max 20 characters)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userProfile.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 20) {
                      handleInputChange(e);
                      // Reset username availability when typing
                      if (value !== userProfile.username) {
                        setIsUsernameAvailable(true);
                      }
                    }
                  }}
                  onBlur={checkUsernameAvailability}
                  required
                  maxLength={20}
                  className={`block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border ${
                    !isUsernameAvailable && userProfile.username 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {usernameChecking && (
                  <span className="absolute right-3 top-3 text-gray-500">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                {!isUsernameAvailable && userProfile.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    This username is already taken. Please choose another one.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Username must be unique and will be visible to other users
                </p>
              </div>
            </div>
            
            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={userProfile.phoneNumber}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={userProfile.dateOfBirth}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={userProfile.address}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={userProfile.bio}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={userProfile.timezone}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Timezone</option>
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
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={userProfile.language}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Russian">Russian</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={userProfile.isPublic}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          isPublic: e.target.checked
                        });
                      }}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isPublic" className="font-medium text-gray-700 dark:text-gray-300">Public Profile</label>
                    <p className="text-gray-500 dark:text-gray-400">Make your profile visible to others</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="showPublicResults"
                      name="showPublicResults"
                      type="checkbox"
                      checked={userProfile.showPublicResults}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          showPublicResults: e.target.checked
                        });
                      }}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="showPublicResults" className="font-medium text-gray-700 dark:text-gray-300">Public Quiz Results</label>
                    <p className="text-gray-500 dark:text-gray-400">Allow others to see your quiz results and statistics</p>
                  </div>
                </div>
                
                {userProfile.username && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                    <p className="text-sm">
                      Your public profile is available at:{' '}
                      <a 
                        href={`/${userProfile.username}/profile`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        {`http://localhost:3002/${userProfile.username}/profile`}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* My Quizzes tab */}
      {activeTab === 'quizzes' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Quizzes</h2>
          
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
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any quizzes yet.</p>
              <Link href="/create-quiz" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Create Your First Quiz
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Quiz Results tab */}
      {activeTab === 'results' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
          
          {quizResults.length > 0 ? (
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
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't completed any quizzes yet.</p>
              <Link href="/quizzes" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Browse Quizzes
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Statistics tab */}
      {activeTab === 'stats' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quiz Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-gray-600 dark:text-gray-400 mb-2">Quizzes Taken</h3>
              <p className="text-3xl font-bold">{stats.totalQuizzesTaken}</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-gray-600 dark:text-gray-400 mb-2">Quizzes Created</h3>
              <p className="text-3xl font-bold">{stats.totalQuizzesCreated}</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-gray-600 dark:text-gray-400 mb-2">Average Score</h3>
              <p className="text-3xl font-bold">{stats.averageScore ? stats.averageScore.toFixed(1) : 0}%</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-gray-600 dark:text-gray-400 mb-2">Highest Score</h3>
              <p className="text-3xl font-bold">{stats.highestScore || 0}%</p>
            </div>
            
            {stats.totalQuizzesTaken > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 md:col-span-2">
                <h3 className="text-gray-600 dark:text-gray-400 mb-2">Questions</h3>
                <div className="flex items-center mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-l-full" 
                      style={{ width: `${stats.accuracy || 0}%` }}
                    ></div>
                  </div>
                  <div className="ml-4 text-sm">
                    <span className="text-green-500 font-medium">{stats.correctAnswers || 0}</span> correct / 
                    <span className="text-red-500 font-medium"> {stats.incorrectAnswers || 0}</span> incorrect
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {stats.totalQuizzesTaken === 0 && stats.totalQuizzesCreated === 0 && (
            <div className="text-center py-8 mt-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Take or create quizzes to see your statistics.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/quizzes" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Browse Quizzes
                </Link>
                <Link href="/create-quiz" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Create Quiz
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">Delete Account</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}