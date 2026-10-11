import { toEthiopicDate, formatEthiopianDate, formatEthCurrency } from './ethiopianCalendar';

// Current Date in Gregorian: 2026-10-11 = Tikimt 1, 2019 E.C. (ጥቅምት 1, 2019 ዓ.ም)
export const APP_CURRENT_DATE = '2026-10-11';

export function formatCurrency(amount: number): string {
  // Ethiopian Birr by default with clean formatting
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)} ETB (ብር)`;
}

export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats date into Ethiopian Calendar:
 * e.g. "ጥቅምት 1, 2019 ዓ.ም (Tikimt 1, 2019)"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const eth = toEthiopicDate(dateStr);
  return `${eth.monthNameAm} ${eth.day}, ${eth.year} ዓ.ም (${eth.monthNameEn} ${eth.day})`;
}

/**
 * Short Ethiopian Date: e.g. "ጥቅምት 1 (Tikimt 1)"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const eth = toEthiopicDate(dateStr);
  return `${eth.monthNameAm} ${eth.day} (${eth.monthNameEn} ${eth.day})`;
}

/**
 * Formats Month and Year in Ethiopian Calendar:
 * e.g. "ጥቅምት 2019 ዓ.ም (Tikimt 2019 E.C.)"
 */
export function formatMonthYear(monthYearStr: string): string {
  if (!monthYearStr) return '';
  const [year, month] = monthYearStr.split('-');
  const dateStr = `${year}-${month}-01`;
  const eth = toEthiopicDate(dateStr);
  return `${eth.monthNameAm} ${eth.year} ዓ.ም (${eth.monthNameEn} ${eth.year} E.C.)`;
}

export function getDaysOverdue(dueDateStr: string, currentDateStr: string = APP_CURRENT_DATE): number {
  const due = new Date(dueDateStr).getTime();
  const current = new Date(currentDateStr).getTime();
  const diffDays = Math.floor((current - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

