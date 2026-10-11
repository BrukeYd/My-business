import { PaymentRecord, Property, ReminderTemplate, ReminderTrigger } from '../types';
import { formatCurrency, formatDate, getDaysOverdue, cleanPhoneNumber, APP_CURRENT_DATE } from './formatters';

export interface PendingReminderItem {
  id: string;
  paymentId: string;
  property: Property;
  unit: Property['units'][0];
  tenant: NonNullable<Property['units'][0]['tenant']>;
  payment: PaymentRecord;
  trigger: ReminderTrigger;
  triggerLabel: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  overdueDays: number;
  balanceDue: number;
  lateFee: number;
  totalWithLateFee: number;
  messageText: string;
  emailSubject: string;
}

export function compileTemplate(
  templateText: string,
  variables: {
    tenantName: string;
    propertyName: string;
    unitName: string;
    amountDue: number;
    dueDate: string;
    overdueDays?: number;
    lateFee?: number;
    totalDue?: number;
  }
): string {
  let result = templateText;
  result = result.replace(/{tenant_name}/g, variables.tenantName);
  result = result.replace(/{property_name}/g, variables.propertyName);
  result = result.replace(/{unit_name}/g, variables.unitName);
  result = result.replace(/{amount_due}/g, formatCurrency(variables.amountDue));
  result = result.replace(/{due_date}/g, formatDate(variables.dueDate));
  result = result.replace(/{overdue_days}/g, String(variables.overdueDays || 0));
  result = result.replace(/{late_fee}/g, formatCurrency(variables.lateFee || 0));
  result = result.replace(/{total_due}/g, formatCurrency(variables.totalDue || variables.amountDue));
  return result;
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const clean = cleanPhoneNumber(phone).replace(/^\+/, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function buildSmsUrl(phone: string, text: string): string {
  const clean = cleanPhoneNumber(phone);
  return `sms:${clean}?body=${encodeURIComponent(text)}`;
}

export function buildEmailUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function evaluatePendingReminders(
  properties: Property[],
  payments: PaymentRecord[],
  templates: ReminderTemplate[],
  currentDateStr: string = APP_CURRENT_DATE
): PendingReminderItem[] {
  const items: PendingReminderItem[] = [];

  properties.forEach(property => {
    property.units.forEach(unit => {
      if (!unit.tenant) return;

      // Find payment record for current active month (e.g. 2026-10)
      const currentMonth = currentDateStr.substring(0, 7);
      const payment = payments.find(p => p.unitId === unit.id && p.monthYear === currentMonth);

      if (!payment) return;

      const balanceDue = payment.amountDue - payment.amountPaid;
      if (balanceDue <= 0 && payment.status === 'paid') {
        return; // Already paid
      }

      const overdueDays = getDaysOverdue(payment.dueDate, currentDateStr);

      let trigger: ReminderTrigger = 'due_day';
      let triggerLabel = 'Payment Due Today';
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      if (overdueDays >= 7) {
        trigger = '7_days_overdue';
        triggerLabel = `${overdueDays} Days Overdue (Late Fee Applied)`;
        urgency = 'critical';
      } else if (overdueDays > 0) {
        trigger = '3_days_overdue';
        triggerLabel = `${overdueDays} Days Past Due`;
        urgency = 'high';
      } else if (overdueDays === 0) {
        trigger = 'due_day';
        triggerLabel = 'Due Today';
        urgency = 'medium';
      } else {
        trigger = '3_days_before';
        triggerLabel = 'Upcoming Payment Deadline';
        urgency = 'low';
      }

      const matchingTpl = templates.find(t => t.trigger === trigger && t.isActive) || templates[0];

      const lateFee = (overdueDays > unit.gracePeriodDays) ? unit.lateFeeAmount : 0;
      const totalWithLateFee = balanceDue + lateFee;

      const compiledBody = compileTemplate(matchingTpl?.body || 'Hi {tenant_name}, rent of {amount_due} for {property_name} is due.', {
        tenantName: unit.tenant.name,
        propertyName: property.name,
        unitName: unit.name,
        amountDue: balanceDue,
        dueDate: payment.dueDate,
        overdueDays,
        lateFee,
        totalDue: totalWithLateFee,
      });

      const compiledSubject = compileTemplate(matchingTpl?.subject || 'Rent Reminder: {unit_name}', {
        tenantName: unit.tenant.name,
        propertyName: property.name,
        unitName: unit.name,
        amountDue: balanceDue,
        dueDate: payment.dueDate,
        overdueDays,
        lateFee,
        totalDue: totalWithLateFee,
      });

      items.push({
        id: `reminder-${unit.id}-${payment.id}`,
        paymentId: payment.id,
        property,
        unit,
        tenant: unit.tenant,
        payment,
        trigger,
        triggerLabel,
        urgency,
        overdueDays,
        balanceDue,
        lateFee,
        totalWithLateFee,
        messageText: compiledBody,
        emailSubject: compiledSubject,
      });
    });
  });

  return items.sort((a, b) => b.overdueDays - a.overdueDays);
}
