'use client';

import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('privacy.title')}</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('privacy.lastUpdated')}: April 15, 2025
        </p>
        
        <section>
          <h2>{t('privacy.introduction')}</h2>
          <p>{t('privacy.introductionText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.informationWeCollect')}</h2>
          <p>{t('privacy.informationWeCollectText')}</p>
          
          <h3>{t('privacy.personalInformation')}</h3>
          <p>{t('privacy.personalInformationText')}</p>
          
          <h3>{t('privacy.usageData')}</h3>
          <p>{t('privacy.usageDataText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.howWeUseInformation')}</h2>
          <p>{t('privacy.howWeUseInformationText')}</p>
          <ul>
            <li>{t('privacy.useReason1')}</li>
            <li>{t('privacy.useReason2')}</li>
            <li>{t('privacy.useReason3')}</li>
            <li>{t('privacy.useReason4')}</li>
            <li>{t('privacy.useReason5')}</li>
          </ul>
        </section>
        
        <section>
          <h2>{t('privacy.cookies')}</h2>
          <p>{t('privacy.cookiesText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.dataSecurity')}</h2>
          <p>{t('privacy.dataSecurityText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.thirdPartyServices')}</h2>
          <p>{t('privacy.thirdPartyServicesText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.childrenPrivacy')}</h2>
          <p>{t('privacy.childrenPrivacyText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.yourRights')}</h2>
          <p>{t('privacy.yourRightsText')}</p>
          <ul>
            <li>{t('privacy.right1')}</li>
            <li>{t('privacy.right2')}</li>
            <li>{t('privacy.right3')}</li>
            <li>{t('privacy.right4')}</li>
          </ul>
        </section>
        
        <section>
          <h2>{t('privacy.changes')}</h2>
          <p>{t('privacy.changesText')}</p>
        </section>
        
        <section>
          <h2>{t('privacy.contactUs')}</h2>
          <p>{t('privacy.contactUsText')}</p>
          <p>Email: privacy@quizgetitright.com</p>
        </section>
      </div>
    </div>
  );
}