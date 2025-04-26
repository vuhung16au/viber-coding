import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';

/**
 * Custom hook to check if the current user is an admin
 * Makes a server-side API call to check the isAdmin flag in Firebase
 * @returns {boolean} isAdmin - Whether the current user is an admin
 * @returns {boolean} isLoading - Whether the admin check is in progress
 */
export function useIsAdmin() {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      setIsLoading(true);
      
      if (!currentUser) {
        console.log('No current user, setting admin status to false');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Log the current user ID for debugging
      console.log('Checking admin status for user:', currentUser.uid);
      console.log('User email:', currentUser.email);

      try {
        console.log('Sending request to check-admin API...');
        const response = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser.uid }),
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to check admin status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Admin status API response:', data);
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [currentUser]);

  return { isAdmin, isLoading };
}