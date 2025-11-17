import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

const get = (obj: any, path: string, fallback?: any): any => {
    const value = path.split('.').reduce((o, i) => (o === undefined || o === null ? undefined : o[i]), obj);
    return value !== undefined ? value : fallback;
};


interface I18nContextType {
    t: (key: string, vars?: { [key: string]: any }) => any;
    language: string;
    setLanguage: (lang: string) => void;
}

export const I18nContext = createContext<I18nContextType>({
  t: (key: string) => key,
  language: 'es',
  setLanguage: () => {},
});

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => localStorage.getItem('kolink-language') || 'es');
  const [translations, setTranslations] = useState<{ [key: string]: any }>({});

  const setLanguage = useCallback((lang: string) => {
    localStorage.setItem('kolink-language', lang);
    setLanguageState(lang);
  }, []);

  useEffect(() => {
    const loadTranslations = async (lang: string) => {
      // Don't refetch if already loaded
      if (translations[lang]) return;

      try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${lang}: ${response.statusText}`);
        }
        const data = await response.json();
        setTranslations(prev => ({ ...prev, [lang]: data }));
      } catch (error) {
        console.error(error);
        // Fallback to Spanish if the selected language file is missing or fails to load
        if (lang !== 'es') {
          console.warn(`Falling back to Spanish language.`);
          setLanguage('es');
        }
      }
    };

    loadTranslations(language);
  }, [language, translations, setLanguage]);


  const t = useCallback((key: string, vars?: { [key: string]: any }) => {
    const value = translations[language] ? get(translations[language], key, key) : key;
    
    if (vars?.returnObjects) {
        return value;
    }

    if (typeof value !== 'string') {
        // When the resolved value is not a string (e.g., an array for FAQs),
        // we can't perform interpolation. Return the value as is.
        return value;
    }

    let text = value;
    if (vars) {
      Object.keys(vars).forEach(varKey => {
        if (varKey === 'returnObjects') return; // Should not happen due to the check above, but for safety.
        const regex = new RegExp(`{${varKey}}`, 'g');
        text = text.replace(regex, String(vars[varKey]));
      });
    }
    return text;
  }, [language, translations]);

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};