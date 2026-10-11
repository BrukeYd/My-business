/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Property, 
  PaymentRecord, 
  MasterRentPayment,
  ExpenseRecord, 
  ReminderTemplate, 
  ReminderLog, 
  ViewTab 
} from './types';
import { 
  loadProperties, 
  saveProperties, 
  loadPayments, 
  savePayments, 
  loadMasterPayments,
  saveMasterPayments,
  loadExpenses, 
  saveExpenses, 
  loadTemplates, 
  saveTemplates, 
  loadReminderLogs, 
  saveReminderLogs, 
  loadAutoReminderEnabled, 
  saveAutoReminderEnabled,
  resetAllDataToDefault,
  exportBackupJson,
  importBackupJson
} from './utils/storage';
import { evaluatePendingReminders, PendingReminderItem } from './utils/reminders';
import { APP_CURRENT_DATE, formatCurrency } from './utils/formatters';

// Components
import { Navbar } from './components/layout/Navbar';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { PropertiesView } from './components/properties/PropertiesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { MasterRentsView } from './components/payments/MasterRentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { RentCalendarView } from './components/calendar/RentCalendarView';
import { RemindersView } from './components/reminders/RemindersView';

// Modals
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { RecordMasterPaymentModal } from './components/modals/RecordMasterPaymentModal';
import { RecordExpenseModal } from './components/modals/RecordExpenseModal';
import { AddPropertyModal } from './components/modals/AddPropertyModal';
import { FinancialReportModal } from './components/financials/FinancialReportModal';

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [masterPayments, setMasterPayments] = useState<MasterRentPayment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [isAutoEnabled, setIsAutoEnabled] = useState<boolean>(true);

  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile_preview'>('desktop');

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [preselectedUnitId, setPreselectedUnitId] = useState<string | undefined>(undefined);

  const [isRecordMasterPaymentOpen, setIsRecordMasterPaymentOpen] = useState(false);
  const [preselectedMasterPropId, setPreselectedMasterPropId] = useState<string | undefined>(undefined);

  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [preselectedExpenseUnitId, setPreselectedExpenseUnitId] = useState<string | undefined>(undefined);
  const [preselectedExpensePropId, setPreselectedExpensePropId] = useState<string | undefined>(undefined);

  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isFinancialReportOpen, setIsFinancialReportOpen] = useState(false);

  // Initialize from storage
  useEffect(() => {
    setProperties(loadProperties());
    setPayments(loadPayments());
    setMasterPayments(loadMasterPayments());
    setExpenses(loadExpenses());
    setTemplates(loadTemplates());
    setReminderLogs(loadReminderLogs());
    setIsAutoEnabled(loadAutoReminderEnabled());
  }, []);

  // Evaluated pending reminders count
  const pendingReminders = evaluatePendingReminders(properties, payments, templates, APP_CURRENT_DATE);

  // Handlers for subtenant payments
  const handleSavePayment = (payment: PaymentRecord) => {
    setPayments(prev => {
      const idx = prev.findIndex(p => p.id === payment.id || (p.unitId === payment.unitId && p.monthYear === payment.monthYear));
      let next: PaymentRecord[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = payment;
      } else {
        next = [payment, ...prev];
      }
      savePayments(next);
      return next;
    });
  };

  const handleQuickMarkPaid = (paymentId: string) => {
    setPayments(prev => {
      const next = prev.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            amountPaid: p.amountDue,
            status: 'paid' as const,
            paidDate: APP_CURRENT_DATE,
            recordedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      savePayments(next);
      return next;
    });
  };

  // Handlers for master rent payments (paid to house owners)
  const handleSaveMasterPayment = (payment: MasterRentPayment) => {
    setMasterPayments(prev => {
      const idx = prev.findIndex(p => p.id === payment.id || (p.propertyId === payment.propertyId && p.monthYear === payment.monthYear));
      let next: MasterRentPayment[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = payment;
      } else {
        next = [payment, ...prev];
      }
      saveMasterPayments(next);
      return next;
    });
  };

  const handleQuickMarkMasterPaid = (paymentId: string) => {
    setMasterPayments(prev => {
      const next = prev.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            amountPaid: p.amountDue,
            status: 'paid' as const,
            paidDate: APP_CURRENT_DATE,
            recordedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      saveMasterPayments(next);
      return next;
    });
  };

  // Handlers for expenses
  const handleSaveExpense = (expense: ExpenseRecord) => {
    setExpenses(prev => {
      const next = [expense, ...prev];
      saveExpenses(next);
      return next;
    });
  };

  // Handlers for properties
  const handleSaveProperty = (prop: Property) => {
    setProperties(prev => {
      const next = [...prev, prop];
      saveProperties(next);
      return next;
    });

    // Auto-create initial pending payment records for current month
    const initialPays: PaymentRecord[] = prop.units.map(u => ({
      id: `pay-${u.id}-2026-10`,
      propertyId: prop.id,
      unitId: u.id,
      monthYear: '2026-10',
      dueDate: `2026-10-0${u.rentDueDay}`,
      amountDue: u.rentAmount,
      amountPaid: 0,
      lateFeeApplied: 0,
      status: 'pending',
      recordedAt: new Date().toISOString(),
    }));

    setPayments(prev => {
      const next = [...initialPays, ...prev];
      savePayments(next);
      return next;
    });

    // Auto-create master payment to owner
    const initialMaster: MasterRentPayment = {
      id: `master-${prop.id}-2026-10`,
      propertyId: prop.id,
      monthYear: '2026-10',
      dueDate: `2026-10-0${prop.masterRentDueDay}`,
      amountDue: prop.masterRentAmount,
      amountPaid: 0,
      status: 'pending',
      recordedAt: new Date().toISOString(),
    };

    setMasterPayments(prev => {
      const next = [initialMaster, ...prev];
      saveMasterPayments(next);
      return next;
    });
  };

  // Handlers for templates & reminders
  const handleUpdateTemplates = (newTemplates: ReminderTemplate[]) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  const handleLogReminderSent = (log: ReminderLog) => {
    setReminderLogs(prev => {
      const next = [log, ...prev];
      saveReminderLogs(next);
      return next;
    });
  };

  const handleBatchSendReminders = (items: PendingReminderItem[]) => {
    const newLogs: ReminderLog[] = items.map(item => ({
      id: `rem-batch-${Date.now()}-${item.unit.id}`,
      propertyId: item.property.id,
      unitId: item.unit.id,
      tenantName: item.tenant.name,
      tenantContact: item.tenant.phone,
      channel: item.tenant.reminderPreference === 'email' ? 'email' : 'whatsapp',
      trigger: item.trigger,
      sentAt: new Date().toISOString(),
      messageText: item.messageText,
      status: 'delivered',
      amountDue: item.balanceDue,
    }));

    setReminderLogs(prev => {
      const next = [...newLogs, ...prev];
      saveReminderLogs(next);
      return next;
    });
  };

  const handleToggleAuto = (enabled: boolean) => {
    setIsAutoEnabled(enabled);
    saveAutoReminderEnabled(enabled);
  };

  const handleResetData = () => {
    if (confirm('Reset all property and payment records to default demonstration data?')) {
      resetAllDataToDefault();
      setProperties(loadProperties());
      setPayments(loadPayments());
      setMasterPayments(loadMasterPayments());
      setExpenses(loadExpenses());
      setTemplates(loadTemplates());
      setReminderLogs(loadReminderLogs());
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hearthstone-arbitrage-backup-${APP_CURRENT_DATE}.json`;
    link.click();
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = re.target?.result as string;
        if (text && importBackupJson(text)) {
          setProperties(loadProperties());
          setPayments(loadPayments());
          setMasterPayments(loadMasterPayments());
          setExpenses(loadExpenses());
          setTemplates(loadTemplates());
          setReminderLogs(loadReminderLogs());
          alert('Backup restored successfully!');
        } else {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenQuickRecord={() => {
          setPreselectedUnitId(undefined);
          setIsRecordPaymentOpen(true);
        }}
        onOpenRecordMasterPayment={() => {
          setPreselectedMasterPropId(undefined);
          setIsRecordMasterPaymentOpen(true);
        }}
        onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
        deviceMode={deviceMode}
        onToggleDeviceMode={() => setDeviceMode(prev => prev === 'desktop' ? 'mobile_preview' : 'desktop')}
        pendingRemindersCount={pendingReminders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-12">
        {deviceMode === 'mobile_preview' ? (
          /* Realistic Smartphone Preview Frame */
          <div className="max-w-md mx-auto my-6 px-4">
            <div className="bg-slate-900 text-white text-xs px-4 py-2 rounded-t-3xl flex items-center justify-between border-t border-x border-slate-700">
              <span className="font-semibold">Hearthstone Sublease Mobile</span>
              <button
                onClick={() => setDeviceMode('desktop')}
                className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
              >
                Expand to Desktop
              </button>
            </div>
            <div className="bg-white rounded-b-3xl border-x border-b border-slate-300 shadow-2xl p-4 overflow-hidden min-h-[640px]">
              {currentTab === 'dashboard' && (
                <OverviewDashboard
                  properties={properties}
                  payments={payments}
                  masterPayments={masterPayments}
                  expenses={expenses}
                  onNavigateTab={setCurrentTab}
                  onOpenRecordPayment={(unitId) => {
                    setPreselectedUnitId(unitId);
                    setIsRecordPaymentOpen(true);
                  }}
                  onOpenRecordMasterPayment={(propId) => {
                    setPreselectedMasterPropId(propId);
                    setIsRecordMasterPaymentOpen(true);
                  }}
                  onOpenRecordExpense={(unitId, propId) => {
                    setPreselectedExpenseUnitId(unitId);
                    setPreselectedExpensePropId(propId);
                    setIsRecordExpenseOpen(true);
                  }}
                  onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
                />
              )}
              {currentTab === 'properties' && (
                <PropertiesView
                  properties={properties}
                  payments={payments}
                  masterPayments={masterPayments}
                  expenses={expenses}
                  onOpenAddProperty={() => setIsAddPropertyOpen(true)}
                  onOpenRecordPayment={(unitId) => {
                    setPreselectedUnitId(unitId);
                    setIsRecordPaymentOpen(true);
                  }}
                  onOpenRecordMasterPayment={(propId) => {
                    setPreselectedMasterPropId(propId);
                    setIsRecordMasterPaymentOpen(true);
                  }}
                  onOpenRecordExpense={(unitId, propId) => {
                    setPreselectedExpenseUnitId(unitId);
                    setPreselectedExpensePropId(propId);
                    setIsRecordExpenseOpen(true);
                  }}
                />
              )}
              {currentTab === 'payments' && (
                <PaymentsView
                  properties={properties}
                  payments={payments}
                  onOpenRecordPayment={(unitId) => {
                    setPreselectedUnitId(unitId);
                    setIsRecordPaymentOpen(true);
                  }}
                  onQuickMarkPaid={handleQuickMarkPaid}
                  onNavigateToReminders={() => setCurrentTab('reminders')}
                />
              )}
              {currentTab === 'master_rents' && (
                <MasterRentsView
                  properties={properties}
                  masterPayments={masterPayments}
                  onOpenRecordMasterPayment={(propId) => {
                    setPreselectedMasterPropId(propId);
                    setIsRecordMasterPaymentOpen(true);
                  }}
                  onQuickMarkMasterPaid={handleQuickMarkMasterPaid}
                />
              )}
              {currentTab === 'expenses' && (
                <ExpensesView
                  properties={properties}
                  expenses={expenses}
                  onOpenRecordExpense={(unitId, propId) => {
                    setPreselectedExpenseUnitId(unitId);
                    setPreselectedExpensePropId(propId);
                    setIsRecordExpenseOpen(true);
                  }}
                />
              )}
              {currentTab === 'calendar' && (
                <RentCalendarView
                  properties={properties}
                  payments={payments}
                  masterPayments={masterPayments}
                  expenses={expenses}
                  onOpenRecordPayment={(unitId) => {
                    setPreselectedUnitId(unitId);
                    setIsRecordPaymentOpen(true);
                  }}
                  onOpenRecordMasterPayment={(propId) => {
                    setPreselectedMasterPropId(propId);
                    setIsRecordMasterPaymentOpen(true);
                  }}
                  onNavigateToReminders={() => setCurrentTab('reminders')}
                />
              )}
              {currentTab === 'reminders' && (
                <RemindersView
                  properties={properties}
                  payments={payments}
                  templates={templates}
                  reminderLogs={reminderLogs}
                  isAutoEnabled={isAutoEnabled}
                  onToggleAuto={handleToggleAuto}
                  onUpdateTemplates={handleUpdateTemplates}
                  onLogReminderSent={handleLogReminderSent}
                  onBatchSendReminders={handleBatchSendReminders}
                />
              )}
            </div>
          </div>
        ) : (
          /* Desktop PC Full Screen & Responsive Native Layout */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {currentTab === 'dashboard' && (
              <OverviewDashboard
                properties={properties}
                payments={payments}
                masterPayments={masterPayments}
                expenses={expenses}
                onNavigateTab={setCurrentTab}
                onOpenRecordPayment={(unitId) => {
                  setPreselectedUnitId(unitId);
                  setIsRecordPaymentOpen(true);
                }}
                onOpenRecordMasterPayment={(propId) => {
                  setPreselectedMasterPropId(propId);
                  setIsRecordMasterPaymentOpen(true);
                }}
                onOpenRecordExpense={(unitId, propId) => {
                  setPreselectedExpenseUnitId(unitId);
                  setPreselectedExpensePropId(propId);
                  setIsRecordExpenseOpen(true);
                }}
                onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
              />
            )}

            {currentTab === 'properties' && (
              <PropertiesView
                properties={properties}
                payments={payments}
                masterPayments={masterPayments}
                expenses={expenses}
                onOpenAddProperty={() => setIsAddPropertyOpen(true)}
                onOpenRecordPayment={(unitId) => {
                  setPreselectedUnitId(unitId);
                  setIsRecordPaymentOpen(true);
                }}
                onOpenRecordMasterPayment={(propId) => {
                  setPreselectedMasterPropId(propId);
                  setIsRecordMasterPaymentOpen(true);
                }}
                onOpenRecordExpense={(unitId, propId) => {
                  setPreselectedExpenseUnitId(unitId);
                  setPreselectedExpensePropId(propId);
                  setIsRecordExpenseOpen(true);
                }}
              />
            )}

            {currentTab === 'payments' && (
              <PaymentsView
                properties={properties}
                payments={payments}
                onOpenRecordPayment={(unitId) => {
                  setPreselectedUnitId(unitId);
                  setIsRecordPaymentOpen(true);
                }}
                onQuickMarkPaid={handleQuickMarkPaid}
                onNavigateToReminders={() => setCurrentTab('reminders')}
              />
            )}

            {currentTab === 'master_rents' && (
              <MasterRentsView
                properties={properties}
                masterPayments={masterPayments}
                onOpenRecordMasterPayment={(propId) => {
                  setPreselectedMasterPropId(propId);
                  setIsRecordMasterPaymentOpen(true);
                }}
                onQuickMarkMasterPaid={handleQuickMarkMasterPaid}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpensesView
                properties={properties}
                expenses={expenses}
                onOpenRecordExpense={(unitId, propId) => {
                  setPreselectedExpenseUnitId(unitId);
                  setPreselectedExpensePropId(propId);
                  setIsRecordExpenseOpen(true);
                }}
              />
            )}

            {currentTab === 'calendar' && (
              <RentCalendarView
                properties={properties}
                payments={payments}
                masterPayments={masterPayments}
                expenses={expenses}
                onOpenRecordPayment={(unitId) => {
                  setPreselectedUnitId(unitId);
                  setIsRecordPaymentOpen(true);
                }}
                onOpenRecordMasterPayment={(propId) => {
                  setPreselectedMasterPropId(propId);
                  setIsRecordMasterPaymentOpen(true);
                }}
                onNavigateToReminders={() => setCurrentTab('reminders')}
              />
            )}

            {currentTab === 'reminders' && (
              <RemindersView
                properties={properties}
                payments={payments}
                templates={templates}
                reminderLogs={reminderLogs}
                isAutoEnabled={isAutoEnabled}
                onToggleAuto={handleToggleAuto}
                onUpdateTemplates={handleUpdateTemplates}
                onLogReminderSent={handleLogReminderSent}
                onBatchSendReminders={handleBatchSendReminders}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Tab Bar */}
      <MobileTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenQuickRecord={() => {
          setPreselectedUnitId(undefined);
          setIsRecordPaymentOpen(true);
        }}
        pendingRemindersCount={pendingReminders.length}
      />

      {/* Quiet Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Hearthstone</span>
            <span aria-hidden="true">·</span>
            <span>Sublease Arbitrage Portfolio</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{properties.length} rented houses / {properties.reduce((s, p) => s + p.units.length, 0)} subleased classes</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Export Backup JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleImportBackup}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Import Backup
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        properties={properties}
        payments={payments}
        onSavePayment={handleSavePayment}
        preselectedUnitId={preselectedUnitId}
      />

      <RecordMasterPaymentModal
        isOpen={isRecordMasterPaymentOpen}
        onClose={() => setIsRecordMasterPaymentOpen(false)}
        properties={properties}
        masterPayments={masterPayments}
        onSaveMasterPayment={handleSaveMasterPayment}
        preselectedPropertyId={preselectedMasterPropId}
      />

      <RecordExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
        properties={properties}
        onSaveExpense={handleSaveExpense}
        preselectedUnitId={preselectedExpenseUnitId}
        preselectedPropertyId={preselectedExpensePropId}
      />

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onSaveProperty={handleSaveProperty}
      />

      <FinancialReportModal
        isOpen={isFinancialReportOpen}
        onClose={() => setIsFinancialReportOpen(false)}
        properties={properties}
        payments={payments}
        masterPayments={masterPayments}
        expenses={expenses}
      />
    </div>
  );
}
