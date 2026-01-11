/**
 * Ethiopian Calendar Utilities
 *
 * The Ethiopian calendar is approximately 7-8 years behind the Gregorian calendar
 * It has 13 months: 12 months of 30 days each and a 13th month (Pagume) of 5-6 days
 *
 * Months:
 * 1. Meskerem (መስከረም) - September 11/12
 * 2. Tikimt (ጥቅምት) - October 11/12
 * 3. Hidar (ኅዳር) - November 10/11
 * 4. Tahsas (ታኅሣሥ) - December 10/11
 * 5. Tir (ጥር) - January 9/10
 * 6. Yekatit (የካቲት) - February 8/9
 * 7. Megabit (መጋቢት) - March 10/11
 * 8. Miazia (ሚያዝያ) - April 9/10
 * 9. Ginbot (ግንቦት) - May 9/10
 * 10. Sene (ሰኔ) - June 8/9
 * 11. Hamle (ሐምሌ) - July 8/9
 * 12. Nehase (ነሐሴ) - August 7/8
 * 13. Pagume (ጳጉሜ) - September 6/7 (5-6 days)
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAmharic: string;
  dayOfWeek: string;
  dayOfWeekAmharic: string;
}

const ETHIOPIAN_MONTHS = [
  { name: 'Meskerem', amharic: 'መስከረም' },
  { name: 'Tikimt', amharic: 'ጥቅምት' },
  { name: 'Hidar', amharic: 'ኅዳር' },
  { name: 'Tahsas', amharic: 'ታኅሣሥ' },
  { name: 'Tir', amharic: 'ጥር' },
  { name: 'Yekatit', amharic: 'የካቲት' },
  { name: 'Megabit', amharic: 'መጋቢት' },
  { name: 'Miazia', amharic: 'ሚያዝያ' },
  { name: 'Ginbot', amharic: 'ግንቦት' },
  { name: 'Sene', amharic: 'ሰኔ' },
  { name: 'Hamle', amharic: 'ሐምሌ' },
  { name: 'Nehase', amharic: 'ነሐሴ' },
  { name: 'Pagume', amharic: 'ጳጉሜ' }
];

const DAYS_OF_WEEK = [
  { name: 'Sunday', amharic: 'እሁድ' },
  { name: 'Monday', amharic: 'ሰኞ' },
  { name: 'Tuesday', amharic: 'ማክሰኞ' },
  { name: 'Wednesday', amharic: 'ረቡዕ' },
  { name: 'Thursday', amharic: 'ሐሙስ' },
  { name: 'Friday', amharic: 'ዓርብ' },
  { name: 'Saturday', amharic: 'ቅዳሜ' }
];

/**
 * Convert Gregorian date to Ethiopian calendar
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  // Ethiopian New Year starts on September 11 (or 12 in leap years)
  let ethYear: number;
  let ethMonth: number;
  let ethDay: number;

  // Calculate if it's a leap year
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const newYearDay = isLeapYear(year) ? 12 : 11;

  // Calculate Ethiopian year
  if (month < 9 || (month === 9 && day < newYearDay)) {
    ethYear = year - 8;
  } else {
    ethYear = year - 7;
  }

  // Calculate day number from Ethiopian New Year
  const ethiopianNewYear = new Date(year, 8, newYearDay); // September is month 8 (0-indexed)
  let dayDiff: number;

  if (date >= ethiopianNewYear) {
    dayDiff = Math.floor((date.getTime() - ethiopianNewYear.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    const lastEthNewYear = new Date(year - 1, 8, isLeapYear(year - 1) ? 12 : 11);
    dayDiff = Math.floor((date.getTime() - lastEthNewYear.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate Ethiopian month and day
  ethMonth = Math.floor(dayDiff / 30) + 1;
  ethDay = (dayDiff % 30) + 1;

  // Adjust for Pagume (13th month)
  if (ethMonth > 13) {
    ethMonth = 1;
    ethYear++;
    ethDay = 1;
  }

  // Get month and day names
  const monthInfo = ETHIOPIAN_MONTHS[ethMonth - 1];
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthName: monthInfo.name,
    monthNameAmharic: monthInfo.amharic,
    dayOfWeek: dayOfWeek.name,
    dayOfWeekAmharic: dayOfWeek.amharic
  };
}

/**
 * Format Ethiopian date as string
 */
