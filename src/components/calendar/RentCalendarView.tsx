import React, { useState } from 'react';
import { Property, PaymentRecord, MasterRentPayment, ExpenseRecord } from '../../types';
import { formatCurrency, formatDate, getDaysOverdue, APP_CURRENT_DATE } from '../../utils/formatters';
import { 
  ETHIOPIC_MONTHS, 
  ETHIOPIC_DAYS_OF_WEEK, 
  toEthiopicDate, 
  fromEthiopicDate, 
  getDaysInEthMonth, 
  getEthMonthFirstDayOfWeek,
  ethMonthToGregorianMonthYear
} from '../../utils/ethiopianCalendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock, Wrench, ShieldCheck, User } from 'lucide-react';

interface RentCalendarViewProps {
  properties: Property[];
  payments: PaymentRecord[];
  masterPayments: MasterRentPayment[];
  expenses: ExpenseRecord[];
  onOpenRecordPayment: (unitId: string) => void;
  onOpenRecordMasterPayment: (propertyId: string) => void;
  onNavigateToReminders: () => void;
}

export const RentCalendarView: React.FC<RentCalendarViewProps> = ({
  properties,
  payments,
  masterPayments,
  expenses,
  onOpenRecordPayment,
  onOpenRecordMasterPayment,
  onNavigateToReminders,
}) => {
  // Ethiopian Calendar state: Currently 2019 E.C., Month 2 (ጥቅምት / Tikimt)
  const [ethYear, setEthYear] = useState<number>(2019);
  const [ethMonth, setEthMonth] = useState<number>(2); // 2 = Tikimt (October)
  const [calendarViewMode, setCalendarViewMode] = useState<'grid' | 'agenda'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'subtenants' | 'master_owner' | 'maintenance'>('all');

  const currentMonthObj = ETHIOPIC_MONTHS.find(m => m.index === ethMonth) || ETHIOPIC_MONTHS[1];

  const handlePrevMonth = () => {
    if (ethMonth === 1) {
      setEthMonth(13);
      setEthYear(ethYear - 1);
    } else {
      setEthMonth(ethMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (ethMonth === 13) {
      setEthMonth(1);
      setEthYear(ethYear + 1);
    } else {
      setEthMonth(ethMonth + 1);
    }
  };

  const daysInEthMonth = getDaysInEthMonth(ethYear, ethMonth);
  const firstDayOfWeek = getEthMonthFirstDayOfWeek(ethYear, ethMonth);
  const currentGregMonthYear = ethMonthToGregorianMonthYear(ethYear, ethMonth);

  // Today in Ethiopian Calendar: Tikimt 1, 2019 E.C.
  const todayEth = toEthiopicDate(APP_CURRENT_DATE);

  interface CalendarEvent {
    id: string;
    ethDay: number;
    type: 'subtenant_rent' | 'master_rent' | 'maintenance';
    title: string;
    subtitle: string;
    amount: number;
    status: 'paid' | 'overdue' | 'pending';
    unitId?: string;
    propertyId?: string;
  }

  const events: CalendarEvent[] = [];

  // 1. Subtenant Class / Room rent due dates in this Ethiopian month
  if (categoryFilter === 'all' || categoryFilter === 'subtenants') {
    properties.forEach(prop => {
      prop.units.forEach(unit => {
        const day = unit.rentDueDay; // Due on Ethiopian day (e.g. 1st or 5th)
        const gregDateStr = fromEthiopicDate(ethYear, ethMonth, Math.min(day, daysInEthMonth));
        const pay = payments.find(p => p.unitId === unit.id && p.monthYear === currentGregMonthYear);

        let status: 'paid' | 'overdue' | 'pending' = 'pending';
        if (pay?.status === 'paid') {
          status = 'paid';
        } else {
          const isPastDue = getDaysOverdue(gregDateStr, APP_CURRENT_DATE) > 0;
          status = isPastDue ? 'overdue' : 'pending';
        }

        events.push({
          id: `rent-${unit.id}-${day}`,
          ethDay: day,
          type: 'subtenant_rent',
          title: unit.name,
          subtitle: `${prop.name} · ${unit.tenant?.name || 'Vacant'}`,
          amount: unit.rentAmount,
          status,
          unitId: unit.id,
          propertyId: prop.id,
        });
      });
    });
  }

  // 2. Master Rent due dates (to House Owners)
  if (categoryFilter === 'all' || categoryFilter === 'master_owner') {
    properties.forEach(prop => {
      const day = prop.masterRentDueDay;
      const gregDateStr = fromEthiopicDate(ethYear, ethMonth, Math.min(day, daysInEthMonth));
      const masterPay = masterPayments.find(p => p.propertyId === prop.id && p.monthYear === currentGregMonthYear);

      let status: 'paid' | 'overdue' | 'pending' = 'pending';
      if (masterPay?.status === 'paid') {
        status = 'paid';
      } else {
        const isPastDue = getDaysOverdue(gregDateStr, APP_CURRENT_DATE) > 0;
        status = isPastDue ? 'overdue' : 'pending';
      }

      events.push({
        id: `master-${prop.id}-${day}`,
        ethDay: day,
        type: 'master_rent',
        title: `ለባለንብረቱ የሚከፈል: ${prop.name}`,
        subtitle: `ባለንብረት: ${prop.masterLandlord.name} (${formatCurrency(prop.masterRentAmount)})`,
        amount: prop.masterRentAmount,
        status,
        propertyId: prop.id,
      });
    });
  }

  // 3. Maintenance incurred mapped to Ethiopian Calendar
  if (categoryFilter === 'all' || categoryFilter === 'maintenance') {
    expenses.forEach(exp => {
      const expEth = toEthiopicDate(exp.date);
      if (expEth.year === ethYear && expEth.month === ethMonth) {
        const prop = properties.find(p => p.id === exp.propertyId);
        const unit = prop?.units.find(u => u.id === exp.unitId);

        events.push({
          id: `exp-${exp.id}`,
          ethDay: expEth.day,
          type: 'maintenance',
          title: exp.description,
          subtitle: `${prop?.name} (${exp.unitId === 'whole_property' ? 'ጠቅላላ ቤት' : unit?.name})`,
          amount: exp.amount,
          status: 'paid',
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header with Ethiopian Months */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              የኢትዮጵያ ዘመን አቆጣጠር
            </span>
            <h1 className="text-xl font-bold text-slate-900">Ethiopian Calendar & Deadlines</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            በኢትዮጵያ ዘመን አቆጣጠር የኪራይ ቀኖችን እና የባለንብረት ክፍያዎችን መከታተያ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCalendarViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                calendarViewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Grid (የወር ገጽታ)
            </button>
            <button
              onClick={() => setCalendarViewMode('agenda')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                calendarViewMode === 'agenda' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda (ዝርዝር)
            </button>
          </div>

          {/* Ethiopian Month Navigation */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
              title="Previous Ethiopian Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 whitespace-nowrap min-w-[140px] text-center font-mono">
              {currentMonthObj.am} {ethYear} ዓ.ም ({currentMonthObj.en})
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
              title="Next Ethiopian Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              categoryFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            ሁሉም ቀኖች (All)
          </button>
          <button
            onClick={() => setCategoryFilter('subtenants')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              categoryFilter === 'subtenants' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            የተከራይ ኪራይ (Subtenant)
          </button>
          <button
            onClick={() => setCategoryFilter('master_owner')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              categoryFilter === 'master_owner' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            ለባለንብረት የሚከፈል (To Owner)
          </button>
          <button
            onClick={() => setCategoryFilter('maintenance')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              categoryFilter === 'maintenance' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            ጥገናና ወጪዎች (Repairs)
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>ለባለንብረት (Owner Master Rent)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>የተከፈለ የተከራይ ኪራይ</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>ያልተከፈለ (Overdue)</span>
          </span>
          <span className="text-slate-400 font-mono">
            ዛሬ: {todayEth.monthNameAm} {todayEth.day} ቀን {todayEth.year} ዓ.ም
          </span>
        </div>
      </div>

      {/* Grid Mode (30 Days Ethiopian Month Grid) */}
      {calendarViewMode === 'grid' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Weekday Headers in Amharic & English */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-semibold text-slate-700 py-2.5">
            {ETHIOPIC_DAYS_OF_WEEK.map(d => (
              <span key={d.en}>
                <strong className="block text-slate-900">{d.am}</strong>
                <span className="text-[10px] text-slate-400 font-normal">{d.shortEn}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {/* Blank offset cells for starting day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[115px] bg-slate-50/40 p-2" />
            ))}

            {/* Ethiopian Days 1 to 30 */}
            {Array.from({ length: daysInEthMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = ethYear === todayEth.year && ethMonth === todayEth.month && dayNum === todayEth.day;
              const dayEvents = events.filter(e => e.ethDay === dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[115px] p-2 transition-colors relative flex flex-col justify-between ${
                    isToday ? 'bg-amber-50/50 ring-1 ring-amber-300' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono font-medium inline-flex items-center justify-center rounded-md ${
                        isToday
                          ? 'w-6 h-6 bg-slate-900 text-white font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-amber-800 font-bold uppercase">
                        ዛሬ (Today)
                      </span>
                    )}
                  </div>

                  {/* Day Events list */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map(event => {
                      if (event.type === 'master_rent') {
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (event.propertyId) onOpenRecordMasterPayment(event.propertyId);
                            }}
                            className="p-1 rounded text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-200 leading-tight cursor-pointer hover:scale-[1.02] transition-transform"
                            title={event.title}
                          >
                            <div className="font-bold truncate flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                              <span className="truncate">ባለንብረት: {event.title}</span>
                            </div>
                            <div className="font-mono tabular-nums text-slate-800 font-bold mt-0.5">
                              {formatCurrency(event.amount)}
                            </div>
                          </div>
                        );
                      }

                      if (event.type === 'subtenant_rent') {
                        const isOverdue = event.status === 'overdue';
                        const isPaid = event.status === 'paid';

                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (event.unitId) onOpenRecordPayment(event.unitId);
                            }}
                            className={`p-1 rounded text-[10px] border leading-tight cursor-pointer hover:scale-[1.02] transition-transform ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                            title={`${event.title} - ${event.subtitle}`}
                          >
                            <div className="font-semibold truncate">{event.title}</div>
                            <div className="font-mono tabular-nums flex items-center justify-between mt-0.5">
                              <span>{formatCurrency(event.amount)}</span>
                              <span>{isPaid ? 'ተከፍሏል' : isOverdue ? 'ያልተከፈለ' : 'ደርሷል'}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={event.id}
                          className="p-1 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200 leading-tight"
                        >
                          <div className="font-semibold truncate flex items-center gap-1">
                            <Wrench className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                          <div className="font-mono tabular-nums text-slate-700">
                            {formatCurrency(event.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda Mode */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            የ{currentMonthObj.am} {ethYear} ዓ.ም የቀጠሮ ዝርዝር (Agenda)
          </h2>

          <div className="space-y-3">
            {events.sort((a, b) => a.ethDay - b.ethDay).map(event => (
              <div
                key={event.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">{currentMonthObj.am}</span>
                    <span className="text-sm font-bold font-mono text-slate-900">ቀን {event.ethDay}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {event.type === 'master_rent' && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                      <span>{event.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500">{event.subtitle}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block">
                      {formatCurrency(event.amount)}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      event.status === 'paid' ? 'text-emerald-600' : event.status === 'overdue' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {event.status === 'paid' ? 'ተከፍሏል (Paid)' : event.status === 'overdue' ? 'ያልተከፈለ (Overdue)' : 'ክፍያ ይጠበቃል'}
                    </span>
                  </div>

                  {event.type === 'master_rent' ? (
                    <button
                      onClick={() => event.propertyId && onOpenRecordMasterPayment(event.propertyId)}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
                    >
                      ክፍያ ፈጽም (Pay Owner)
                    </button>
                  ) : event.type === 'subtenant_rent' && event.unitId ? (
                    <button
                      onClick={() => onOpenRecordPayment(event.unitId!)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      ኪራይ መዝግብ (Record Rent)
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
