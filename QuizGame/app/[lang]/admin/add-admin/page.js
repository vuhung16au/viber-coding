'use client';

import { useState } from 'react';
import { useAuth } from '../../../firebase/auth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { setUserAdminStatus } from '../../../firebase/database';

export default function AddAdminPage() {
  const { currentUser } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Self-admin option (make yourself an admin)
  const handleSetSelfAdmin = async () => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    setMessage('');
    
    try {
      console.log('Setting self as admin with ID:', currentUser.uid);
      await setUserAdminStatus(currentUser.uid, true);
      setMessage(`Successfully set yourself (${currentUser.email}) as admin. You may need to refresh the page.`);
    } catch (error) {
      console.error('Error setting self as admin:', error);
      setMessage(`Error setting admin status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Set admin for another user by ID
  const handleSubmitById = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      await setUserAdminStatus(userId, status);
      setMessage(`Successfully ${status ? 'set' : 'removed'} admin status for user ID: ${userId}`);
      setUserId('');
    } catch (error) {
      console.error('Error setting admin status:', error);
      setMessage(`Error setting admin status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Simple form for email display (not functional yet - would require backend email lookup)
  const handleSubmitByEmail = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    setMessage('Email lookup not implemented in this demo. Please use User ID instead.');
    setIsUpdating(false);
  };

  if (!currentUser) {
    return <div className="container mx-auto p-4">Please login to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="mb-4">
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>User ID:</strong> {currentUser.uid}</p>
          <p><strong>Admin Status:</strong> {isAdminLoading ? 'Loading...' : (isAdmin ? 'Yes' : 'No')}</p>
        </div>
        
        <button
          onClick={handleSetSelfAdmin}
          disabled={isUpdating || (isAdmin && !isAdminLoading)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isAdmin ? 'You are already an admin' : 'Make yourself an admin'}
        </button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Set Admin by User ID</h2>
        <form onSubmit={handleSubmitById} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block mb-1">User ID:</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border rounded px-3 py-2 w-full dark:bg-gray-700"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Admin Status:</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={status === true}
                  onChange={() => setStatus(true)}
                  className="mr-2"
                />
                Admin
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={status === false}
                  onChange={() => setStatus(false)}
                  className="mr-2"
                />
                Not Admin
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isUpdating || !userId}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Admin Status'}
          </button>
        </form>
      </div>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}
    </div>
  );
}