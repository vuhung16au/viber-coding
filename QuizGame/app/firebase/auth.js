'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth, db } from './config';
import { ref, get, set, update } from 'firebase/database';

// Create an authentication context
const AuthContext = createContext();

// Custom hook to use the authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap the application with auth functionality
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user with email and password
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google using popup method
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // After successful Google login, sync the user profile data to database
      if (result.user) {
        await syncUserProfileToDatabase(result.user);
      }
      
      return result;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Sync user profile to database
  const syncUserProfileToDatabase = async (user) => {
    if (!user) return;
    
    try {
      // Check if user profile exists
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        // Update existing profile
        await update(userRef, {
          displayName: user.displayName || '',
          email: user.email,
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        });
      } else {
        // Create new profile
        await set(userRef, {
          displayName: user.displayName || '',
          email: user.email,
          photoURL: user.photoURL || '',
          username: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }
      
      // Also create the profile sub-object with photoURL if it doesn't exist
      const profileRef = ref(db, `users/${user.uid}/profile`);
      const profileSnapshot = await get(profileRef);
      
      if (!profileSnapshot.exists() && user.photoURL) {
        await set(profileRef, {
          photoURL: user.photoURL,
          displayName: user.displayName || ''
        });
      } else if (profileSnapshot.exists() && user.photoURL) {
        // Update the photoURL in the profile
        await update(profileRef, {
          photoURL: user.photoURL
        });
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  // Sign out the current user
  const logout = () => {
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateUserProfile = async (user, data) => {
    try {
      // First update Firebase Auth profile
      await updateProfile(user, data);
      
      // Then sync to database
      if (data.photoURL || data.displayName) {
        const userRef = ref(db, `users/${user.uid}`);
        const updateData = {};
        
        if (data.photoURL) updateData.photoURL = data.photoURL;
        if (data.displayName) updateData.displayName = data.displayName;
        
        await update(userRef, updateData);
        
        // Also update in profile subfolder
        const profileRef = ref(db, `users/${user.uid}/profile`);
        await update(profileRef, updateData);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Delete user account
  const deleteUserAccount = (user) => {
    return deleteUser(user);
  };

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If user is logged in, sync their profile data to database
      if (user) {
        await syncUserProfileToDatabase(user);
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  // Create a value object with all authentication functions
  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    deleteUserAccount,
    syncUserProfileToDatabase
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};