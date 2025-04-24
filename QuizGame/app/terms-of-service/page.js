'use client';

import { LanguageProvider, useLanguage } from '../context/LanguageContext';

// Create a wrapper component that uses the language provider
function TermsOfServiceContent() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('terms.title')}</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('terms.lastUpdated')}: April 15, 2025
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

// Main page component that provides the language context
export default function TermsOfServicePage() {
  return (
    <LanguageProvider initialLocale="en">
      <TermsOfServiceContent />
    </LanguageProvider>
  );
}