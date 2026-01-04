// src/i18n/config.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import amTranslations from './locales/am.json';

// Get saved language from localStorage, default to 'en'
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch (error) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      am: {
        translation: amTranslations
      }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable suspense to avoid loading issues
    }
  });

// Listen for language changes and persist to localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('language', lng);
    document.documentElement.setAttribute('lang', lng);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
});

export default i18n;
