import React, { createContext, useContext, useState } from 'react';
import { translate } from '../utils/translations';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [useEthiopianCalendar, setUseEthiopianCalendar] = useState(
    localStorage.getItem('useEthiopianCalendar') === 'true'
  );

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleCalendar = () => {
    const newValue = !useEthiopianCalendar;
    setUseEthiopianCalendar(newValue);
    localStorage.setItem('useEthiopianCalendar', newValue.toString());
  };

  const t = (key) => translate(key, language);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      toggleLanguage, 
      useEthiopianCalendar, 
      toggleCalendar,
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
