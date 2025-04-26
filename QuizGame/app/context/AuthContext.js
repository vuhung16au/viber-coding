'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase/config';
import { ref, get, update } from 'firebase/database';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user is logged in, sync their profile picture to the database
      if (user) {
        try {
          // Ensure user profile exists and has the latest photoURL
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          // Update or create the user profile with photoURL
          if (user.photoURL) {
            if (snapshot.exists()) {
              // Update existing profile with photoURL if it exists
              await update(userRef, {
                photoURL: user.photoURL
              });
            } else {
              // Create basic profile if it doesn't exist
              await update(userRef, {
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL,
                username: ''
              });
            }
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}