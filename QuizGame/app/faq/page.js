'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

function FAQContent() {
  const { t } = useLanguage();
  const [openItem, setOpenItem] = useState(null);
  const router = useRouter();
  
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
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        {t('faq.title')}
      </h1>
      
      {/* Schema.org FAQ structured data for SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              ${faqItems.map(item => `{
                "@type": "Question",
                "name": "${t(item.question).replace(/"/g, '\\"')}",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "${t(item.answer).replace(/"/g, '\\"')}"
                }
              }`).join(',')}
            ]
          }
        `}
      </script>
      
      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            <button 
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={openItem === index}
            >
              <span className="text-lg font-medium text-gray-900 dark:text-white">{t(item.question)}</span>
              <svg 
                className={`w-6 h-6 text-blue-500 transform transition-transform duration-300 ${openItem === index ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openItem === index && (
              <div className="px-6 pb-4 animate-fadeIn">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t(item.answer)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center bg-blue-50 dark:bg-gray-800/50 rounded-xl p-8 border border-blue-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('faq.stillHaveQuestions')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">{t('faq.contactMessage')}</p>
        <button 
          onClick={() => router.push('/contact')}
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {t('faq.contactUs')}
        </button>
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