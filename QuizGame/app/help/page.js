'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Get the user's preferred language from localStorage or default to 'en'
    const preferredLanguage = typeof window !== 'undefined' 
      ? localStorage.getItem('language') || 'en' 
      : 'en';
      
    // Redirect to the language-specific help page
    router.replace(`/${preferredLanguage}/help`);
  }, [router]);
  
  // Return a loading state while redirecting
  return <div className="p-8 text-center">Loading...</div>;
}