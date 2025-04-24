'use client';

import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {t?.privacyPolicy?.lastUpdated || "Last Updated: April 15, 2025"}
      </p>
      
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p>
          {t?.privacyPolicy?.intro || 
            "This Privacy Policy describes how we collect, use, and share your personal information when you use our quiz platform."}
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section1?.title || "Information We Collect"}
        </h2>
        <p>
          {t?.privacyPolicy?.section1?.content || 
            "We collect information you provide directly to us when you create an account, complete a quiz, create content, or communicate with us. This may include your name, email address, profile information, and quiz results."}
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section2?.title || "How We Use Your Information"}
        </h2>
        <p>
          {t?.privacyPolicy?.section2?.content || 
            "We use the information we collect to:"}
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>{t?.privacyPolicy?.section2?.item1 || "Provide, maintain, and improve our services"}</li>
          <li>{t?.privacyPolicy?.section2?.item2 || "Process and complete quiz-taking and creation"}</li>
          <li>{t?.privacyPolicy?.section2?.item3 || "Send you technical notices, updates, and administrative messages"}</li>
          <li>{t?.privacyPolicy?.section2?.item4 || "Respond to your comments, questions, and requests"}</li>
          <li>{t?.privacyPolicy?.section2?.item5 || "Provide personalized content and recommendations"}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section3?.title || "Sharing Your Information"}
        </h2>
        <p>
          {t?.privacyPolicy?.section3?.content || 
            "We may share your information with:"}
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>{t?.privacyPolicy?.section3?.item1 || "Service providers who perform services on our behalf"}</li>
          <li>{t?.privacyPolicy?.section3?.item2 || "Other users, when you share public quizzes or results"}</li>
          <li>{t?.privacyPolicy?.section3?.item3 || "Law enforcement or other parties when required by law"}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section4?.title || "Your Choices"}
        </h2>
        <p>
          {t?.privacyPolicy?.section4?.content || 
            "You can access and update certain information through your account settings. You may also set your browser to block cookies, although doing so may affect certain features of our service."}
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section5?.title || "Data Security"}
        </h2>
        <p>
          {t?.privacyPolicy?.section5?.content || 
            "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access."}
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section6?.title || "Changes to This Policy"}
        </h2>
        <p>
          {t?.privacyPolicy?.section6?.content || 
            "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page."}
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
          {t?.privacyPolicy?.section7?.title || "Contact Us"}
        </h2>
        <p>
          {t?.privacyPolicy?.section7?.content || 
            "If you have any questions about this Privacy Policy, please contact us at privacy@getitright.quiz."}
        </p>
      </div>
    </div>
  );
}