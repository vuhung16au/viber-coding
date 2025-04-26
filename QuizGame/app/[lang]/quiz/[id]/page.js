'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database } from '../../../../firebase/config';
import { ref, get } from 'firebase/database';
import { generateSlug } from '../../../../utils/slug';

export default function QuizRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { id, lang } = params || {};

  useEffect(() => {
    async function redirectToSlug() {
      if (!id) return;

      try {
        // Get quiz data to generate the slug
        const quizRef = ref(database, `quizzes/${id}`);
        const snapshot = await get(quizRef);
        
        if (snapshot.exists()) {
          const quizData = snapshot.val();
          // Generate slug from quiz title or use a default
          const slug = generateSlug(quizData.title || quizData.description || 'quiz');
          
          // Redirect to the slugged version
          router.push(`/${lang}/quiz/${id}/${slug}`);
        } else {
          // If quiz doesn't exist, redirect to home page
          router.push(`/${lang}`);
        }
      } catch (error) {
        console.error('Error generating slug for redirect:', error);
        router.push(`/${lang}`);
      }
    }

    redirectToSlug();
  }, [id, lang, router]);

  // Return null since this is just a redirect component
  return null;
}