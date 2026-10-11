import React, { useState } from 'react';
import { Property, PaymentRecord, MasterRentPayment, ExpenseRecord } from '../../types';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters';
import { EthMonthPicker } from '../common/EthMonthPicker';
import { X, Printer, Download, Building2, TrendingUp, DollarSign, Wrench, ShieldCheck } from 'lucide-react';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  payments: PaymentRecord[];
  masterPayments: MasterRentPayment[];
  expenses: ExpenseRecord[];
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  properties,
  payments,
  masterPayments,
  expenses,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  if (!isOpen) return null;

  // Subtenant payments for month
  const monthPayments = payments.filter(p => p.monthYear === selectedMonth);
  const totalSubtenantCollected = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalSubtenantExpected = monthPayments.reduce((sum, p) => sum + p.amountDue, 0);
  const totalOverdueSubtenant = Math.max(0, totalSubtenantExpected - totalSubtenantCollected);

  // Master payments for month
  const monthMasterPayments = masterPayments.filter(p => p.monthYear === selectedMonth);
  const totalMasterRentExpected = properties.reduce((sum, p) => sum + p.masterRentAmount, 0);
  const totalMasterRentPaid = monthMasterPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Maintenance & shared WiFi expenses
  const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const totalMaintenance = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Arbitrage Spread & Net Profit
  const grossArbitrageSpread = totalSubtenantCollected - totalMasterRentPaid;
  const netArbitrageProfit = grossArbitrageSpread - totalMaintenance;
  const profitMarginPercent = totalSubtenantCollected > 0 ? Math.round((netArbitrageProfit / totalSubtenantCollected) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csv = 'Hearthstone Sublease Rental Arbitrage Statement\n';
    csv += `Period: ${formatMonthYear(selectedMonth)}\n\n`;
    csv += 'Summary Metric,Amount\n';
    csv += `Total Subtenant Rent Collected,${totalSubtenantCollected}\n`;
    csv += `Total Master Rent Paid to House Owners,${totalMasterRentPaid}\n`;
    csv += `Gross Arbitrage Spread,${grossArbitrageSpread}\n`;
    csv += `Repairs & Shared Utilities,${totalMaintenance}\n`;
    csv += `Net Take-Home Arbitrage Profit,${netArbitrageProfit}\n`;
    csv += `Profit Margin,${profitMarginPercent}%\n\n`;

    csv += 'House-by-House Arbitrage Breakdown\n';
    csv += 'House Name,Owner,Classes Count,Subtenant Rent,Master Rent to Owner,Repairs/Costs,Net House Profit\n';

    properties.forEach(p => {
      const pPayments = monthPayments.filter(pay => pay.propertyId === p.id);
      const pCollected = pPayments.reduce((s, pay) => s + pay.amountPaid, 0);
      const pMasterRent = p.masterRentAmount;
      const pExpenses = monthExpenses.filter(e => e.propertyId === p.id);
      const pMaint = pExpenses.reduce((s, e) => s + e.amount, 0);
      const pNet = pCollected - pMasterRent - pMaint;
      csv += `"${p.name}","${p.masterLandlord.name}",${p.units.length},${pCollected},${pMasterRent},${pMaint},${pNet}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hearthstone-arbitrage-statement-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 no-print">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Rental Arbitrage Financial Statement</h2>
            <p className="text-xs text-slate-500 mt-0.5">Whole-house master lease obligations vs. subleased class revenues</p>
          </div>
          <div className="flex items-center gap-2">
            <EthMonthPicker
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statement Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Hearthstone Sublease Arbitrage</span>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">Portfolio Arbitrage Profit & Loss</h1>
              <p className="text-xs text-slate-500 mt-0.5">Period: {formatMonthYear(selectedMonth)}</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500">
              <p>Rented Houses: {properties.length} Whole Houses</p>
              <p>Subleased Classes: {properties.reduce((s, p) => s + p.units.length, 0)} Units</p>
            </div>
          </div>

          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Subtenant Rents Collected</span>
              <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
                {formatCurrency(totalSubtenantCollected)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">of {formatCurrency(totalSubtenantExpected)} expected</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Master Rent to Owners</span>
              <span className="text-lg font-bold font-mono tabular-nums text-rose-700 mt-1 block">
                -{formatCurrency(totalMasterRentPaid)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Paid to {properties.length} house owners</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Repairs & WiFi Costs</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-800 mt-1 block">
                -{formatCurrency(totalMaintenance)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{monthExpenses.length} expense items</span>
            </div>

            <div className="p-3.5 bg-slate-900 text-white rounded-xl">
              <span className="text-[11px] font-medium text-slate-300 block">Net Arbitrage Profit</span>
              <span className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
                {formatCurrency(netArbitrageProfit)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{profitMarginPercent}% net margin</span>
            </div>
          </div>

          {/* House-by-House Arbitrage Spread Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              House-by-House Arbitrage Margin & Profit
            </h3>
            <div className="space-y-3">
              {properties.map(property => {
                const propSubPayments = monthPayments.filter(p => p.propertyId === property.id);
                const propSubDue = property.units.reduce((s, u) => s + u.rentAmount, 0);
                const propSubPaid = propSubPayments.reduce((s, p) => s + p.amountPaid, 0);
                const propMasterRent = property.masterRentAmount;

                const propExpenses = monthExpenses.filter(e => e.propertyId === property.id);
                const propMaint = propExpenses.reduce((s, e) => s + e.amount, 0);
                const propNet = propSubPaid - propMasterRent - propMaint;

                return (
                  <div key={property.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{property.name}</h4>
                        <p className="text-xs text-slate-500">
                          Owner: {property.masterLandlord.name} · {property.units.length} Subleased Classes/Rooms
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Net House Profit</span>
                        <span className="text-sm font-bold font-mono tabular-nums text-emerald-700">
                          {formatCurrency(propNet)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Master Rent to Owner</span>
                        <span className="font-semibold font-mono tabular-nums text-rose-700">
                          -{formatCurrency(propMasterRent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Subtenant Collected</span>
                        <span className="font-semibold font-mono tabular-nums text-emerald-700">
                          +{formatCurrency(propSubPaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Gross Spread</span>
                        <span className="font-semibold font-mono tabular-nums text-slate-900">
                          +{formatCurrency(propSubPaid - propMasterRent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Maintenance / WiFi</span>
                        <span className="font-semibold font-mono tabular-nums text-slate-700">
                          -{formatCurrency(propMaint)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
