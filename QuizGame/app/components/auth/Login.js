'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, loginWithFacebook, loginWithMicrosoft, loginWithApple, loginWithOpenID, loginWithGithub, currentUser } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('Failed to sign in with Google: ' + error.message);
      }
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for other SSO providers
  const handleFacebookLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithFacebook();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with Facebook: ' + error.message);
      console.error('Facebook sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithMicrosoft();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with Microsoft: ' + error.message);
      console.error('Microsoft sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithApple();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with Apple ID: ' + error.message);
      console.error('Apple sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIDLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithOpenID();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with OpenID: ' + error.message);
      console.error('OpenID sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGithub();
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with Github: ' + error.message);
      console.error('Github sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Log In to Your Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in with your social account.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,15.64 17.01,17.37 14.96,18.24C13.54,18.83 11.82,19.03 10.21,18.63C7.94,18.05 6.08,16.34 5.35,14.12C4.8,12.36 4.94,10.37 5.69,8.71C6.42,7.12 7.89,5.82 9.65,5.25C11.01,4.83 12.5,4.96 13.76,5.41C14.76,5.78 15.63,6.43 16.33,7.21L18.24,5.25C16.55,3.6 14.15,2.61 11.67,2.75C9.45,2.79 7.25,3.62 5.53,5.13C3.05,7.25 1.73,10.59 2.03,13.95C2.28,16.75 3.87,19.4 6.21,21.04C8.28,22.47 10.94,23.12 13.53,22.95C16.42,22.77 19.14,21.24 20.69,18.67C21.85,16.81 22.38,14.5 22.1,12.21C22.08,11.85 21.73,11.1 21.35,11.1Z" /></svg>
            Sign in with Google
          </button>
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 5 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 17 22 12z" /></svg>
            Sign in with Facebook
          </button>
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><rect fill="#F25022" x="2" y="2" width="9" height="9"/><rect fill="#7FBA00" x="13" y="2" width="9" height="9"/><rect fill="#00A4EF" x="2" y="13" width="9" height="9"/><rect fill="#FFB900" x="13" y="13" width="9" height="9"/></svg>
            Sign in with Microsoft
          </button>
          <button
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.09-1.09.94-2.06 2.07-2.06.04 0 .08 0 .12.01zm3.97 6.86c-1.1-1.32-2.82-1.48-3.54-1.48-.1 0-.19.01-.27.01-.77.03-1.5.44-2.01.44-.51 0-1.3-.43-2.14-.43-.82 0-1.7.47-2.24 1.28-1.54 2.23-.39 5.54 1.1 7.36.51.62 1.12 1.32 1.92 1.29.77-.03 1.06-.42 2-.42.94 0 1.2.42 2.01.41.82-.01 1.34-.63 1.85-1.25.59-.7.83-1.38.84-1.41-.02-.01-1.61-.62-1.63-2.45-.01-1.53 1.25-2.23 1.31-2.27-.72-1.05-1.84-1.17-2.23-1.18zm-3.97 13.13c-.01 0-.02 0-.03 0-.36 0-.71-.13-1.01-.36-.29-.22-.54-.53-.74-.91-.2-.38-.31-.8-.31-1.23 0-.43.11-.85.31-1.23.2-.38.45-.69.74-.91.3-.23.65-.36 1.01-.36.01 0 .02 0 .03 0 .36 0 .71.13 1.01.36.29.22.54.53.74.91.2.38.31.8.31 1.23 0 .43-.11.85-.31 1.23-.2.38-.45.69-.74.91-.3.23-.65.36-1.01.36z"/></svg>
            Sign in with Apple ID
          </button>
          <button
            onClick={handleOpenIDLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-2.07c-3.39-.86-6-3.99-6-7.73 0-4.42 3.58-8 8-8s8 3.58 8 8c0 3.74-2.61 6.87-6 7.73v2.07c4.56-.93 8-4.96 8-9.8 0-5.52-4.48-10-10-10z"/></svg>
            Sign in with OpenID
          </button>
          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.12 2.51.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>
            Sign in with Github
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}