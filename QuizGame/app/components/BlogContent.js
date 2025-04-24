'use client';

import { useLanguage } from '../context/LanguageContext';

export default function BlogContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-lg text-center mb-8 text-gray-600 dark:text-gray-400">
        {t?.blog?.subtitle || "Latest updates, insights, and news from our quiz platform"}
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <img 
            src="/images/default-quiz.jpg" 
            alt="Blog post thumbnail" 
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {t?.blog?.post1?.date || "April 20, 2025"}
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t?.blog?.post1?.title || "10 Tips for Creating Engaging Quizzes"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t?.blog?.post1?.excerpt || 
                "Learn how to create quizzes that keep your audience coming back for more. These proven strategies will help you boost engagement and retention."}
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {t?.blog?.readMore || "Read more"} →
            </a>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <img 
            src="/images/default-quiz.jpg" 
            alt="Blog post thumbnail" 
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {t?.blog?.post2?.date || "April 15, 2025"}
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t?.blog?.post2?.title || "The Psychology Behind Quiz-Taking"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t?.blog?.post2?.excerpt || 
                "Discover why quizzes are so addictive and how they tap into fundamental human psychological needs. Understanding these principles can help you design better experiences."}
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {t?.blog?.readMore || "Read more"} →
            </a>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <img 
            src="/images/default-quiz.jpg" 
            alt="Blog post thumbnail" 
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {t?.blog?.post3?.date || "April 8, 2025"}
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t?.blog?.post3?.title || "Using Quizzes for Education and Learning"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t?.blog?.post3?.excerpt || 
                "Explore how quizzes can be powerful educational tools that enhance learning and knowledge retention. Perfect for teachers, trainers, and lifelong learners."}
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {t?.blog?.readMore || "Read more"} →
            </a>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <img 
            src="/images/default-quiz.jpg" 
            alt="Blog post thumbnail" 
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {t?.blog?.post4?.date || "April 1, 2025"}
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t?.blog?.post4?.title || "The Future of Interactive Content"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t?.blog?.post4?.excerpt || 
                "What's next for quizzes and interactive content? We explore emerging trends, technologies, and how they'll shape user engagement in the coming years."}
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {t?.blog?.readMore || "Read more"} →
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {t?.blog?.loadMore || "Load More Posts"}
        </button>
      </div>
    </div>
  );
}