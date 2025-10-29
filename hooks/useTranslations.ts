import { useCallback } from 'react';
import { TRANSLATIONS } from '../constants';

export const useTranslations = (language: string) => {
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  }, [language]);

  return { t };
};