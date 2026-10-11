import React, { useState } from 'react';
import { Property, MasterRentPayment } from '../../types';
import { formatCurrency, formatDate, getDaysOverdue, APP_CURRENT_DATE, formatMonthYear } from '../../utils/formatters';
import { EthMonthPicker } from '../common/EthMonthPicker';
import { ShieldCheck, Plus, CheckCircle2, Clock, AlertCircle, Building2, Check } from 'lucide-react';

interface MasterRentsViewProps {
  properties: Property[];
  masterPayments: MasterRentPayment[];
  onOpenRecordMasterPayment: (propertyId?: string) => void;
  onQuickMarkMasterPaid: (paymentId: string) => void;
}

export const MasterRentsView: React.FC<MasterRentsViewProps> = ({
  properties,
  masterPayments,
  onOpenRecordMasterPayment,
  onQuickMarkMasterPaid,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const monthMasterPayments = masterPayments.filter(p => p.monthYear === selectedMonth);

  const totalMasterRentDue = properties.reduce((s, p) => s + p.masterRentAmount, 0);
  const totalMasterRentPaid = monthMasterPayments.reduce((s, p) => s + p.amountPaid, 0);
  const masterRentOutstanding = Math.max(0, totalMasterRentDue - totalMasterRentPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Rent to House Owners</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of your obligations to the property owners of each whole house you lease
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EthMonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
          <button
            onClick={() => onOpenRecordMasterPayment()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Owner Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Master Rent Due</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {formatCurrency(totalMasterRentDue)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{properties.length} rented whole houses</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Master Rent Paid to Owners</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            {formatCurrency(totalMasterRentPaid)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {totalMasterRentDue > 0 ? Math.round((totalMasterRentPaid / totalMasterRentDue) * 100) : 100}% paid for period
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Outstanding to Owners</span>
          <span className={`text-xl font-bold font-mono tabular-nums mt-1 block ${masterRentOutstanding > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {formatCurrency(masterRentOutstanding)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {masterRentOutstanding === 0 ? 'All whole house rents current!' : 'Action required'}
          </span>
        </div>
      </div>

      {/* House Owners Master Rent Cards */}
      <div className="space-y-4">
        {properties.map(property => {
          const masterPay = monthMasterPayments.find(p => p.propertyId === property.id);
          const isPaid = masterPay?.status === 'paid';
          const dueDateStr = `${selectedMonth}-0${property.masterRentDueDay}`;
          const isOverdue = !isPaid && getDaysOverdue(dueDateStr, APP_CURRENT_DATE) > 0;

          return (
            <div key={property.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    Whole House Lease
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{property.name}</h3>
                </div>
                <p className="text-xs text-slate-500">{property.address}, {property.city}, {property.state}</p>
                <div className="pt-2 text-xs text-slate-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-900">House Owner:</span> {property.masterLandlord.name} · {property.masterLandlord.phone}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Payment Method: {property.masterLandlord.paymentMethod}
                    {property.masterLandlord.accountDetails ? ` (${property.masterLandlord.accountDetails})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                <div>
                  <span className="text-[11px] text-slate-500 block">Monthly Master Rent</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(property.masterRentAmount)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Due on {property.masterRentDueDay}th of month</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Status for {formatMonthYear(selectedMonth)}</span>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Paid ({masterPay?.paidDate ? formatDate(masterPay.paidDate) : 'Settled'})</span>
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Overdue to Owner!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs mt-1">
                      <Clock className="w-4 h-4" />
                      <span>Due Soon</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isPaid && (
                    <button
                      onClick={() => onQuickMarkMasterPaid(masterPay?.id || `new-${property.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Paid</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenRecordMasterPayment(property.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
