'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdvertisePage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally send the form data to a backend service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      company: '',
      budget: '',
      message: ''
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('advertise.title')}</h1>
      
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">{t('advertise.tagline')}</h2>
          <p className="text-lg text-blue-600 dark:text-blue-300">{t('advertise.subtitle')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-6">{t('advertise.whyAdvertise')}</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">{t('advertise.benefit1Title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('advertise.benefit1Text')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">{t('advertise.benefit2Title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('advertise.benefit2Text')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">{t('advertise.benefit3Title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('advertise.benefit3Text')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">{t('advertise.benefit4Title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('advertise.benefit4Text')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">{t('advertise.statistics')}</h3>
            
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('advertise.monthlyUsers')}</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">100,000+</dd>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('advertise.quizCompleted')}</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">500,000+</dd>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('advertise.averageEngagement')}</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">8.5 {t('advertise.minutes')}</dd>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('advertise.demographicAge')}</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">18-34</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">{t('advertise.advertisingOptions')}</h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">{t('advertise.option1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('advertise.option1Text')}</p>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                {t('advertise.popular')}
              </span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">{t('advertise.option2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('advertise.option2Text')}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">{t('advertise.option3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('advertise.option3Text')}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">{t('advertise.option4Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('advertise.option4Text')}</p>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                {t('advertise.bestValue')}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t('advertise.getInTouch')}</h2>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {submitted ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">{t('advertise.thankYou')}</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">{t('advertise.wellBeInTouch')}</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('advertise.submitAnother')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('advertise.yourName')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('advertise.email')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('advertise.company')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('advertise.budget')}
                    </label>
                    <div className="mt-1">
                      <select
                        id="budget"
                        name="budget"
                        required
                        value={formData.budget}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">{t('advertise.selectBudget')}</option>
                        <option value="< $1,000">{'< $1,000'}</option>
                        <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="> $10,000">{'> $10,000'}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('advertise.message')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('advertise.submitRequest')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}