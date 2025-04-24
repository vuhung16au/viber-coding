'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the default language
  redirect('/en');
}

export function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Don't show login/signup buttons if user is logged in and redirect is in progress
  if (currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-col items-center max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
            Quiz GetItRight
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Test your knowledge with our interactive quizzes!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md font-medium text-lg"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md font-medium text-lg dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-500 dark:hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Challenging Questions</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Test your knowledge with questions across various difficulty levels.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Track Progress</h2>
            <p className="text-gray-600 dark:text-gray-300">
              See your improvement over time with detailed statistics.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Compete with Friends</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Share your scores and challenge friends to beat your record.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-indigo-50 dark:bg-indigo-900/30 p-8 rounded-xl w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="font-semibold mb-2">Create an Account</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">Sign up for free and set up your profile.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="font-semibold mb-2">Choose a Quiz</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">Select from various categories and difficulty levels.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">See your score and track your improvement.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 mb-8 text-center text-gray-500 dark:text-gray-400">
        <p>© 2025 Quiz GetItRight. All rights reserved.</p>
      </footer>
    </div>
  );
}
