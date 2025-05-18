'use client';

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('getting-started');
  
  const tabs = [
    { id: 'getting-started', label: 'help.gettingStarted' },
    { id: 'account', label: 'help.account' },
    { id: 'quizzes', label: 'help.quizzes' },
    { id: 'troubleshooting', label: 'help.troubleshooting' }
  ];
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        {t('help.title')}
      </h1>
      
      {/* Help center tabs */}
      <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm sm:text-base transition-colors duration-300 border-b-2 -mb-px mx-1 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      
      <div className="space-y-8">
        {activeTab === 'getting-started' && (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('help.gettingStarted')}</h2>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.accountCreation')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.accountCreationText')}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.navigation')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.navigationText')}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.takingQuiz')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.takingQuizText')}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
        
        {activeTab === 'account' && (
          <div className="space-y-8">
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.profileSettings')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.profileSettingsText')}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.passwordReset')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.passwordResetText')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {activeTab === 'quizzes' && (
          <div className="space-y-8">
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.creatingQuiz')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.creatingQuizText')}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.sharingQuiz')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.sharingQuizText')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {activeTab === 'troubleshooting' && (
          <div className="space-y-8">
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.commonIssues')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.commonIssuesText')}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('help.technicalSupport')}</h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{t('help.technicalSupportText')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      
      {/* Contact support section */}
      <div className="mt-16 text-center bg-blue-50 dark:bg-gray-800/50 rounded-xl p-8 border border-blue-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('help.needMoreHelp')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">{t('help.contactSupportMessage')}</p>
        <button 
          onClick={() => router.push('/contact')}
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {t('help.contactSupport')}
        </button>
      </div>
    </div>
  );
}