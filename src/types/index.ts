export type PropertyType = 'whole_house_sublease' | 'single_family' | 'duplex' | 'multi_unit' | 'townhouse';

export interface MasterLandlord {
  name: string;
  phone: string;
  email: string;
  paymentMethod: string; // e.g. "Direct ACH Transfer" or "Zelle"
  accountDetails?: string;
  notes?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  name: string; // e.g. "Class / Room 1 (Main Hall)", "Class / Room 2", "Studio Suite"
  rentAmount: number; // Subtenant rent per month
  rentDueDay: number; // 1-31
  gracePeriodDays: number;
  lateFeeAmount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenant?: Tenant;
  squareFeet?: number;
  capacity?: number;
}

export interface Tenant {
  id: string;
  unitId: string;
  name: string;
  phone: string;
  email: string;
  leaseStart: string; // YYYY-MM-DD
  leaseEnd: string; // YYYY-MM-DD
  depositAmount: number;
  notes?: string;
  reminderPreference: 'whatsapp' | 'sms' | 'email' | 'all';
}

export interface Property {
  id: string;
  name: string; // e.g. "Maple Heights House (5 Subleased Classes/Rooms)"
  address: string;
  city: string;
  state: string;
  zip: string;
  type: PropertyType;
  imageUrl: string;
  
  // Master Lease Details (Rented whole house from Owner)
  masterRentAmount: number; // What I pay to the head landlord each month
  masterRentDueDay: number; // Day of month I must pay the head landlord (e.g. 1st)
  masterLandlord: MasterLandlord;
  masterLeaseStart?: string;
  masterLeaseEnd?: string;

  units: Unit[]; // Classes / Rooms rented separately to subtenants
}

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';
export type PaymentMethod = 'zelle' | 'bank_transfer' | 'cash' | 'check' | 'venmo' | 'credit_card' | 'other';

// Subtenant Rent Payment Record (Income collected by user from each class/room)
export interface PaymentRecord {
  id: string;
  propertyId: string;
  unitId: string;
  monthYear: string; // "2026-10"
  dueDate: string; // "2026-10-01"
  amountDue: number;
  amountPaid: number;
  paidDate?: string;
  lateFeeApplied: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedAt: string;
}

// Master Lease Rent Record (Expense paid by user to the head landlord for the whole house)
export interface MasterRentPayment {
  id: string;
  propertyId: string;
  monthYear: string; // "2026-10"
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedAt: string;
}

export type ExpenseCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'hvac' 
  | 'appliances' 
  | 'repairs' 
  | 'utilities_wifi' 
  | 'cleaning' 
  | 'furnishings' 
  | 'supplies' 
  | 'other';

export interface ExpenseRecord {
  id: string;
  propertyId: string;
  unitId: string; // Specific Class/Room ID or "whole_property"
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  vendor: string;
  description: string;
  receiptNumber?: string;
  status: 'paid' | 'pending';
  notes?: string;
}

export type ReminderTrigger = '3_days_before' | 'due_day' | '3_days_overdue' | '7_days_overdue' | 'custom' | 'master_rent_due';
export type ReminderChannel = 'whatsapp' | 'sms' | 'email';

export interface ReminderLog {
  id: string;
  propertyId: string;
  unitId: string;
  tenantName: string;
  tenantContact: string;
  channel: ReminderChannel;
  trigger: ReminderTrigger;
  sentAt: string;
  messageText: string;
  status: 'sent' | 'delivered';
  amountDue: number;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  trigger: ReminderTrigger;
  subject: string;
  body: string;
  isActive: boolean;
}

export type ViewTab = 'dashboard' | 'properties' | 'payments' | 'master_rents' | 'expenses' | 'calendar' | 'reminders';
