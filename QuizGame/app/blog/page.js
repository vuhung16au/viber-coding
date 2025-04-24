'use client';

import { useLanguage } from '../context/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('blog.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Sample blog posts - would normally be fetched from a database */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <img src="/images/default-quiz.jpg" alt="Blog Post" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">{t('blog.post1Title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{t('blog.publishedOn')} April 20, 2025</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('blog.post1Excerpt')}</p>
            <button className="text-blue-600 dark:text-blue-400 font-medium">{t('blog.readMore')}</button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <img src="/images/default-quiz.jpg" alt="Blog Post" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">{t('blog.post2Title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{t('blog.publishedOn')} April 15, 2025</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('blog.post2Excerpt')}</p>
            <button className="text-blue-600 dark:text-blue-400 font-medium">{t('blog.readMore')}</button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <img src="/images/default-quiz.jpg" alt="Blog Post" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">{t('blog.post3Title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{t('blog.publishedOn')} April 10, 2025</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('blog.post3Excerpt')}</p>
            <button className="text-blue-600 dark:text-blue-400 font-medium">{t('blog.readMore')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}