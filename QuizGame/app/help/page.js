'use client';

import { useLanguage } from '../context/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('help.title')}</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('help.gettingStarted')}</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.accountCreation')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.accountCreationText')}</p>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('help.takingQuizzes')}</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.findingQuizzes')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.findingQuizzesText')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.quizRules')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.quizRulesText')}</p>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('help.creatingQuizzes')}</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.quizCreation')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.quizCreationText')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.sharingQuizzes')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.sharingQuizzesText')}</p>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('help.accountManagement')}</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.profileSettings')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.profileSettingsText')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium">{t('help.privacySettings')}</h3>
              <div className="mt-2 text-gray-600 dark:text-gray-300">
                <p>{t('help.privacySettingsText')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('help.needMoreHelp')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('help.contactSupportMessage')}</p>
        <a 
          href="/contact" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('help.contactSupport')}
        </a>
      </div>
    </div>
  );
}