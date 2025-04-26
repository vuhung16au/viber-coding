'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../firebase/auth';
import { ref, set } from 'firebase/database';
import { db } from '../../../firebase/config';

export default function FixAdminPage() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);

  const handleSetAdminStatus = async () => {
    if (!currentUser || !userId) {
      setMessage('You must be logged in to use this function');
      return;
    }

    setIsUpdating(true);
    setMessage('Setting admin status...');

    try {
      // Set admin flag in all locations
      // 1. Main path
      await set(ref(db, `users/${userId}/isAdmin`), true);
      
      // 2. Root level
      await set(ref(db, `${userId}/isAdmin`), true);
      
      // 3. Profile object
      await set(ref(db, `${userId}/profile/isAdmin`), true);
      
      // 4. Users profile path
      await set(ref(db, `users/${userId}/profile/isAdmin`), true);
      
      setMessage('Successfully set admin status! You are now an admin. Refresh the admin page to see the changes.');
    } catch (error) {
      console.error('Error setting admin status:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return <div className="container mx-auto p-4">Please login to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Fix Admin Status</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="mb-4">
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>User ID:</strong> {userId}</p>
        </div>
        
        <button
          onClick={handleSetAdminStatus}
          disabled={isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isUpdating ? 'Setting Admin Status...' : 'Force Set Admin Status'}
        </button>
        
        {message && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}