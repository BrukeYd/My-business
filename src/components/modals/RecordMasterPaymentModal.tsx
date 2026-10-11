import React, { useState, useEffect } from 'react';
import { Property, MasterRentPayment, PaymentMethod } from '../../types';
import { formatCurrency, APP_CURRENT_DATE } from '../../utils/formatters';
import { ETHIOPIC_MONTHS, ethMonthToGregorianMonthYear, fromEthiopicDate } from '../../utils/ethiopianCalendar';
import { EthDatePicker } from '../common/EthDatePicker';
import { X, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RecordMasterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  masterPayments: MasterRentPayment[];
  onSaveMasterPayment: (payment: MasterRentPayment) => void;
  preselectedPropertyId?: string;
}

export const RecordMasterPaymentModal: React.FC<RecordMasterPaymentModalProps> = ({
  isOpen,
  onClose,
  properties,
  masterPayments,
  onSaveMasterPayment,
  preselectedPropertyId,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paidDate, setPaidDate] = useState<string>(APP_CURRENT_DATE);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [ethYear, setEthYear] = useState<number>(2019);
  const [ethMonth, setEthMonth] = useState<number>(2);
  const monthYear = ethMonthToGregorianMonthYear(ethYear, ethMonth);

  useEffect(() => {
    if (properties.length > 0) {
      if (preselectedPropertyId) {
        setSelectedPropertyId(preselectedPropertyId);
      } else {
        setSelectedPropertyId(properties[0].id);
      }
    }
  }, [properties, preselectedPropertyId, isOpen]);

  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  useEffect(() => {
    if (activeProperty) {
      setAmountPaid(activeProperty.masterRentAmount);
    }
  }, [activeProperty, monthYear]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || amountPaid <= 0) return;

    const existing = masterPayments.find(p => p.propertyId === activeProperty.id && p.monthYear === monthYear);

    const record: MasterRentPayment = {
      id: existing ? existing.id : `master-pay-${Date.now()}`,
      propertyId: activeProperty.id,
      monthYear,
      dueDate: fromEthiopicDate(ethYear, ethMonth, activeProperty.masterRentDueDay),
      amountDue: activeProperty.masterRentAmount,
      amountPaid: Number(amountPaid),
      paidDate,
      status: Number(amountPaid) >= activeProperty.masterRentAmount ? 'paid' : 'pending',
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    };

    onSaveMasterPayment(record);
    onClose();
  };

  const selectedMonthObj = ETHIOPIC_MONTHS.find(m => m.index === ethMonth) || ETHIOPIC_MONTHS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Record Master Rent Paid to Owner</h2>
            <p className="text-xs text-slate-500 mt-0.5">ለዋናው ባለንብረት የተከፈለ ኪራይ መመዝገቢያ (የኢትዮጵያ ዘመን አቆጣጠር)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Leased Whole House</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · Master Rent: {formatCurrency(p.masterRentAmount)}/mo
                </option>
              ))}
            </select>
          </div>

          {activeProperty?.masterLandlord && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-800 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>House Owner: {activeProperty.masterLandlord.name}</span>
                </span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(activeProperty.masterRentAmount)}/mo
                </span>
              </div>
              <div className="text-slate-600 text-[11px] space-y-0.5">
                <p>Phone: {activeProperty.masterLandlord.phone} · Due Day: ቀን {activeProperty.masterRentDueDay}</p>
                {activeProperty.masterLandlord.accountDetails && (
                  <p className="font-mono text-slate-500">{activeProperty.masterLandlord.accountDetails}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                የኪራይ ወር / Ethiopian Rent Period
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={ethMonth}
                  onChange={(e) => setEthMonth(parseInt(e.target.value, 10))}
                  className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {ETHIOPIC_MONTHS.map(m => (
                    <option key={m.index} value={m.index}>
                      {m.am} ({m.en})
                    </option>
                  ))}
                </select>
                <select
                  value={ethYear}
                  onChange={(e) => setEthYear(parseInt(e.target.value, 10))}
                  className="px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
                >
                  {[2018, 2019, 2020].map(y => (
                    <option key={y} value={y}>{y} ዓ.ም</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount Paid to Owner</label>
              <input
                type="number"
                min="1"
                step="1"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-rose-700"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {formatCurrency(amountPaid || 0)}
              </span>
            </div>
          </div>

          <div>
            <EthDatePicker
              label="የተከፈለበት ቀን / Payment Date"
              value={paidDate}
              onChange={setPaidDate}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg capitalize"
              >
                <option value="bank_transfer">CBE / Telebirr / Bank Transfer</option>
                <option value="check">Check (ቼክ)</option>
                <option value="cash">Cash (ጥሬ ገንዘብ)</option>
                <option value="other">Other Wire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Reference #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. CBE-TX-880291"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Confirmation</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid on time to house owner"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Confirm Master Rent Paid (ክፍያውን መዝግብ)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
