import React from 'react';
import { 
  ETHIOPIC_MONTHS, 
  toEthiopicDate, 
  fromEthiopicDate, 
  getDaysInEthMonth 
} from '../../utils/ethiopianCalendar';

interface EthDatePickerProps {
  value: string; // Stored as ISO YYYY-MM-DD
  onChange: (gregDateStr: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const EthDatePicker: React.FC<EthDatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
}) => {
  const eth = toEthiopicDate(value || '2026-10-11');
  const daysCount = getDaysInEthMonth(eth.year, eth.month);

  const handleYearChange = (newYear: number) => {
    const safeDay = Math.min(eth.day, getDaysInEthMonth(newYear, eth.month));
    const greg = fromEthiopicDate(newYear, eth.month, safeDay);
    onChange(greg);
  };

  const handleMonthChange = (newMonth: number) => {
    const safeDay = Math.min(eth.day, getDaysInEthMonth(eth.year, newMonth));
    const greg = fromEthiopicDate(eth.year, newMonth, safeDay);
    onChange(greg);
  };

  const handleDayChange = (newDay: number) => {
    const greg = fromEthiopicDate(eth.year, eth.month, newDay);
    onChange(greg);
  };

  const handleSetToday = () => {
    onChange('2026-10-11'); // Tikimt 1, 2019 ዓ.ም
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700">
            {label} <span className="text-[10px] text-emerald-700 font-semibold">(የኢትዮጵያ ቀን)</span>
          </label>
          <button
            type="button"
            onClick={handleSetToday}
            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
          >
            ዛሬ / Today (ጥቅምት 1)
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {/* Month Selector */}
        <div>
          <select
            value={eth.month}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
            required={required}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white"
          >
            {ETHIOPIC_MONTHS.map(m => (
              <option key={m.index} value={m.index}>
                {m.am} ({m.en})
              </option>
            ))}
          </select>
        </div>

        {/* Day Selector (1 to 30) */}
        <div>
          <select
            value={eth.day}
            onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
            required={required}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
          >
            {Array.from({ length: daysCount }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                ቀን {i + 1} ({i + 1})
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div>
          <select
            value={eth.year}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            required={required}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white"
          >
            {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(y => (
              <option key={y} value={y}>
                {y} ዓ.ም
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-mono flex items-center justify-between">
        <span className="font-semibold text-slate-800">{eth.formattedAm}</span>
        <span className="text-slate-500">({eth.formattedEn})</span>
      </div>
    </div>
  );
};
