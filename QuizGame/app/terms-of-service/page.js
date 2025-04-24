'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

// The client-side component that uses the language context
function TermsOfServiceContent() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('terms.title')}</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('terms.lastUpdated')}: April 24, 2025
        </p>
        
        <section>
          <h2>{t('terms.introduction')}</h2>
          <p>{t('terms.introductionText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.accountResponsibilities')}</h2>
          <p>{t('terms.accountResponsibilitiesText1')}</p>
          <p>{t('terms.accountResponsibilitiesText2')}</p>
        </section>
        
        <section>
          <h2>{t('terms.contentGuidelines')}</h2>
          <p>{t('terms.contentGuidelinesText')}</p>
          <ul>
            <li>{t('terms.guideline1')}</li>
            <li>{t('terms.guideline2')}</li>
            <li>{t('terms.guideline3')}</li>
            <li>{t('terms.guideline4')}</li>
            <li>{t('terms.guideline5')}</li>
          </ul>
        </section>
        
        <section>
          <h2>{t('terms.intellectualProperty')}</h2>
          <p>{t('terms.intellectualPropertyText1')}</p>
          <p>{t('terms.intellectualPropertyText2')}</p>
        </section>
        
        <section>
          <h2>{t('terms.userContentLicense')}</h2>
          <p>{t('terms.userContentLicenseText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.termination')}</h2>
          <p>{t('terms.terminationText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.disclaimers')}</h2>
          <p>{t('terms.disclaimersText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.limitationLiability')}</h2>
          <p>{t('terms.limitationLiabilityText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.indemnification')}</h2>
          <p>{t('terms.indemnificationText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.changes')}</h2>
          <p>{t('terms.changesText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.governingLaw')}</h2>
          <p>{t('terms.governingLawText')}</p>
        </section>
        
        <section>
          <h2>{t('terms.contactUs')}</h2>
          <p>{t('terms.contactUsText')}</p>
          <p>Email: legal@quizgetitright.com</p>
        </section>
      </div>
    </div>
  );
}

// ClientContent wrapper ensures hooks are only used on the client side
function ClientContent() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    // Return a simple loading state or skeleton during SSR
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Terms of Service</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }
  
  return (
    <LanguageProvider initialLocale="en">
      <TermsOfServiceContent />
    </LanguageProvider>
  );
}

// Main page component
export default function TermsOfServicePage() {
  return <ClientContent />;
}