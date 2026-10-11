import React from 'react';
import { Property, PaymentRecord, MasterRentPayment, ExpenseRecord, ViewTab } from '../../types';
import { formatCurrency, formatDate, getDaysOverdue, APP_CURRENT_DATE } from '../../utils/formatters';
import { buildWhatsAppUrl } from '../../utils/reminders';
import { 
  Building2, 
  DollarSign, 
  AlertCircle, 
  Wrench, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Send,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface OverviewDashboardProps {
  properties: Property[];
  payments: PaymentRecord[];
  masterPayments: MasterRentPayment[];
  expenses: ExpenseRecord[];
  onNavigateTab: (tab: ViewTab) => void;
  onOpenRecordPayment: (unitId?: string) => void;
  onOpenRecordMasterPayment: (propertyId?: string) => void;
  onOpenRecordExpense: (unitId?: string, propertyId?: string) => void;
  onOpenFinancialReport: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  properties,
  payments,
  masterPayments,
  expenses,
  onNavigateTab,
  onOpenRecordPayment,
  onOpenRecordMasterPayment,
  onOpenRecordExpense,
  onOpenFinancialReport,
}) => {
  const currentMonth = '2026-10';

  // Subtenant payments (Income from classes/rooms)
  const monthPayments = payments.filter(p => p.monthYear === currentMonth);
  const totalSubtenantDue = monthPayments.reduce((s, p) => s + p.amountDue, 0);
  const totalSubtenantCollected = monthPayments.reduce((s, p) => s + p.amountPaid, 0);
  const totalSubtenantOverdue = Math.max(0, totalSubtenantDue - totalSubtenantCollected);

  // Master rent payments (Expense paid to house owners for whole houses)
  const monthMasterPayments = masterPayments.filter(p => p.monthYear === currentMonth);
  const totalMasterRentExpected = properties.reduce((s, p) => s + p.masterRentAmount, 0);
  const totalMasterRentPaid = monthMasterPayments.reduce((s, p) => s + p.amountPaid, 0);
  const masterRentOverdue = Math.max(0, totalMasterRentExpected - totalMasterRentPaid);

  // Unit and house maintenance, repairs & shared wifi/cleaning expenses
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalMaintenanceMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Rental Arbitrage Calculations:
  // Gross Spread = Subtenant Rent Collected - Master Rent Paid to Owner
  const grossArbitrageSpread = totalSubtenantCollected - totalMasterRentPaid;
  // Net Profit = Gross Spread - Repairs & Utilities
  const netArbitrageProfit = grossArbitrageSpread - totalMaintenanceMonth;

  const totalClasses = properties.reduce((s, p) => s + p.units.length, 0);
  const occupiedClasses = properties.reduce(
    (s, p) => s + p.units.filter(u => u.status === 'occupied' && u.tenant).length,
    0
  );

  // Overdue subtenants needing urgent collection
  const overdueSubtenants = monthPayments.filter(
    p => p.status === 'overdue' || (p.amountDue > p.amountPaid && getDaysOverdue(p.dueDate, APP_CURRENT_DATE) > 0)
  );

  return (
    <div className="space-y-6">
      {/* Arbitrage Business Model Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Sublease Rental Arbitrage
              </span>
              <span className="text-xs text-slate-400">Master Leased Houses</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ጥቅምት 2019 ዓ.ም Net Arbitrage Profit: <span className="font-mono tabular-nums text-emerald-400">{formatCurrency(netArbitrageProfit)}</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              You rent <strong>{properties.length} whole houses</strong> from property owners and sublease <strong>{totalClasses} separate classes & rooms</strong> to subtenants for monthly arbitrage profit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenRecordPayment()}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              + Record Subtenant Rent
            </button>
            <button
              onClick={() => onOpenRecordMasterPayment()}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Pay House Owner
            </button>
            <button
              onClick={onOpenFinancialReport}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Arbitrage P&L
            </button>
          </div>
        </div>

        {/* Real-time Arbitrage Flow Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">1. Subtenant Rents Collected</span>
            <span className="text-base font-bold font-mono tabular-nums text-white mt-0.5 block">
              {formatCurrency(totalSubtenantCollected)}
            </span>
            <span className="text-[10px] text-slate-400">of {formatCurrency(totalSubtenantDue)} expected</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">2. Master Rent Paid to Owners</span>
            <span className="text-base font-bold font-mono tabular-nums text-rose-300 mt-0.5 block">
              -{formatCurrency(totalMasterRentPaid)}
            </span>
            <span className="text-[10px] text-slate-400">{properties.length} whole houses</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">3. Repairs & Shared WiFi</span>
            <span className="text-base font-bold font-mono tabular-nums text-amber-300 mt-0.5 block">
              -{formatCurrency(totalMaintenanceMonth)}
            </span>
            <span className="text-[10px] text-slate-400">{monthExpenses.length} expense items</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">4. Net Take-Home Spread</span>
            <span className="text-base font-bold font-mono tabular-nums text-emerald-400 mt-0.5 block">
              {formatCurrency(netArbitrageProfit)}
            </span>
            <span className="text-[10px] text-emerald-300/80">
              {totalSubtenantCollected > 0 ? Math.round((netArbitrageProfit / totalSubtenantCollected) * 100) : 0}% net profit margin
            </span>
          </div>
        </div>
      </div>

      {/* Urgency Alert for Overdue Class Subtenants */}
      {overdueSubtenants.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-950">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {overdueSubtenants.length} Subtenant {overdueSubtenants.length === 1 ? 'is' : 'are'} Past Due on Room Rent
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Total uncollected balance is <strong className="font-mono tabular-nums">{formatCurrency(totalSubtenantOverdue)}</strong>. Send automated WhatsApp or SMS reminders directly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onNavigateTab('reminders')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-900 text-amber-50 rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminders</span>
              </button>
              <button
                onClick={() => onNavigateTab('payments')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <span>Subtenant Ledger</span>
              </button>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {overdueSubtenants.map(p => {
              const prop = properties.find(pr => pr.id === p.propertyId);
              const unit = prop?.units.find(u => u.id === p.unitId);
              const remaining = p.amountDue - p.amountPaid;
              const overdueDays = getDaysOverdue(p.dueDate, APP_CURRENT_DATE);

              if (!unit?.tenant) return null;

              const reminderMsg = `Hi ${unit.tenant.name}, rent of ${formatCurrency(remaining)} for ${unit.name} at ${prop?.name} is past due. Please submit payment today. Thank you!`;
              const waUrl = buildWhatsAppUrl(unit.tenant.phone, reminderMsg);

              return (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-white/90 rounded-xl border border-amber-200">
                  <div>
                    <span className="font-semibold text-slate-900 block">{unit.tenant.name}</span>
                    <span className="text-[11px] text-slate-600 block">
                      {unit.name} · <span className="text-rose-600 font-semibold">{overdueDays} days late</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-slate-900">{formatCurrency(remaining)}</span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* House Owners Master Rent Status Card */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Rent Status to House Owners (ጥቅምት 2019 ዓ.ም / Tikimt)
              </h3>
              <p className="text-xs text-slate-500">
                Never forget your whole-house rent deadlines to maintain trust with the property owners
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('master_rents')}
            className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
          >
            <span>View Owner Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {properties.map(property => {
            const masterPay = monthMasterPayments.find(p => p.propertyId === property.id);
            const isPaid = masterPay?.status === 'paid';

            return (
              <div key={property.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block truncate">{property.name}</span>
                  <span className="text-[11px] text-slate-500 block">Owner: {property.masterLandlord.name}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Due on the {property.masterRentDueDay}th of month</span>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block">
                    {formatCurrency(property.masterRentAmount)}
                  </span>
                  {isPaid ? (
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid to Owner
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenRecordMasterPayment(property.id)}
                      className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-0.5 cursor-pointer"
                    >
                      Pay Owner
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leased Houses & Classes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Leased Houses & Subleased Classes
          </h2>
          <button
            onClick={() => onNavigateTab('properties')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Manage All Houses & Classes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {properties.map(property => {
            const propSubPayments = monthPayments.filter(p => p.propertyId === property.id);
            const propSubExpected = property.units.reduce((s, u) => s + u.rentAmount, 0);
            const propSubCollected = propSubPayments.reduce((s, p) => s + p.amountPaid, 0);
            const propSpread = propSubCollected - property.masterRentAmount;

            const propExpenses = monthExpenses.filter(e => e.propertyId === property.id);
            const propMaintTotal = propExpenses.reduce((s, e) => s + e.amount, 0);
            const propNet = propSpread - propMaintTotal;

            return (
              <div key={property.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative h-36 bg-slate-100">
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-medium text-slate-200 uppercase tracking-wider block">
                        Rented Whole House · {property.units.length} Subleased Classes
                      </span>
                      <h3 className="text-sm font-bold text-white truncate">{property.name}</h3>
                    </div>
                  </div>

                  {/* House Arbitrage Spread Box */}
                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Master Rent to Owner:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(property.masterRentAmount)}/mo</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Subtenant Classes Total:</span>
                        <span className="font-mono font-bold text-emerald-700">{formatCurrency(propSubExpected)}/mo</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">Net Arbitrage Spread:</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          +{formatCurrency(propSubExpected - property.masterRentAmount)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Classes list inside house */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-700 block">Classes / Rooms Subleased:</span>
                      {property.units.map(unit => {
                        const unitPay = monthPayments.find(p => p.unitId === unit.id);
                        const isPaid = unitPay?.status === 'paid';
                        const isPartial = unitPay?.status === 'partial';

                        return (
                          <div key={unit.id} className="flex items-center justify-between py-1 text-xs border-b border-slate-100 last:border-none">
                            <div className="truncate mr-2">
                              <span className="font-medium text-slate-800 block truncate">{unit.name}</span>
                              <span className="text-[10px] text-slate-500">{unit.tenant?.name || 'Vacant'}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono tabular-nums font-semibold text-slate-900 block">
                                {formatCurrency(unit.rentAmount)}
                              </span>
                              {isPaid ? (
                                <span className="text-[10px] text-emerald-600 font-medium">Collected</span>
                              ) : isPartial ? (
                                <span className="text-[10px] text-amber-600 font-medium">Partial</span>
                              ) : (
                                <span className="text-[10px] text-rose-600 font-medium">Overdue</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Repairs: <strong className="font-mono text-slate-700">{formatCurrency(propMaintTotal)}</strong>
                  </span>
                  <button
                    onClick={() => onNavigateTab('properties')}
                    className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
