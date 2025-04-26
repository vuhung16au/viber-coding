'use client';

import { useState } from 'react';
import { useAuth } from '../../../firebase/auth';
import { migrateQuizTimeouts } from '../../../firebase/database';

export default function MigrationsPage() {
  const { currentUser, isAdmin } = useAuth();
  const [migrationResult, setMigrationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Run the quiz timeout migration
  const handleMigrateQuizTimeouts = async () => {
    if (!currentUser || !isAdmin) {
      setMigrationResult({
        success: false,
        message: 'Unauthorized. Only administrators can run migrations.'
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await migrateQuizTimeouts();
      setMigrationResult(result);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        message: `Error running migration: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Admin Access Required</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please sign in with an administrator account to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Admin Access Required</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You don't have permission to access this page. Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Admin Migrations</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quiz Timeout Migration</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This migration will add a default timeout of 20 seconds to all quizzes that do not have a timeout value set.
        </p>
        <button
          onClick={handleMigrateQuizTimeouts}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium transition-colors`}
        >
          {isLoading ? 'Running Migration...' : 'Run Migration'}
        </button>
        
        {migrationResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            migrationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-medium">{migrationResult.success ? 'Success!' : 'Error'}</p>
            <p>{migrationResult.message}</p>
            {migrationResult.updated !== undefined && (
              <p className="mt-2">Updated {migrationResult.updated} quizzes.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}