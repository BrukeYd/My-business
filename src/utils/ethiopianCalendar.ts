/**
 * Accurate Ethiopian Calendar (የኢትዮጵያ ዘመን አቆጣጠር) Engine
 * Bi-directional conversion between Ethiopian Calendar and Gregorian Calendar
 */

export interface EthiopicDate {
  year: number;
  month: number; // 1 to 13
  day: number;   // 1 to 30 (or 1 to 6 for Pagume)
  monthNameEn: string;
  monthNameAm: string;
  formattedEn: string;
  formattedAm: string;
}

export const ETHIOPIC_MONTHS = [
  { index: 1, en: 'Meskerem', am: 'መስከረም' },
  { index: 2, en: 'Tikimt', am: 'ጥቅምት' },
  { index: 3, en: 'Hidar', am: 'ኅዳር' },
  { index: 4, en: 'Tahsas', am: 'ታኅሣሥ' },
  { index: 5, en: 'Tir', am: 'ጥር' },
  { index: 6, en: 'Yakatit', am: 'የካቲት' },
  { index: 7, en: 'Megabit', am: 'መጋቢት' },
  { index: 8, en: 'Miazia', am: 'ሚያዝያ' },
  { index: 9, en: 'Ginbot', am: 'ግንቦት' },
  { index: 10, en: 'Sene', am: 'ሰኔ' },
  { index: 11, en: 'Hamle', am: 'ሐምሌ' },
  { index: 12, en: 'Nehase', am: 'ነሐሴ' },
  { index: 13, en: 'Pagumē', am: 'ጳጉሜን' },
];

export const ETHIOPIC_DAYS_OF_WEEK = [
  { en: 'Sunday', am: 'እሑድ', shortEn: 'Sun', shortAm: 'እሑ' },
  { en: 'Monday', am: 'ሰኞ', shortEn: 'Mon', shortAm: 'ሰኞ' },
  { en: 'Tuesday', am: 'ማክሰኞ', shortEn: 'Tue', shortAm: 'ማክ' },
  { en: 'Wednesday', am: 'ረቡዕ', shortEn: 'Wed', shortAm: 'ረቡ' },
  { en: 'Thursday', am: 'ሐሙስ', shortEn: 'Thu', shortAm: 'ሐሙ' },
  { en: 'Friday', am: 'ዓርብ', shortEn: 'Fri', shortAm: 'ዓር' },
  { en: 'Saturday', am: 'ቅዳሜ', shortEn: 'Sat', shortAm: 'ቅዳ' },
];

// Gregorian to JDN (Julian Day Number)
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// JDN to Ethiopic
function jdnToEthiopic(jdn: number): { year: number; month: number; day: number } {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

// Ethiopic to JDN
function ethiopicToJDN(year: number, month: number, day: number): number {
  return 1723856 + 365 + 365 * (year - 1) + Math.floor(year / 4) + (month - 1) * 30 + day - 1;
}

// JDN to Gregorian
function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l1 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l1 + 1)) / 1461001);
  const l2 = l1 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l2) / 2447);
  const day = l2 - Math.floor((2447 * j) / 80);
  const l3 = Math.floor(j / 11);
  const month = j + 2 - 12 * l3;
  const year = 100 * (n - 49) + i + l3;
  return { year, month, day };
}

/**
 * Converts a Gregorian date string (YYYY-MM-DD) or Date object to Ethiopian Date
 */
export function toEthiopicDate(input: string | Date): EthiopicDate {
  let gYear: number;
  let gMonth: number;
  let gDay: number;

  if (typeof input === 'string') {
    const parts = input.split('-');
    gYear = parseInt(parts[0], 10);
    gMonth = parseInt(parts[1], 10);
    gDay = parseInt(parts[2], 10);
  } else {
    gYear = input.getFullYear();
    gMonth = input.getMonth() + 1;
    gDay = input.getDate();
  }

  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  const eth = jdnToEthiopic(jdn);

  const monthObj = ETHIOPIC_MONTHS.find(m => m.index === eth.month) || ETHIOPIC_MONTHS[0];

  return {
    year: eth.year,
    month: eth.month,
    day: eth.day,
    monthNameEn: monthObj.en,
    monthNameAm: monthObj.am,
    formattedEn: `${monthObj.en} ${eth.day}, ${eth.year} E.C.`,
    formattedAm: `${monthObj.am} ${eth.day} ቀን ${eth.year} ዓ.ም`,
  };
}

