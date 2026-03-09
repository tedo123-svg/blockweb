import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { toEthiopianDate, toGregorianDate, ethiopianMonths, ethiopianMonthsEng } from '../utils/ethiopianCalendar';

function EthiopianDatePicker({ value, onChange, name, required }) {
  const { useEthiopianCalendar, language } = useLanguage();
  
  // Initialize with Ethiopian date if value exists
  const initialEthDate = value ? toEthiopianDate(value) : { year: 2017, month: 1, day: 1 };
  const [ethYear, setEthYear] = useState(initialEthDate.year);
  const [ethMonth, setEthMonth] = useState(initialEthDate.month);
  const [ethDay, setEthDay] = useState(initialEthDate.day);

  useEffect(() => {
    if (value) {
      const eth = toEthiopianDate(value);
      setEthYear(eth.year);
      setEthMonth(eth.month);
      setEthDay(eth.day);
    }
  }, [value]);

  const handleEthiopianChange = (year, month, day) => {
    setEthYear(year);
    setEthMonth(month);
    setEthDay(day);
    
    // Convert to Gregorian and update parent
    const gregDate = toGregorianDate(year, month, day);
    const dateString = gregDate.toISOString().split('T')[0];
    onChange({ target: { name, value: dateString } });
  };

  if (!useEthiopianCalendar) {
    // Regular Gregorian date input
    return (
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    );
  }

  // Ethiopian calendar picker
  const monthNames = language === 'am' ? ethiopianMonths : ethiopianMonthsEng;
  const maxDay = ethMonth === 13 ? 5 : 30; // Pagumen has 5-6 days

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px' }}>
      <select
        value={ethDay}
        onChange={(e) => handleEthiopianChange(ethYear, ethMonth, parseInt(e.target.value))}
        required={required}
        style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
      >
        {[...Array(maxDay)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      
      <select
        value={ethMonth}
        onChange={(e) => handleEthiopianChange(ethYear, parseInt(e.target.value), ethDay)}
        required={required}
        style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
      >
        {monthNames.map((month, i) => (
          <option key={i + 1} value={i + 1}>{month}</option>
        ))}
      </select>
      
      <input
        type="number"
        value={ethYear}
        onChange={(e) => handleEthiopianChange(parseInt(e.target.value), ethMonth, ethDay)}
        min="2000"
        max="2100"
        required={required}
        style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
      />
    </div>
  );
}

export default EthiopianDatePicker;
