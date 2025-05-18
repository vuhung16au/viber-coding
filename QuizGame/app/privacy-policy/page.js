'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Metadata is imported automatically by Next.js App Router

// Dynamically import the content with no SSR
const PrivacyPolicyContent = dynamic(
  () => import('../components/PrivacyPolicyContent'),
  { ssr: false }
);

export default function PrivacyPolicyPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isClient ? (
        <PrivacyPolicyContent />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading privacy policy...</p>
        </div>
      )}
    </div>
  );
}