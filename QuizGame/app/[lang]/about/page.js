'use client';

import { useLanguage } from '../../context/LanguageContext';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          {t('about.title')}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('about.ourMission')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.missionText')}</p>
          </section>
          
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('about.ourStory')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.storyText')}</p>
          </section>
          
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('about.ourTeam')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.teamText')}</p>
          </section>
          
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('about.contactUs')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.contactText')}</p>
            <div className="mt-6">
              <button 
                onClick={() => router.push('/contact')} 
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('about.contactButton') || 'Get in Touch'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}