/**
 * Converts Ethiopian date back to Gregorian (YYYY-MM-DD)
 */
export function fromEthiopicDate(year: number, month: number, day: number): string {
  const jdn = ethiopicToJDN(year, month, day);
  const g = jdnToGregorian(jdn);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${g.year}-${pad(g.month)}-${pad(g.day)}`;
}

/**
 * Format date in Ethiopian calendar: e.g. "Tikimt 1, 2019 (ጥቅምት 1)"
 */
export function formatEthiopianDate(gregorianDateStr: string, options: { showAmharic?: boolean; short?: boolean } = {}): string {
  if (!gregorianDateStr) return '';
  const eth = toEthiopicDate(gregorianDateStr);
  if (options.short) {
    return `${eth.monthNameEn} ${eth.day}`;
  }
  if (options.showAmharic !== false) {
    return `${eth.monthNameEn} ${eth.day}, ${eth.year} (${eth.monthNameAm} ${eth.day})`;
  }
  return eth.formattedEn;
}

/**
 * Format Ethiopian Month/Year header, e.g. "Tikimt 2019 (ጥቅምት 2019 ዓ.ም)"
 */
export function formatEthiopianMonthYear(ethYear: number, ethMonth: number): string {
  const m = ETHIOPIC_MONTHS.find(item => item.index === ethMonth) || ETHIOPIC_MONTHS[0];
  return `${m.en} ${ethYear} E.C. · ${m.am} ${ethYear} ዓ.ም`;
}

/**
 * Number of days in an Ethiopian month:
 * Months 1-12 always have 30 days. Month 13 (Pagume) has 5 or 6 (if leap year).
 */
export function getDaysInEthMonth(year: number, month: number): number {
  if (month >= 1 && month <= 12) return 30;
  // Pagume leap year rule: Ethiopian year % 4 === 3 has 6 days
  return year % 4 === 3 ? 6 : 5;
}

/**
 * Get the day of the week for the 1st of an Ethiopian month (0 = Sunday, 1 = Monday ...)
 */
export function getEthMonthFirstDayOfWeek(year: number, month: number): number {
  const gregStr = fromEthiopicDate(year, month, 1);
  const parts = gregStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.getDay();
}

/**
 * Currency formatter supporting Ethiopian Birr (ETB / ብር) and USD ($)
 */
export function formatEthCurrency(amount: number, currency: 'ETB' | 'USD' = 'ETB'): string {
  if (currency === 'ETB') {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)} ETB (ብር)`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts Ethiopian year & month (e.g. 2019, 2 for Tikimt) to Gregorian YYYY-MM
 * based on the middle of the Ethiopian month.
 */
export function ethMonthToGregorianMonthYear(ethYear: number, ethMonth: number): string {
  const gregMiddleDate = fromEthiopicDate(ethYear, ethMonth, 15);
  return gregMiddleDate.substring(0, 7);
}

/**
 * Converts a Gregorian month string YYYY-MM to the primary Ethiopian year & month
 */
export function gregorianMonthYearToEthMonth(monthYear: string): { ethYear: number; ethMonth: number; nameAm: string; nameEn: string } {
  const [y, m] = monthYear.split('-').map(Number);
  const eth = toEthiopicDate(`${y}-${String(m).padStart(2, '0')}-15`);
  return {
    ethYear: eth.year,
    ethMonth: eth.month,
    nameAm: eth.monthNameAm,
    nameEn: eth.monthNameEn,
  };
}
