import en from './en';
import vi from './vi';
import ja from './ja';
import fr from './fr';
import zh from './zh';
import de from './de';

const translations = {
  en,
  vi,
  ja,
  fr,
  zh,
  de
};

// Create a useTranslation hook that can be imported in components
export function useTranslation(locale = 'en') {
  // Get the specified language, fallback to English if not available
  const getTranslation = () => translations[locale] || translations['en'];
  
  // Translation function
  const t = (key, fallback = '') => {
    const keys = key.split('.');
    let result = getTranslation();
    
    // Navigate through the nested object
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // If key doesn't exist in the current language, try English
        if (locale !== 'en') {
          let enResult = translations['en'];
          for (const enK of keys) {
            if (enResult && enResult[enK] !== undefined) {
              enResult = enResult[enK];
            } else {
              return fallback || key;
            }
          }
          return typeof enResult === 'string' ? enResult : fallback || key;
        }
        return fallback || key;
      }
    }
    
    return typeof result === 'string' ? result : fallback || key;
  };
  
  return { t };
}

export default translations;
