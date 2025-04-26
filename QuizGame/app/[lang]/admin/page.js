'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../firebase/auth';
import { useIsAdmin } from '../../hooks/useIsAdmin';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // The admin password - in a real app this should be stored securely, not hardcoded
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Check if user is already authenticated via admin status
    if (isAdmin && !isAdminLoading) {
      setIsAuthenticated(true);
    }
  }, [isAdmin, isAdminLoading]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          Please login to your account before accessing the admin area.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="admin/add-admin" 
                  className="block p-6 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
              <h2 className="text-xl font-semibold mb-2">User Admin Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Add or remove admin privileges for users</p>
            </Link>
            
            <Link href="admin/categories"
                  className="block p-6 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Category Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Create, edit and manage quiz categories</p>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Access to admin features requires admin privileges. 
              If you haven't set yourself as an admin yet, please use the Admin Management page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}