// Ethiopian Calendar Utilities

export const ethiopianMonths = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ethiopianMonthsEng = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
];

// Convert Gregorian to Ethiopian date
export function toEthiopianDate(gregorianDate) {
  const date = new Date(gregorianDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Ethiopian calendar starts on September 11 (or 12 in leap years)
  const ethNewYearGreg = isLeapYear(year) ? new Date(year, 8, 12) : new Date(year, 8, 11);
  
  let ethYear, ethMonth, ethDay;

  if (date >= ethNewYearGreg) {
    ethYear = year - 7;
    const daysSinceNewYear = Math.floor((date - ethNewYearGreg) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  } else {
    ethYear = year - 8;
    const prevYearNewYear = isLeapYear(year - 1) ? new Date(year - 1, 8, 12) : new Date(year - 1, 8, 11);
    const daysSinceNewYear = Math.floor((date - prevYearNewYear) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  }

  return { year: ethYear, month: ethMonth, day: ethDay };
}

// Convert Ethiopian to Gregorian date
export function toGregorianDate(ethYear, ethMonth, ethDay) {
  const gregYear = ethYear + 7;
  const ethNewYearGreg = isLeapYear(gregYear) ? new Date(gregYear, 8, 12) : new Date(gregYear, 8, 11);
  
  const daysToAdd = ((ethMonth - 1) * 30) + (ethDay - 1);
  const gregorianDate = new Date(ethNewYearGreg);
  gregorianDate.setDate(gregorianDate.getDate() + daysToAdd);
  
  return gregorianDate;
}

// Format Ethiopian date
export function formatEthiopianDate(gregorianDate, language = 'am') {
  const eth = toEthiopianDate(gregorianDate);
  const monthNames = language === 'am' ? ethiopianMonths : ethiopianMonthsEng;
  
  if (language === 'am') {
    return `${eth.day} ${monthNames[eth.month - 1]} ${eth.year}`;
  }
  return `${monthNames[eth.month - 1]} ${eth.day}, ${eth.year}`;
}

// Check if Gregorian year is leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get current Ethiopian date
export function getCurrentEthiopianDate() {
  return toEthiopianDate(new Date());
}

// Format date input for Ethiopian calendar (YYYY-MM-DD format)
export function formatEthiopianDateInput(ethYear, ethMonth, ethDay) {
  const gregDate = toGregorianDate(ethYear, ethMonth, ethDay);
  return gregDate.toISOString().split('T')[0];
}
