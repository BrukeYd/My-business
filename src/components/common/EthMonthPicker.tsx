import React from 'react';
import { 
  ETHIOPIC_MONTHS, 
  ethMonthToGregorianMonthYear, 
  gregorianMonthYearToEthMonth 
} from '../../utils/ethiopianCalendar';
import { Calendar } from 'lucide-react';

interface EthMonthPickerProps {
  value: string; // YYYY-MM in Gregorian
  onChange: (monthYearStr: string) => void;
  className?: string;
  showIcon?: boolean;
}

export const EthMonthPicker: React.FC<EthMonthPickerProps> = ({
  value,
  onChange,
  className = '',
  showIcon = true,
}) => {
  const current = gregorianMonthYearToEthMonth(value || '2026-10');

  const handleMonthChange = (newMonth: number) => {
    const gregMonthYear = ethMonthToGregorianMonthYear(current.ethYear, newMonth);
    onChange(gregMonthYear);
  };

  const handleYearChange = (newYear: number) => {
    const gregMonthYear = ethMonthToGregorianMonthYear(newYear, current.ethMonth);
    onChange(gregMonthYear);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs ${className}`}>
      {showIcon && (
        <Calendar className="w-3.5 h-3.5 text-emerald-700 ml-1.5 shrink-0" />
      )}

      {/* Ethiopian Month Dropdown */}
      <select
        value={current.ethMonth}
        onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
        className="px-2 py-1 text-xs font-semibold text-slate-800 bg-transparent rounded hover:bg-slate-50 cursor-pointer focus:outline-none"
        title="የኢትዮጵያ ወር / Ethiopian Month"
      >
        {ETHIOPIC_MONTHS.map(m => (
          <option key={m.index} value={m.index}>
            {m.am} ({m.en})
          </option>
        ))}
      </select>

      <span className="text-slate-300 font-light">/</span>

      {/* Ethiopian Year Dropdown */}
      <select
        value={current.ethYear}
        onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
        className="px-2 py-1 text-xs font-bold font-mono text-slate-900 bg-transparent rounded hover:bg-slate-50 cursor-pointer focus:outline-none"
        title="የኢትዮጵያ ዓመተ ምሕረት / Ethiopian Year"
      >
        {[2017, 2018, 2019, 2020, 2021].map(y => (
          <option key={y} value={y}>
            {y} ዓ.ም
          </option>
        ))}
      </select>
    </div>
  );
};
