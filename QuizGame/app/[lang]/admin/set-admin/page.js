'use client';

import { useState } from 'react';
import { useAuth } from '../../../firebase/auth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { setUserAdminStatus } from '../../../firebase/database';

export default function SetAdminPage() {
  const { currentUser } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [userId, setUserId] = useState('VSQBF6GU7NVTtGEBrnBI1srN3l22');
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!currentUser) {
    return <div className="container mx-auto p-4">Please login to access this page.</div>;
  }

  if (isAdminLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="container mx-auto p-4">Access denied. You must be an admin.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      await setUserAdminStatus(userId, status);
      setMessage(`Successfully set admin status to ${status} for user ${userId}`);
    } catch (error) {
      console.error('Error setting admin status:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set Admin Status</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block mb-1">User ID:</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block mb-1">Admin Status:</label>
          <select
            id="status"
            value={status.toString()}
            onChange={(e) => setStatus(e.target.value === 'true')}
            className="border p-2 w-full"
          >
            <option value="true">True (Is Admin)</option>
            <option value="false">False (Not Admin)</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isUpdating}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isUpdating ? 'Updating...' : 'Update Admin Status'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${message.startsWith('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}

      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Instructions</h2>
        <p>This tool sets the <code>isAdmin</code> attribute for a user in the Firebase database.</p>
        <p className="mt-2">The user ID of <strong>VSQBF6GU7NVTtGEBrnBI1srN3l22</strong> corresponds to the user shown in the screenshot.</p>
      </div>
    </div>
  );
}