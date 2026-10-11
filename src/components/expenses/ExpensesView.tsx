import React, { useState } from 'react';
import { Property, ExpenseRecord, ExpenseCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Wrench, Filter, Search, Tag, Building2, Calendar, Receipt } from 'lucide-react';

interface ExpensesViewProps {
  properties: Property[];
  expenses: ExpenseRecord[];
  onOpenRecordExpense: (unitId?: string, propertyId?: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  properties,
  expenses,
  onOpenRecordExpense,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered expenses list
  const filteredExpenses = expenses.filter(expense => {
    if (selectedPropertyId !== 'all' && expense.propertyId !== selectedPropertyId) return false;
    if (selectedUnitId !== 'all' && expense.unitId !== selectedUnitId) return false;
    if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = expense.description.toLowerCase().includes(q);
      const matchVendor = expense.vendor.toLowerCase().includes(q);
      const matchReceipt = expense.receiptNumber?.toLowerCase().includes(q);
      return matchDesc || matchVendor || matchReceipt;
    }
    return true;
  });

  const totalCostFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Calculate Unit-Level Spending Totals
  const unitSpendingMap: { [unitId: string]: { propertyName: string; unitName: string; total: number; count: number } } = {};

  properties.forEach(prop => {
    // Add whole property general
    const wholePropExpenses = expenses.filter(e => e.propertyId === prop.id && e.unitId === 'whole_property');
    if (wholePropExpenses.length > 0) {
      unitSpendingMap[`${prop.id}-whole`] = {
        propertyName: prop.name,
        unitName: 'Building Grounds & Exterior',
        total: wholePropExpenses.reduce((s, e) => s + e.amount, 0),
        count: wholePropExpenses.length,
      };
    }

    prop.units.forEach(unit => {
      const uExp = expenses.filter(e => e.propertyId === prop.id && e.unitId === unit.id);
      unitSpendingMap[unit.id] = {
        propertyName: prop.name,
        unitName: unit.name,
        total: uExp.reduce((s, e) => s + e.amount, 0),
        count: uExp.length,
      };
    });
  });

  // Calculate Category Totals
  const categoryTotals: { [cat: string]: number } = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Unit Spending & Maintenance Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track repair expenses, contractor invoices, and maintenance costs attributed to every rental unit
          </p>
        </div>
        <button
          onClick={() => onOpenRecordExpense()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Unit Cost</span>
        </button>
      </div>

      {/* Unit-by-Unit Cost Breakdown Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Maintenance Costs Tracked Per Unit
            </h2>
            <p className="text-[11px] text-slate-500">
              Total spending per individual rental unit to date
            </p>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            Total Spending: <strong className="font-mono tabular-nums text-slate-900 font-bold">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(unitSpendingMap).map(([key, item]) => (
            <div
              key={key}
              onClick={() => {
                if (key.includes('-whole')) {
                  setSelectedUnitId('whole_property');
                } else {
                  setSelectedUnitId(key);
                }
              }}
              className="p-3 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors cursor-pointer flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900 block truncate">{item.unitName}</span>
                <span className="text-[11px] text-slate-500 block truncate">{item.propertyName}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{item.count} work orders</span>
              </div>
              <div className="text-right pl-3 shrink-0">
                <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block">
                  {formatCurrency(item.total)}
                </span>
                <span className="text-[10px] text-slate-500">Total Spent</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Strip */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Property Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Filter Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSelectedUnitId('all');
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Filter Unit</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Units</option>
              <option value="whole_property">Whole Property (Grounds)</option>
              {activeProperty
                ? activeProperty.units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))
                : properties.flatMap(p => p.units).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 capitalize"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC & Heating</option>
              <option value="appliances">Appliances</option>
              <option value="repairs">Repairs & Carpentry</option>
              <option value="landscaping">Landscaping</option>
              <option value="cleaning">Cleaning / Turnover</option>
              <option value="tax_insurance">Tax & Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Search Description</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vendor, pipe, roof..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {filteredExpenses.length} expense record{filteredExpenses.length === 1 ? '' : 's'}</span>
          <span className="font-medium text-slate-800">
            Filtered Subtotal: <strong className="font-mono tabular-nums text-slate-900 font-bold">{formatCurrency(totalCostFiltered)}</strong>
          </span>
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Date Incurred</th>
                <th className="py-3 px-4 font-semibold">Property & Unit</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description & Work</th>
                <th className="py-3 px-4 font-semibold">Contractor / Vendor</th>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Cost Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No maintenance records found for this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => {
                  const prop = properties.find(p => p.id === expense.propertyId);
                  const unit = prop?.units.find(u => u.id === expense.unitId);

                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{prop?.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {expense.unitId === 'whole_property' ? 'Whole Property (General)' : unit?.name || expense.unitId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {expense.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs">
                        <span className="block truncate font-medium">{expense.description}</span>
                        {expense.notes && (
                          <span className="text-[10px] text-slate-400 block truncate">{expense.notes}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {expense.vendor}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {expense.receiptNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {expense.status === 'paid' ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">Paid</span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
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
