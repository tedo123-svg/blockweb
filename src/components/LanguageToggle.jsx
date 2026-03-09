import React from 'react';
import { Globe, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

function LanguageToggle() {
  const { language, toggleLanguage, useEthiopianCalendar, toggleCalendar } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={toggleLanguage}
        className="btn btn-secondary"
        style={{ 
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px'
        }}
        title={language === 'en' ? 'Switch to Amharic' : 'ወደ እንግሊዝኛ ቀይር'}
      >
        <Globe size={16} />
        {language === 'en' ? 'አማ' : 'EN'}
      </button>
      
      <button
        onClick={toggleCalendar}
        className="btn btn-secondary"
        style={{ 
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px'
        }}
        title={useEthiopianCalendar ? 'Switch to Gregorian Calendar' : 'Switch to Ethiopian Calendar'}
      >
        <Calendar size={16} />
        {useEthiopianCalendar ? 'ግሪ' : 'ኢትዮ'}
      </button>
    </div>
  );
}

export default LanguageToggle;
