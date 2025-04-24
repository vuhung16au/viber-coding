'use client';

import { useLanguage } from '../context/LanguageContext';

export default function CareersPage() {
  const { t } = useLanguage();
  
  // Sample job listings - would normally be fetched from a database
  const jobListings = [
    {
      title: 'careers.job1Title',
      department: 'careers.engineering',
      location: 'careers.remote',
      description: 'careers.job1Description',
      requirements: [
        'careers.job1Req1',
        'careers.job1Req2',
        'careers.job1Req3',
        'careers.job1Req4'
      ]
    },
    {
      title: 'careers.job2Title',
      department: 'careers.design',
      location: 'careers.remote',
      description: 'careers.job2Description',
      requirements: [
        'careers.job2Req1',
        'careers.job2Req2',
        'careers.job2Req3',
        'careers.job2Req4'
      ]
    },
    {
      title: 'careers.job3Title',
      department: 'careers.marketing',
      location: 'careers.remote',
      description: 'careers.job3Description',
      requirements: [
        'careers.job3Req1',
        'careers.job3Req2',
        'careers.job3Req3',
        'careers.job3Req4'
      ]
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('careers.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('careers.introduction')}
        </p>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">{t('careers.whyJoinUs')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('careers.benefit1Title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('careers.benefit1Text')}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('careers.benefit2Title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('careers.benefit2Text')}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('careers.benefit3Title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('careers.benefit3Text')}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">{t('careers.openPositions')}</h2>
        
        <div className="space-y-6">
          {jobListings.map((job, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{t(job.title)}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{t(job.department)}</span>
                      <span className="mx-2">•</span>
                      <span>{t(job.location)}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      {t('careers.applyNow')}
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">{t(job.description)}</p>
                  
                  <h4 className="font-medium mt-4 mb-2">{t('careers.requirements')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{t(req)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('careers.noPositionFit')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('careers.sendResume')}</p>
        <a 
          href="mailto:careers@quizgetitright.com" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {t('careers.contactRecruitment')}
        </a>
      </div>
    </div>
  );
}