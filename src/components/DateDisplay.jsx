import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

function DateDisplay({ date, format = 'short' }) {
  const { useEthiopianCalendar, language } = useLanguage();

  if (!date) return null;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (useEthiopianCalendar) {
    return <span>{formatEthiopianDate(dateObj, language)}</span>;
  }

  // Gregorian calendar
  if (format === 'short') {
    return <span>{dateObj.toLocaleDateString()}</span>;
  }
  
  return <span>{dateObj.toLocaleString()}</span>;
}

export default DateDisplay;
