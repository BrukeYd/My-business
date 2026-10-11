import React, { useState } from 'react';
import { Property, PaymentRecord, ExpenseRecord, MasterRentPayment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Wrench, DollarSign, User, Phone, Mail, Calendar, ChevronDown, ChevronUp, ShieldCheck, Building2 } from 'lucide-react';

interface PropertiesViewProps {
  properties: Property[];
  payments: PaymentRecord[];
  masterPayments: MasterRentPayment[];
  expenses: ExpenseRecord[];
  onOpenAddProperty: () => void;
  onOpenRecordPayment: (unitId: string) => void;
  onOpenRecordMasterPayment: (propertyId: string) => void;
  onOpenRecordExpense: (unitId: string, propertyId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  payments,
  masterPayments,
  expenses,
  onOpenAddProperty,
  onOpenRecordPayment,
  onOpenRecordMasterPayment,
  onOpenRecordExpense,
}) => {
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(properties[0]?.id || null);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leased Houses & Subleased Classes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your master leases with house owners and track profit from renting each class/room separately
          </p>
        </div>
        <button
          onClick={onOpenAddProperty}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leased House & Classes</span>
        </button>
      </div>

      {/* Houses List */}
      <div className="space-y-6">
        {properties.map((property) => {
          const isExpanded = expandedPropertyId === property.id;
          const propPayments = payments.filter(p => p.propertyId === property.id);
          const propExpenses = expenses.filter(e => e.propertyId === property.id);

          // Subtenant Rent Total
          const totalSubtenantMonthly = property.units.reduce((s, u) => s + u.rentAmount, 0);
          // Monthly Arbitrage Spread
          const monthlyArbitrageSpread = totalSubtenantMonthly - property.masterRentAmount;
          // Maintenance & Operating spent on this house
          const totalMaintenanceSpent = propExpenses.reduce((s, e) => s + e.amount, 0);

          return (
            <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Main House Banner & Summary */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Photo & House Info */}
                <div className="lg:col-span-5 flex items-start gap-4">
                  <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block uppercase tracking-wider">
                      Master Leased · {property.units.length} Classes/Rooms
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{property.name}</h2>
                    <p className="text-xs text-slate-500">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <div className="pt-1 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Owner:</span> {property.masterLandlord.name} ({property.masterLandlord.phone})
                    </div>
                  </div>
                </div>

                {/* Arbitrage Spread Strip for this House */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Master Rent to Owner</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-rose-700 block mt-0.5">
                      -{formatCurrency(property.masterRentAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400">Due {property.masterRentDueDay}th of month</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Subtenant Classes</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 block mt-0.5">
                      +{formatCurrency(totalSubtenantMonthly)}
                    </span>
                    <span className="text-[10px] text-slate-400">across {property.units.length} classes</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Monthly Profit Spread</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 block mt-0.5">
                      +{formatCurrency(monthlyArbitrageSpread)}
                    </span>
                    <span className="text-[10px] text-slate-500">Arbitrage Margin</span>
                  </div>
                </div>

                {/* Toggle & Action */}
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setExpandedPropertyId(isExpanded ? null : property.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Classes' : 'View Classes'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Classes & Subtenants Breakdown */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-5 sm:p-6 bg-slate-50/50 space-y-4">
                  {/* Master Owner Lease Info Bar */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Head Landlord Lease: </span>
                        <span className="text-slate-600">
                          {property.masterLandlord.name} · Paid via {property.masterLandlord.paymentMethod}
                        </span>
                        {property.masterLandlord.accountDetails && (
                          <span className="text-slate-400 block font-mono text-[10px]">
                            {property.masterLandlord.accountDetails}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenRecordMasterPayment(property.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      Record Master Rent to Owner
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Classes / Rooms Rented Separately in {property.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Track subtenant rents, lease dates, and individual maintenance costs
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenRecordExpense('whole_property', property.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <span>Log Shared House Cost</span>
                    </button>
                  </div>

                  {/* Grid of Classes / Rooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.units.map((unit) => {
                      const unitExpenses = propExpenses.filter(e => e.unitId === unit.id);
                      const unitMaintTotal = unitExpenses.reduce((s, e) => s + e.amount, 0);

                      const latestPayment = propPayments.find(p => p.unitId === unit.id && p.monthYear === '2026-10');
                      const isPaid = latestPayment?.status === 'paid';
                      const isPartial = latestPayment?.status === 'partial';

                      return (
                        <div key={unit.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{unit.name}</h4>
                                <span className="text-[11px] text-slate-500 block">
                                  Sublease Unit · Capacity: {unit.capacity || 1}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 block">
                                  {formatCurrency(unit.rentAmount)}/mo
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  Due on {unit.rentDueDay}th · Grace: {unit.gracePeriodDays} days
                                </span>
                              </div>
                            </div>

                            {/* Subtenant Details Box */}
                            {unit.tenant ? (
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                                <div className="flex items-center justify-between text-slate-800 font-medium">
                                  <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{unit.tenant.name}</span>
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    Lease until {formatDate(unit.tenant.leaseEnd)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{unit.tenant.phone}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{unit.tenant.email}</span>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                                Class / room is currently vacant.
                              </div>
                            )}

                            {/* Unit Maintenance summary */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                Class Maintenance Spent:
                              </span>
                              <span className="font-mono tabular-nums font-bold text-slate-900">
                                {formatCurrency(unitMaintTotal)} ({unitExpenses.length} work items)
                              </span>
                            </div>
                          </div>

                          {/* Action triggers */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenRecordExpense(unit.id, property.id)}
                              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-slate-500" />
                              <span>Log Cost</span>
                            </button>
                            <button
                              onClick={() => onOpenRecordPayment(unit.id)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Record Subtenant Rent</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
