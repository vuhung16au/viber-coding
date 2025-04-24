'use client';

import { useLanguage } from '../context/LanguageContext';

export default function AdvertiseContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        {t?.advertise?.description || 
          "Reach millions of quiz enthusiasts with targeted advertising on our platform. We offer various advertising options to help you reach your target audience."}
      </p>
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t?.advertise?.optionsTitle || "Advertising Options"}
      </h2>
      <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300">
        <li className="mb-2">{t?.advertise?.option1 || "Banner ads on quiz pages"}</li>
        <li className="mb-2">{t?.advertise?.option2 || "Sponsored quizzes"}</li>
        <li className="mb-2">{t?.advertise?.option3 || "Email newsletter placements"}</li>
        <li className="mb-2">{t?.advertise?.option4 || "Custom quiz competitions"}</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t?.advertise?.contactTitle || "Contact Us"}
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {t?.advertise?.contactDescription || 
          "For advertising inquiries, please contact our advertising team at ads@getitright.quiz"}
      </p>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.advertise?.nameLabel || "Your Name"}
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.advertise?.emailLabel || "Your Email"}
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.advertise?.messageLabel || "Your Message"}
          </label>
          <textarea
            id="message"
            rows="4"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t?.advertise?.submitButton || "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}