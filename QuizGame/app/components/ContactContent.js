'use client';

import { useLanguage } from '../context/LanguageContext';

export default function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {t?.contact?.description || 
          "Have questions or feedback about our quiz platform? We'd love to hear from you! Fill out the form below, and we'll get back to you as soon as possible."}
      </p>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.contact?.nameLabel || "Your Name"}
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.contact?.emailLabel || "Your Email"}
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.contact?.subjectLabel || "Subject"}
          </label>
          <select
            id="subject"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">{t?.contact?.subjectPlaceholder || "Select a subject"}</option>
            <option value="general">{t?.contact?.subjectGeneral || "General Inquiry"}</option>
            <option value="support">{t?.contact?.subjectSupport || "Technical Support"}</option>
            <option value="feedback">{t?.contact?.subjectFeedback || "Feedback"}</option>
            <option value="business">{t?.contact?.subjectBusiness || "Business Opportunity"}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="message" className="block mb-1 text-gray-700 dark:text-gray-300">
            {t?.contact?.messageLabel || "Your Message"}
          </label>
          <textarea
            id="message"
            rows="5"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t?.contact?.submitButton || "Send Message"}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t?.contact?.alternativeTitle || "Other Ways to Reach Us"}
        </h2>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-medium">{t?.contact?.emailTitle || "Email"}:</span> {" "}
            <a href="mailto:support@getitright.quiz" className="text-blue-600 hover:underline dark:text-blue-400">
              support@getitright.quiz
            </a>
          </p>
          
          <p>
            <span className="font-medium">{t?.contact?.addressTitle || "Address"}:</span> {" "}
            123 Quiz Street, San Francisco, CA 94103, USA
          </p>
          
          <p>
            <span className="font-medium">{t?.contact?.socialTitle || "Social Media"}:</span> {" "}
            <a href="#" className="text-blue-600 hover:underline dark:text-blue-400 mr-2">Twitter</a>
            <a href="#" className="text-blue-600 hover:underline dark:text-blue-400 mr-2">Facebook</a>
            <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Instagram</a>
          </p>
        </div>
      </div>
    </div>
  );
}