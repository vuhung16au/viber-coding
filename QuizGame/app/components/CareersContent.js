'use client';

import { useLanguage } from '../context/LanguageContext';

export default function CareersContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {t?.careers?.description || 
          "We're on a mission to create the world's most engaging quiz platform. Join us in building innovative solutions that help people learn and have fun!"}
      </p>
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t?.careers?.openingsTitle || "Current Openings"}
      </h2>
      
      <div className="space-y-6 mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
            {t?.careers?.position1?.title || "Senior Frontend Developer"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {t?.careers?.position1?.location || "Remote / San Francisco, CA"}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t?.careers?.position1?.description || 
              "We're looking for an experienced frontend developer with expertise in React, Next.js, and modern web technologies to help us build engaging quiz experiences."}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {t?.careers?.applyButton || "Apply Now"}
          </button>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
            {t?.careers?.position2?.title || "Backend Engineer"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {t?.careers?.position2?.location || "Remote / San Francisco, CA"}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t?.careers?.position2?.description || 
              "Join our backend team to develop scalable APIs and services that power our quiz platform. Experience with Node.js, Firebase, and cloud infrastructure required."}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {t?.careers?.applyButton || "Apply Now"}
          </button>
        </div>
        
        <div className="pb-4">
          <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
            {t?.careers?.position3?.title || "Product Designer"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {t?.careers?.position3?.location || "Remote / San Francisco, CA"}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t?.careers?.position3?.description || 
              "We're seeking a creative product designer to help shape the user experience of our quiz platform. You'll work closely with our development team to create intuitive and delightful interfaces."}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {t?.careers?.applyButton || "Apply Now"}
          </button>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t?.careers?.benefitsTitle || "Benefits & Perks"}
      </h2>
      
      <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300">
        <li className="mb-2">{t?.careers?.benefit1 || "Competitive salary and equity packages"}</li>
        <li className="mb-2">{t?.careers?.benefit2 || "Flexible work arrangements"}</li>
        <li className="mb-2">{t?.careers?.benefit3 || "Comprehensive health, dental, and vision insurance"}</li>
        <li className="mb-2">{t?.careers?.benefit4 || "Professional development budget"}</li>
        <li className="mb-2">{t?.careers?.benefit5 || "Regular team retreats and events"}</li>
      </ul>
      
      <p className="text-gray-700 dark:text-gray-300">
        {t?.careers?.contactInfo || 
          "Don't see a position that matches your skills? We're always interested in hearing from talented people. Send your resume to careers@getitright.quiz"}
      </p>
    </div>
  );
}