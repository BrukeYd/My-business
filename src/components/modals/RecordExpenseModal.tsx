import React, { useState, useEffect } from 'react';
import { Property, ExpenseRecord, ExpenseCategory } from '../../types';
import { APP_CURRENT_DATE, formatCurrency } from '../../utils/formatters';
import { EthDatePicker } from '../common/EthDatePicker';
import { X, Wrench } from 'lucide-react';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSaveExpense: (expense: ExpenseRecord) => void;
  preselectedUnitId?: string;
  preselectedPropertyId?: string;
}

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSaveExpense,
  preselectedUnitId,
  preselectedPropertyId,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('whole_property');
  const [category, setCategory] = useState<ExpenseCategory>('plumbing');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(APP_CURRENT_DATE);
  const [vendor, setVendor] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (properties.length > 0) {
      if (preselectedPropertyId) {
        setSelectedPropertyId(preselectedPropertyId);
        if (preselectedUnitId) {
          setSelectedUnitId(preselectedUnitId);
        } else {
          setSelectedUnitId('whole_property');
        }
      } else if (preselectedUnitId) {
        const foundProp = properties.find(p => p.units.some(u => u.id === preselectedUnitId));
        if (foundProp) {
          setSelectedPropertyId(foundProp.id);
          setSelectedUnitId(preselectedUnitId);
        }
      } else {
        setSelectedPropertyId(properties[0].id);
        setSelectedUnitId('whole_property');
      }
    }
  }, [properties, preselectedPropertyId, preselectedUnitId, isOpen]);

  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || amount <= 0) return;

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      propertyId: activeProperty.id,
      unitId: selectedUnitId,
      category,
      amount: Number(amount),
      date,
      vendor: vendor.trim() || 'Direct Expense',
      description: description.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    };

    onSaveExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Record Maintenance & Spending</h2>
            <p className="text-xs text-slate-500 mt-0.5">የጥገና እና አገልግሎት ወጪ መመዝገቢያ (የኢትዮጵያ ዘመን አቆጣጠር)</p>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Rented House</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedUnitId('whole_property');
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Class / Space</label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="whole_property">Whole House Shared Facilities / Grounds</option>
                {activeProperty?.units.map(u => (
                  <option key={u.id} value={u.id}>Class/Room: {u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 capitalize"
              >
                <option value="plumbing">Plumbing (የውሃ መስመር)</option>
                <option value="electrical">Electrical (የመብራት ሥራ)</option>
                <option value="hvac">HVAC & Heating</option>
                <option value="appliances">Appliances</option>
                <option value="repairs">Carpentry & General Repairs</option>
                <option value="utilities_wifi">High-Speed WiFi & Utilities</option>
                <option value="cleaning">Cleaning / Turnover</option>
                <option value="furnishings">Furniture / Desks</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other Cost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cost Amount</label>
              <input
                type="number"
                min="0.01"
                step="1"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                required
                className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCurrency(amount || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Work Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Replaced shower valve, monthly mesh wifi"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <EthDatePicker
              label="የወጣበት ቀን / Date Incurred"
              value={date}
              onChange={setDate}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contractor / Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Ethio Telecom, Local Handyman"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Receipt / Invoice #</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. INV-2019-904"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
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
              Save Maintenance Cost (መዝግብ)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

