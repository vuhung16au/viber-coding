'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import SeoHead from '../components/SeoHead';
import TermsOfServiceTOC from '../components/TermsOfServiceTOC';
import MobileTermsNav from '../components/MobileTermsNav';

// The client-side component that uses the language context
function TermsOfServiceContent() {
  const { t } = useLanguage();
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': t('terms.title'),
    'description': t('terms.introductionText'),
    'datePublished': '2025-04-24',
    'inLanguage': 'en',
    'mainEntity': {
      '@type': 'FAQPage',
      'name': t('terms.title'),
    },
  };
  return (
    <>
      <SeoHead
        title={t('terms.title') + ' | Quiz Get It Right'}
        description={t('terms.introductionText')}
        canonical="https://quizgetitright.com/en/terms-of-service"
        structuredData={structuredData}
      />
      <div className="flex flex-col md:flex-row gap-8">
        <TermsOfServiceTOC />
        <main className="flex-1 min-w-0">
          <MobileTermsNav />
          <div className="max-w-2xl mx-auto py-8 px-2 sm:px-4 lg:px-8 bg-card rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-balance">{t('terms.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">{t('terms.lastUpdated')}: April 24, 2025</p>
            <section id="introduction" tabIndex={-1} aria-labelledby="introduction-heading" className="mb-8">
              <h2 id="introduction-heading" className="text-xl font-semibold mb-2">{t('terms.introduction')}</h2>
              <p>{t('terms.introductionText')}</p>
            </section>
            <section id="account-responsibilities" tabIndex={-1} aria-labelledby="account-responsibilities-heading" className="mb-8">
              <h2 id="account-responsibilities-heading" className="text-xl font-semibold mb-2">{t('terms.accountResponsibilities')}</h2>
              <p>{t('terms.accountResponsibilitiesText1')}</p>
              <p>{t('terms.accountResponsibilitiesText2')}</p>
            </section>
            <section id="content-guidelines" tabIndex={-1} aria-labelledby="content-guidelines-heading" className="mb-8">
              <h2 id="content-guidelines-heading" className="text-xl font-semibold mb-2">{t('terms.contentGuidelines')}</h2>
              <p>{t('terms.contentGuidelinesText')}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('terms.guideline1')}</li>
                <li>{t('terms.guideline2')}</li>
                <li>{t('terms.guideline3')}</li>
                <li>{t('terms.guideline4')}</li>
                <li>{t('terms.guideline5')}</li>
              </ul>
            </section>
            <section id="intellectual-property" tabIndex={-1} aria-labelledby="intellectual-property-heading" className="mb-8">
              <h2 id="intellectual-property-heading" className="text-xl font-semibold mb-2">{t('terms.intellectualProperty')}</h2>
              <p>{t('terms.intellectualPropertyText1')}</p>
              <p>{t('terms.intellectualPropertyText2')}</p>
            </section>
            <section id="user-content-license" tabIndex={-1} aria-labelledby="user-content-license-heading" className="mb-8">
              <h2 id="user-content-license-heading" className="text-xl font-semibold mb-2">{t('terms.userContentLicense')}</h2>
              <p>{t('terms.userContentLicenseText')}</p>
            </section>
            <section id="termination" tabIndex={-1} aria-labelledby="termination-heading" className="mb-8">
              <h2 id="termination-heading" className="text-xl font-semibold mb-2">{t('terms.termination')}</h2>
              <p>{t('terms.terminationText')}</p>
            </section>
            <section id="disclaimers" tabIndex={-1} aria-labelledby="disclaimers-heading" className="mb-8">
              <h2 id="disclaimers-heading" className="text-xl font-semibold mb-2">{t('terms.disclaimers')}</h2>
              <p>{t('terms.disclaimersText')}</p>
            </section>
            <section id="limitation-liability" tabIndex={-1} aria-labelledby="limitation-liability-heading" className="mb-8">
              <h2 id="limitation-liability-heading" className="text-xl font-semibold mb-2">{t('terms.limitationLiability')}</h2>
              <p>{t('terms.limitationLiabilityText')}</p>
            </section>
            <section id="indemnification" tabIndex={-1} aria-labelledby="indemnification-heading" className="mb-8">
              <h2 id="indemnification-heading" className="text-xl font-semibold mb-2">{t('terms.indemnification')}</h2>
              <p>{t('terms.indemnificationText')}</p>
            </section>
            <section id="changes" tabIndex={-1} aria-labelledby="changes-heading" className="mb-8">
              <h2 id="changes-heading" className="text-xl font-semibold mb-2">{t('terms.changes')}</h2>
              <p>{t('terms.changesText')}</p>
            </section>
            <section id="governing-law" tabIndex={-1} aria-labelledby="governing-law-heading" className="mb-8">
              <h2 id="governing-law-heading" className="text-xl font-semibold mb-2">{t('terms.governingLaw')}</h2>
              <p>{t('terms.governingLawText')}</p>
            </section>
            <section id="contact-us" tabIndex={-1} aria-labelledby="contact-us-heading" className="mb-8">
              <h2 id="contact-us-heading" className="text-xl font-semibold mb-2">{t('terms.contactUs')}</h2>
              <p>{t('terms.contactUsText')}</p>
              <p>Email: <a href="mailto:legal@quizgetitright.com" className="underline text-primary">legal@quizgetitright.com</a></p>
            </section>
          </div>
        </main>
      </div>
    </>
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