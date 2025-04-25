'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import translations from '../translations';

// Map of language codes to their display names
export const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
];

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLocale }) {
  const [locale, setLocale] = useState(initialLocale || 'en');
  const router = useRouter();
  const pathname = usePathname ? usePathname() : null;
  
  // Load saved language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage] && !initialLocale) {
      setLocale(savedLanguage);
    }
  }, [initialLocale]);

  const changeLanguage = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('language', newLocale);
      
      // Get the current path and replace the locale part
      if (pathname) {
        // Remove any existing locale prefix from the pathname
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
        // Create the new path with the new locale
        const newPath = `/${newLocale}${pathWithoutLocale}`;
        // Navigate to the new path
        router.push(newPath);
      } else {
        // Fallback to just the locale if pathname is not available
        router.push('/' + newLocale);
      }
    }
  };

  // Get the current language's translations
  const t = (key) => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = translations[locale];
    
    // Navigate through the nested object
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // If translation is missing, fall back to English
        value = getEnglishFallback(keys);
        break;
      }
    }
    
    // Return the key itself if no translation is found
    return typeof value === 'string' ? value : key;
  };

  // Fallback to English if translation is missing
  const getEnglishFallback = (keys) => {
    let value = translations['en'];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return keys.join('.');
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}