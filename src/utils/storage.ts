import { Property, PaymentRecord, MasterRentPayment, ExpenseRecord, ReminderTemplate, ReminderLog } from '../types';
import { INITIAL_PROPERTIES, INITIAL_PAYMENTS, INITIAL_MASTER_PAYMENTS, INITIAL_EXPENSES, INITIAL_TEMPLATES, INITIAL_REMINDER_LOGS } from '../data/initialData';

const KEYS = {
  PROPERTIES: 'hearthstone_properties_v2',
  PAYMENTS: 'hearthstone_payments_v2',
  MASTER_PAYMENTS: 'hearthstone_master_payments_v2',
  EXPENSES: 'hearthstone_expenses_v2',
  TEMPLATES: 'hearthstone_templates_v2',
  REMINDERS: 'hearthstone_reminders_v2',
  AUTO_REMINDER_ENABLED: 'hearthstone_auto_reminder_enabled_v2'
};

export function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem(KEYS.PROPERTIES);
    if (!raw) {
      saveProperties(INITIAL_PROPERTIES);
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROPERTIES;
  }
}

export function saveProperties(props: Property[]): void {
  try {
    localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(props));
  } catch (e) {
    console.error('Failed to save properties', e);
  }
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.PAYMENTS);
    if (!raw) {
      savePayments(INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function savePayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed to save payments', e);
  }
}

export function loadMasterPayments(): MasterRentPayment[] {
  try {
    const raw = localStorage.getItem(KEYS.MASTER_PAYMENTS);
    if (!raw) {
      saveMasterPayments(INITIAL_MASTER_PAYMENTS);
      return INITIAL_MASTER_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MASTER_PAYMENTS;
  }
}

export function saveMasterPayments(masterPayments: MasterRentPayment[]): void {
  try {
    localStorage.setItem(KEYS.MASTER_PAYMENTS, JSON.stringify(masterPayments));
  } catch (e) {
    console.error('Failed to save master payments', e);
  }
}

export function loadExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.EXPENSES);
    if (!raw) {
      saveExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: ExpenseRecord[]): void {
  try {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function loadTemplates(): ReminderTemplate[] {
  try {
    const raw = localStorage.getItem(KEYS.TEMPLATES);
    if (!raw) {
      saveTemplates(INITIAL_TEMPLATES);
      return INITIAL_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEMPLATES;
  }
}

export function saveTemplates(templates: ReminderTemplate[]): void {
  try {
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates', e);
  }
}

export function loadReminderLogs(): ReminderLog[] {
  try {
    const raw = localStorage.getItem(KEYS.REMINDERS);
    if (!raw) {
      saveReminderLogs(INITIAL_REMINDER_LOGS);
      return INITIAL_REMINDER_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REMINDER_LOGS;
  }
}

export function saveReminderLogs(logs: ReminderLog[]): void {
  try {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save reminders', e);
  }
}

export function loadAutoReminderEnabled(): boolean {
  try {
    const raw = localStorage.getItem(KEYS.AUTO_REMINDER_ENABLED);
    return raw !== null ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
}

export function saveAutoReminderEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEYS.AUTO_REMINDER_ENABLED, JSON.stringify(enabled));
  } catch (e) {
    console.error('Failed to save auto reminder toggle', e);
  }
}

export function resetAllDataToDefault(): void {
  saveProperties(INITIAL_PROPERTIES);
  savePayments(INITIAL_PAYMENTS);
  saveMasterPayments(INITIAL_MASTER_PAYMENTS);
  saveExpenses(INITIAL_EXPENSES);
  saveTemplates(INITIAL_TEMPLATES);
  saveReminderLogs(INITIAL_REMINDER_LOGS);
}

export function exportBackupJson(): string {
  const backup = {
    version: '2.0',
    type: 'sublease_arbitrage_portfolio',
    exportedAt: new Date().toISOString(),
    properties: loadProperties(),
    payments: loadPayments(),
    masterPayments: loadMasterPayments(),
    expenses: loadExpenses(),
    templates: loadTemplates(),
    reminderLogs: loadReminderLogs(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.properties && Array.isArray(data.properties)) saveProperties(data.properties);
    if (data.payments && Array.isArray(data.payments)) savePayments(data.payments);
    if (data.masterPayments && Array.isArray(data.masterPayments)) saveMasterPayments(data.masterPayments);
    if (data.expenses && Array.isArray(data.expenses)) saveExpenses(data.expenses);
    if (data.templates && Array.isArray(data.templates)) saveTemplates(data.templates);
    if (data.reminderLogs && Array.isArray(data.reminderLogs)) saveReminderLogs(data.reminderLogs);
    return true;
  } catch (e) {
    console.error('Failed to parse backup JSON', e);
    return false;
  }
}