export function formatEthiopianDate(ethDate: EthiopianDate, includeAmharic: boolean = true): string {
  if (includeAmharic) {
    return `${ethDate.monthName} ${ethDate.day}, ${ethDate.year} (${ethDate.monthNameAmharic} ${ethDate.day}, ${ethDate.year})`;
  }
  return `${ethDate.monthName} ${ethDate.day}, ${ethDate.year}`;
}

/**
 * Format Ethiopian date in pure Amharic
 */
export function formatEthiopianDateAmharic(ethDate: EthiopianDate): string {
  return `${ethDate.monthNameAmharic} ${toAmharicNumerals(ethDate.day)}፣ ${toAmharicNumerals(ethDate.year)}`;
}

/**
 * Get day of week in Amharic
 */
export function getDayOfWeekAmharic(date: Date): string {
  const dayIndex = date.getDay();
  return DAYS_OF_WEEK[dayIndex].amharic;
}

/**
 * Get current Ethiopian date
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/**
 * Format date showing both Gregorian and Ethiopian calendars
 */
export function formatDualCalendar(date: Date, options?: {
  showDayOfWeek?: boolean;
  showAmharic?: boolean;
}): string {
  const { showDayOfWeek = false, showAmharic = true } = options || {};

  const ethDate = gregorianToEthiopian(date);

  // Gregorian format
  const gregorianOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (showDayOfWeek) {
    gregorianOptions.weekday = 'long';
  }

  const gregorian = date.toLocaleDateString('en-US', gregorianOptions);

  // Ethiopian format
  let ethiopian = '';
  if (showDayOfWeek) {
    ethiopian += `${ethDate.dayOfWeek}, `;
  }
  ethiopian += `${ethDate.monthName} ${ethDate.day}, ${ethDate.year}`;

  if (showAmharic) {
    ethiopian += ` (${ethDate.monthNameAmharic} ${ethDate.day}, ${ethDate.year})`;
  }

  return `${gregorian} • ${ethiopian}`;
}

/**
 * Get Ethiopian time greeting based on time of day
 */
export function getEthiopianGreeting(): { english: string; amharic: string } {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 12) {
    return { english: 'Good Morning', amharic: 'እንደምን አደርክ' };
  } else if (hour >= 12 && hour < 18) {
    return { english: 'Good Afternoon', amharic: 'እንደምን ዋልክ' };
  } else {
    return { english: 'Good Evening', amharic: 'እንደምን አመሸህ' };
  }
}

/**
 * Check if today is an Ethiopian holiday
 */
export function getEthiopianHoliday(date: Date): string | null {
  const ethDate = gregorianToEthiopian(date);

  // Major Ethiopian holidays (simplified)
  const holidays: { [key: string]: string } = {
    '1-1': 'Enkutatash (Ethiopian New Year)',
    '1-17': 'Meskel (Finding of the True Cross)',
    '3-2': 'Adwa Victory Day',
    '9-1': 'Ethiopian Christmas (Genna)',
    '10-11': 'Timkat (Epiphany)',
    '5-27': 'Downfall of Derg'
  };

  const key = `${ethDate.month}-${ethDate.day}`;
  return holidays[key] || null;
}

/**
 * Convert Ethiopian numerals to Amharic script
 */
export function toAmharicNumerals(num: number): string {
  const amharicNumerals = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
  const amharicTens = ['፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];
  const amharicHundred = '፻';
  const amharicThousand = '፲፻';

  if (num < 1 || num > 9999) {
    return num.toString(); // fallback for numbers outside range
  }

  let result = '';

  // Thousands
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    if (thousands === 1) {
      result += amharicThousand;
    } else {
      result += amharicNumerals[thousands - 1] + amharicThousand;
    }
    num %= 1000;
  }

  // Hundreds
  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    if (hundreds === 1) {
      result += amharicHundred;
    } else {
      result += amharicNumerals[hundreds - 1] + amharicHundred;
    }
    num %= 100;
  }

  // Tens
  const tens = Math.floor(num / 10);
  if (tens > 0) {
    result += amharicTens[tens - 1];
    num %= 10;
  }

  // Ones
  if (num > 0) {
    result += amharicNumerals[num - 1];
  }

  return result;
}
