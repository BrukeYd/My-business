import React, { useState, useEffect } from 'react';
import { Property, PaymentRecord, PaymentMethod } from '../../types';
import { formatCurrency, APP_CURRENT_DATE } from '../../utils/formatters';
import { ETHIOPIC_MONTHS, toEthiopicDate, fromEthiopicDate, ethMonthToGregorianMonthYear } from '../../utils/ethiopianCalendar';
import { EthDatePicker } from '../common/EthDatePicker';
import { X, CheckCircle2, DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  payments: PaymentRecord[];
  onSavePayment: (payment: PaymentRecord) => void;
  preselectedUnitId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  properties,
  payments,
  onSavePayment,
  preselectedUnitId,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paidDate, setPaidDate] = useState<string>(APP_CURRENT_DATE);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [ethYear, setEthYear] = useState<number>(2019);
  const [ethMonth, setEthMonth] = useState<number>(2); // 2 = Tikimt (October)
  
  const monthYear = ethMonthToGregorianMonthYear(ethYear, ethMonth);

  useEffect(() => {
    if (properties.length > 0) {
      if (preselectedUnitId) {
        const foundProp = properties.find(p => p.units.some(u => u.id === preselectedUnitId));
        if (foundProp) {
          setSelectedPropertyId(foundProp.id);
          setSelectedUnitId(preselectedUnitId);
          return;
        }
      }
      setSelectedPropertyId(properties[0].id);
      if (properties[0].units.length > 0) {
        setSelectedUnitId(properties[0].units[0].id);
      }
    }
  }, [properties, preselectedUnitId, isOpen]);

  const activeProperty = properties.find(p => p.id === selectedPropertyId);
  const activeUnit = activeProperty?.units.find(u => u.id === selectedUnitId);

  // Auto-fill rent amount
  useEffect(() => {
    if (activeUnit) {
      const existing = payments.find(p => p.unitId === activeUnit.id && p.monthYear === monthYear);
      if (existing) {
        const remaining = existing.amountDue - existing.amountPaid;
        setAmountPaid(remaining > 0 ? remaining : activeUnit.rentAmount);
      } else {
        setAmountPaid(activeUnit.rentAmount);
      }
    }
  }, [activeUnit, monthYear, payments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !activeUnit) return;

    const existing = payments.find(p => p.unitId === activeUnit.id && p.monthYear === monthYear);
    const amountDue = existing ? existing.amountDue : activeUnit.rentAmount;
    const priorPaid = existing ? existing.amountPaid : 0;
    const newTotalPaid = priorPaid + Number(amountPaid);

    let newStatus: PaymentRecord['status'] = 'paid';
    if (newTotalPaid < amountDue) {
      newStatus = 'partial';
    } else {
      newStatus = 'paid';
    }

    const record: PaymentRecord = {
      id: existing ? existing.id : `pay-${Date.now()}`,
      propertyId: activeProperty.id,
      unitId: activeUnit.id,
      monthYear,
      dueDate: existing ? existing.dueDate : fromEthiopicDate(ethYear, ethMonth, activeUnit.rentDueDay),
      amountDue,
      amountPaid: newTotalPaid,
      paidDate,
      lateFeeApplied: existing?.lateFeeApplied || 0,
      status: newStatus,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    };

    onSavePayment(record);
    onClose();
  };

  const selectedMonthObj = ETHIOPIC_MONTHS.find(m => m.index === ethMonth) || ETHIOPIC_MONTHS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Record Subtenant Rent Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">የተከራይ ኪራይ ክፍያ መመዝገቢያ (የኢትዮጵያ ዘመን አቆጣጠር)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Rented Whole House</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  const p = properties.find(prop => prop.id === e.target.value);
                  if (p && p.units.length > 0) {
                    setSelectedUnitId(p.units[0].id);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class / Room</label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {activeProperty?.units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({formatCurrency(u.rentAmount)}/mo)</option>
                ))}
              </select>
            </div>
          </div>

          {activeUnit?.tenant && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span>Subtenant: {activeUnit.tenant.name}</span>
                <span className="font-mono tabular-nums text-slate-900 font-semibold">{formatCurrency(activeUnit.rentAmount)}/mo</span>
              </div>
              <div className="text-slate-500 flex justify-between">
                <span>Phone: {activeUnit.tenant.phone}</span>
                <span>Due: ቀን {activeUnit.rentDueDay} (Ethiopian Day {activeUnit.rentDueDay})</span>
              </div>
            </div>
          )}

          {/* Ethiopian Month Period and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                የኪራይ ወር / Ethiopian Rent Month
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
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Period: {selectedMonthObj.am} {ethYear} ዓ.ም ({selectedMonthObj.en})
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount Paid</label>
              <input
                type="number"
                min="1"
                step="1"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Value: {formatCurrency(amountPaid || 0)}
              </span>
            </div>
          </div>

          {/* Ethiopian Date Paid Picker */}
          <div>
            <EthDatePicker
              label="የተከፈለበት ቀን / Date Payment Received"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 capitalize"
              >
                <option value="bank_transfer">CBE / Telebirr / Bank Transfer</option>
                <option value="cash">Cash (ጥሬ ገንዘብ)</option>
                <option value="check">Check (ቼክ)</option>
                <option value="zelle">Zelle / Wire</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ref / Receipt Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. CBE-TX-992381 or Receipt #104"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Internal Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in full for Tikimt rent"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Payment Record (መዝግብ)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

