'use client';

import { useAuth } from '../firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserProfile from '../components/auth/UserProfile';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  
  // If not logged in, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);
  
  // Fetch the user's username if authenticated
  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser?.uid) {
        const userProfileRef = ref(db, `users/${currentUser.uid}/profile`);
        const snapshot = await get(userProfileRef);
        
        if (snapshot.exists()) {
          const profileData = snapshot.val();
          if (profileData.username) {
            setUsername(profileData.username);
          }
        }
      }
    };
    
    fetchUsername();
  }, [currentUser]);

  if (!currentUser) {
    return null; // Don't render anything while checking auth status
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <main className="max-w-6xl mx-auto">
        {username && (
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
              Private Profile
            </h1>
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/${username}/profile`}
                className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <UserProfile />
        </div>
      </main>
    </div>
  );
}