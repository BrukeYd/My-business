import React, { useState } from 'react';
import { Property, PaymentRecord, PaymentStatus } from '../../types';
import { formatCurrency, formatDate, getDaysOverdue, APP_CURRENT_DATE, formatMonthYear } from '../../utils/formatters';
import { buildWhatsAppUrl, buildSmsUrl } from '../../utils/reminders';
import { EthMonthPicker } from '../common/EthMonthPicker';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  MessageSquare, 
  Send, 
  Search,
  Filter,
  Check
} from 'lucide-react';

interface PaymentsViewProps {
  properties: Property[];
  payments: PaymentRecord[];
  onOpenRecordPayment: (unitId?: string) => void;
  onQuickMarkPaid: (paymentId: string) => void;
  onNavigateToReminders: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  properties,
  payments,
  onOpenRecordPayment,
  onQuickMarkPaid,
  onNavigateToReminders,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter payments for month
  const monthPayments = payments.filter(p => p.monthYear === selectedMonth);

  // Financial aggregates
  const totalRentDue = monthPayments.reduce((s, p) => s + p.amountDue, 0);
  const totalRentPaid = monthPayments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOverdue = Math.max(0, totalRentDue - totalRentPaid);
  const totalLateFees = monthPayments.reduce((s, p) => s + p.lateFeeApplied, 0);

  // Filtered payment records list
  const filteredPayments = monthPayments.filter(payment => {
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const prop = properties.find(p => p.id === payment.propertyId);
      const unit = prop?.units.find(u => u.id === payment.unitId);
      const q = searchQuery.toLowerCase();
      const matchProp = prop?.name.toLowerCase().includes(q);
      const matchUnit = unit?.name.toLowerCase().includes(q);
      const matchTenant = unit?.tenant?.name.toLowerCase().includes(q);
      return matchProp || matchUnit || matchTenant;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rent Payments & Overdue Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor tenant rent days, overdue balances, late fees, and log received transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EthMonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
          <button
            onClick={() => onOpenRecordPayment()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Overdue & Collection Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Rent Expected</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {formatCurrency(totalRentDue)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{monthPayments.length} rental units</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Actual Rent Collected</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            {formatCurrency(totalRentPaid)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {totalRentDue > 0 ? Math.round((totalRentPaid / totalRentDue) * 100) : 100}% collection rate
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Overdue / Outstanding</span>
          <span className={`text-xl font-bold font-mono tabular-nums mt-1 block ${totalOverdue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatCurrency(totalOverdue)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Uncollected rent balance</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Late Fees Applied</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-1 block">
            {formatCurrency(totalLateFees)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Automatic penalty tracking</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'overdue', 'partial', 'paid'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All Units' : tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search house, unit, tenant..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Rental Property & Unit</th>
                <th className="py-3 px-4 font-semibold">Tenant Contact</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Rent Due</th>
                <th className="py-3 px-4 font-semibold">Amount Paid</th>
                <th className="py-3 px-4 font-semibold">Balance Due</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment records match this filter for {formatMonthYear(selectedMonth)}.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  const property = properties.find(p => p.id === payment.propertyId);
                  const unit = property?.units.find(u => u.id === payment.unitId);
                  const balanceDue = payment.amountDue - payment.amountPaid;
                  const overdueDays = getDaysOverdue(payment.dueDate, APP_CURRENT_DATE);
                  const isOverdue = balanceDue > 0 && overdueDays > 0;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Property & Unit */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{property?.name}</span>
                        <span className="text-[11px] text-slate-500">{unit?.name}</span>
                      </td>

                      {/* Tenant */}
                      <td className="py-3.5 px-4">
                        {unit?.tenant ? (
                          <div>
                            <span className="font-medium text-slate-800 block">{unit.tenant.name}</span>
                            <span className="text-[11px] text-slate-500">{unit.tenant.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">No active lease</span>
                        )}
                      </td>

                      {/* Due Date & Overdue Days */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono tabular-nums text-slate-700 block">{formatDate(payment.dueDate)}</span>
                        {isOverdue ? (
                          <span className="text-[10px] text-rose-600 font-semibold">{overdueDays} days late</span>
                        ) : payment.paidDate ? (
                          <span className="text-[10px] text-slate-400">Paid {formatDate(payment.paidDate)}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Upcoming</span>
                        )}
                      </td>

                      {/* Rent Due */}
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-900 font-medium">
                        {formatCurrency(payment.amountDue)}
                        {payment.lateFeeApplied > 0 && (
                          <span className="text-[10px] text-amber-600 block">+{formatCurrency(payment.lateFeeApplied)} fee</span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-emerald-700">
                        {formatCurrency(payment.amountPaid)}
                        {payment.paymentMethod && (
                          <span className="text-[10px] text-slate-400 block capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        )}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 font-mono tabular-nums font-bold">
                        {balanceDue > 0 ? (
                          <span className="text-rose-600">{formatCurrency(balanceDue)}</span>
                        ) : (
                          <span className="text-slate-400">$0</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {payment.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid in Full</span>
                          </span>
                        ) : payment.status === 'partial' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Partial ({Math.round((payment.amountPaid / payment.amountDue) * 100)}%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {balanceDue > 0 && (
                            <>
                              <button
                                onClick={() => onQuickMarkPaid(payment.id)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                                title="Mark full rent paid now"
                              >
                                <Check className="w-3 h-3" />
                                <span>Mark Paid</span>
                              </button>

                              {unit?.tenant && (
                                <a
                                  href={buildWhatsAppUrl(
                                    unit.tenant.phone,
                                    `Hi ${unit.tenant.name}, rent of ${formatCurrency(balanceDue)} for ${unit.name} is past due. Please submit payment today.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Remind</span>
                                </a>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => onOpenRecordPayment(payment.unitId)}
                            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
