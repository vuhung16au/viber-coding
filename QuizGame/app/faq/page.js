'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dynamic from 'next/dynamic';

function FAQContent() {
  const { t } = useLanguage();
  const [openItem, setOpenItem] = useState(null);
  
  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };
  
  const faqItems = [
    {
      question: 'faq.question1',
      answer: 'faq.answer1'
    },
    {
      question: 'faq.question2',
      answer: 'faq.answer2'
    },
    {
      question: 'faq.question3',
      answer: 'faq.answer3'
    },
    {
      question: 'faq.question4',
      answer: 'faq.answer4'
    },
    {
      question: 'faq.question5',
      answer: 'faq.answer5'
    },
    {
      question: 'faq.question6',
      answer: 'faq.answer6'
    }
  ];
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h1>
      
      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
          >
            <button 
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
            >
              <span className="text-lg font-medium text-gray-900 dark:text-white">{t(item.question)}</span>
              <svg 
                className={`w-6 h-6 text-gray-500 transform ${openItem === index ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openItem === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 dark:text-gray-300">{t(item.answer)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('faq.stillHaveQuestions')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('faq.contactMessage')}</p>
        <a 
          href="/contact" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('faq.contactUs')}
        </a>
      </div>
    </div>
  );
}

// Use dynamic import with SSR disabled to prevent the component from being pre-rendered
const FAQContentWithNoSSR = dynamic(() => Promise.resolve(FAQContent), {
  ssr: false
});

export default function FAQPage() {
  return <FAQContentWithNoSSR />;
}