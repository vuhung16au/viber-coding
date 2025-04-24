'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t('about.title')}</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>{t('about.ourMission')}</h2>
        <p>{t('about.missionText')}</p>
        
        <h2>{t('about.ourStory')}</h2>
        <p>{t('about.storyText')}</p>
        
        <h2>{t('about.ourTeam')}</h2>
        <p>{t('about.teamText')}</p>
        
        <h2>{t('about.contactUs')}</h2>
        <p>{t('about.contactText')}</p>
      </div>
    </div>
  );
}