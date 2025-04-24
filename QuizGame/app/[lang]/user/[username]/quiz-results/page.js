'use client';

import { useParams } from 'next/navigation';
import PublicProfile from '@/app/components/profile/PublicProfile';

export default function UserPublicQuizResultsPage() {
  const { username } = useParams();
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <main className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <PublicProfile username={username} activeTab="quiz-results" />
        </div>
      </main>
    </div>
  );
}