'use client';

import { useLanguage } from '../context/LanguageContext';

export default function PressPage() {
  const { t } = useLanguage();
  
  // Sample press releases - would normally be fetched from a database
  const pressReleases = [
    {
      title: 'press.release1Title',
      date: 'April 15, 2025',
      summary: 'press.release1Summary',
      link: '#'
    },
    {
      title: 'press.release2Title',
      date: 'March 22, 2025',
      summary: 'press.release2Summary',
      link: '#'
    },
    {
      title: 'press.release3Title',
      date: 'February 10, 2025',
      summary: 'press.release3Summary',
      link: '#'
    }
  ];
  
  // Sample media mentions - would normally be fetched from a database
  const mediaAppearances = [
    {
      outlet: 'TechCrunch',
      title: 'press.media1Title',
      date: 'April 5, 2025',
      link: '#'
    },
    {
      outlet: 'EdTech Magazine',
      title: 'press.media2Title',
      date: 'March 15, 2025',
      link: '#'
    },
    {
      outlet: 'Learning Insider',
      title: 'press.media3Title',
      date: 'February 28, 2025',
      link: '#'
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-12">{t('press.title')}</h1>
      
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">{t('press.aboutUs')}</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('press.aboutUsText1')}</p>
          <p className="text-gray-600 dark:text-gray-300">{t('press.aboutUsText2')}</p>
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">{t('press.pressReleases')}</h2>
        <div className="space-y-6">
          {pressReleases.map((release, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">{t(release.title)}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{release.date}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t(release.summary)}</p>
              <a href={release.link} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t('press.readMore')} →
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">{t('press.mediaAppearances')}</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('press.outlet')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('press.article')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('press.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('press.link')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mediaAppearances.map((media, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {media.outlet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {t(media.title)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {media.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a href={media.link} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {t('press.view')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">{t('press.brandAssets')}</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('press.brandAssetsText')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="h-40 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 dark:text-gray-400">{t('press.logoPlaceholder')}</span>
              </div>
              <h3 className="font-medium mb-2">{t('press.companyLogo')}</h3>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                {t('press.downloadZip')}
              </a>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="h-40 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 dark:text-gray-400">{t('press.mediaKitPlaceholder')}</span>
              </div>
              <h3 className="font-medium mb-2">{t('press.mediaKit')}</h3>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                {t('press.downloadPDF')}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-6">{t('press.contactInfo')}</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('press.contactInfoText')}</p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">{t('press.mediaInquiries')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('press.email')}: press@quizgetitright.com<br />
              {t('press.phone')}: +1 (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}