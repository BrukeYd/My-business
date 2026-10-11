import { Property, PaymentRecord, MasterRentPayment, ExpenseRecord, ReminderTemplate, ReminderLog } from '../types';

import craftsmanImg from '../assets/images/prop_craftsman_house_1791746096895.jpg';
import duplexImg from '../assets/images/prop_modern_duplex_1791746109850.jpg';
import bungalowImg from '../assets/images/prop_sunset_bungalow_1791746121704.jpg';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Maple Heights House',
    address: '412 Maple Boulevard',
    city: 'Seattle',
    state: 'WA',
    zip: '98103',
    type: 'whole_house_sublease',
    imageUrl: craftsmanImg,
    // Master Lease terms (Rented from house owner)
    masterRentAmount: 2800,
    masterRentDueDay: 1, // Due on the 1st of month to owner
    masterLandlord: {
      name: 'Robert Sterling (House Owner)',
      phone: '+1 (206) 555-8821',
      email: 'robert.sterling.owner@gmail.com',
      paymentMethod: 'Direct Bank Transfer / ACH',
      accountDetails: 'Chase Bank · Acc: **** 4492 · Routing: 125000024',
      notes: 'Master lease renews June 2027. Requires payment by the 1st without fail.'
    },
    masterLeaseStart: '2025-06-01',
    masterLeaseEnd: '2027-05-31',
    // Individual classes/rooms rented separately to subtenants
    units: [
      {
        id: 'unit-1-class-a',
        propertyId: 'prop-1',
        name: 'Class / Room A (Main Hall)',
        rentAmount: 950,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 50,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-1',
          unitId: 'unit-1-class-a',
          name: 'Marcus Vance',
          phone: '+1 (206) 555-0142',
          email: 'marcus.vance@gmail.com',
          leaseStart: '2025-06-01',
          leaseEnd: '2027-05-31',
          depositAmount: 950,
          reminderPreference: 'whatsapp',
          notes: 'Subtenant in Class A. Always pays on time via Zelle.'
        }
      },
      {
        id: 'unit-1-class-b',
        propertyId: 'prop-1',
        name: 'Class / Room B (Garden Suite)',
        rentAmount: 850,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 40,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-2',
          unitId: 'unit-1-class-b',
          name: 'Sarah Chen',
          phone: '+1 (206) 555-0891',
          email: 'sarah.chen@techmail.io',
          leaseStart: '2026-02-01',
          leaseEnd: '2027-01-31',
          depositAmount: 850,
          reminderPreference: 'sms',
          notes: 'Graduate student. Prefers SMS payment reminders.'
        }
      },
      {
        id: 'unit-1-class-c',
        propertyId: 'prop-1',
        name: 'Class / Room C (West Wing)',
        rentAmount: 800,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 40,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-3-c',
          unitId: 'unit-1-class-c',
          name: 'Liam Cooper',
          phone: '+1 (206) 555-4421',
          email: 'liam.cooper@sounddesign.com',
          leaseStart: '2026-03-01',
          leaseEnd: '2027-02-28',
          depositAmount: 800,
          reminderPreference: 'whatsapp',
          notes: 'Paid on time for October.'
        }
      },
      {
        id: 'unit-1-class-d',
        propertyId: 'prop-1',
        name: 'Class / Room D (Upper Studio)',
        rentAmount: 950,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 50,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-4-d',
          unitId: 'unit-1-class-d',
          name: 'Emma Watson',
          phone: '+1 (206) 555-9912',
          email: 'emma.watson@uw.edu',
          leaseStart: '2025-09-01',
          leaseEnd: '2027-08-31',
          depositAmount: 950,
          reminderPreference: 'email',
          notes: 'Lecturer at university.'
        }
      }
    ]
  },
  {
    id: 'prop-2',
    name: 'Highland Ridge Contemporary House',
    address: '882 Cedar Crest Way',
    city: 'Bellevue',
    state: 'WA',
    zip: '98004',
    type: 'whole_house_sublease',
    imageUrl: duplexImg,
    masterRentAmount: 3200,
    masterRentDueDay: 1,
    masterLandlord: {
      name: 'Eleanor Vance (House Owner)',
      phone: '+1 (425) 555-3310',
      email: 'eleanor.vance@bellevuerealty.net',
      paymentMethod: 'Direct ACH Wire',
      accountDetails: 'Wells Fargo · Acc: **** 8820 · Routing: 121000248',
      notes: 'Requires payment confirmation receipt by 1st of each month.'
    },
    masterLeaseStart: '2025-10-01',
    masterLeaseEnd: '2027-09-30',
    units: [
      {
        id: 'unit-2-class-1',
        propertyId: 'prop-2',
        name: 'Class / Room 1 (Upper Executive)',
        rentAmount: 1400,
        rentDueDay: 1, // Due Oct 1 - OVERDUE!
        gracePeriodDays: 5,
        lateFeeAmount: 65,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-3',
          unitId: 'unit-2-class-1',
          name: 'Julian Montgomery',
          phone: '+1 (425) 555-4319',
          email: 'j.montgomery@outlook.com',
          leaseStart: '2025-11-01',
          leaseEnd: '2026-10-31',
          depositAmount: 1400,
          reminderPreference: 'all',
          notes: 'Overdue 10 days for October. Late fee applied. Requires WhatsApp reminder.'
        }
      },
      {
        id: 'unit-2-class-2',
        propertyId: 'prop-2',
        name: 'Class / Room 2 (Terrace Suite)',
        rentAmount: 1200,
        rentDueDay: 5, // Due Oct 5 - PARTIAL!
        gracePeriodDays: 5,
        lateFeeAmount: 50,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-4',
          unitId: 'unit-2-class-2',
          name: 'David & Rachel Ross',
          phone: '+1 (425) 555-7722',
          email: 'ross.family@live.com',
          leaseStart: '2026-04-01',
          leaseEnd: '2027-03-31',
          depositAmount: 1200,
          reminderPreference: 'whatsapp',
          notes: 'Paid $800 partial on Oct 5. $400 balance remaining.'
        }
      },
      {
        id: 'unit-2-class-3',
        propertyId: 'prop-2',
        name: 'Class / Room 3 (Courtyard Room)',
        rentAmount: 1100,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 45,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-5-c',
          unitId: 'unit-2-class-3',
          name: 'Chloe Zhao',
          phone: '+1 (425) 555-1029',
          email: 'chloe.zhao@designstudio.org',
          leaseStart: '2026-01-01',
          leaseEnd: '2026-12-31',
          depositAmount: 1100,
          reminderPreference: 'sms',
          notes: 'Paid Oct 1 on time.'
        }
      },
      {
        id: 'unit-2-class-4',
        propertyId: 'prop-2',
        name: 'Class / Room 4 (Garden Studio)',
        rentAmount: 1150,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 50,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-6-d',
          unitId: 'unit-2-class-4',
          name: 'Alex Rivera',
          phone: '+1 (425) 555-9031',
          email: 'alex.rivera@fintech.co',
          leaseStart: '2026-05-01',
          leaseEnd: '2027-04-30',
          depositAmount: 1150,
          reminderPreference: 'whatsapp',
          notes: 'Paid Oct 2 on time.'
        }
      }
    ]
  },
  {
    id: 'prop-3',
    name: 'Sunset Palms Bungalow House',
    address: '1540 Coronado Avenue',
    city: 'San Diego',
    state: 'CA',
    zip: '92109',
    type: 'whole_house_sublease',
    imageUrl: bungalowImg,
    masterRentAmount: 2600,
    masterRentDueDay: 5, // Due on the 5th
    masterLandlord: {
      name: 'Marina Properties LLC (Owner)',
      phone: '+1 (619) 555-1200',
      email: 'leasing@marinapropertiesca.com',
      paymentMethod: 'Bank Wire / Portal',
      accountDetails: 'Bank of America · Portal ID: MP-CA-771',
      notes: 'Monthly master rent auto-debit on 5th.'
    },
    masterLeaseStart: '2024-09-01',
    masterLeaseEnd: '2027-08-31',
    units: [
      {
        id: 'unit-3-class-a',
        propertyId: 'prop-3',
        name: 'Class / Room A (Primary Suite)',
        rentAmount: 1350,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 60,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-5',
          unitId: 'unit-3-class-a',
          name: 'Dr. Evelyn Martinez',
          phone: '+1 (619) 555-9014',
          email: 'evelyn.martinez@healthcareservices.org',
          leaseStart: '2024-09-01',
          leaseEnd: '2027-08-31',
          depositAmount: 1350,
          reminderPreference: 'email',
          notes: 'Pediatrician. Always pays promptly.'
        }
      },
      {
        id: 'unit-3-class-b',
        propertyId: 'prop-3',
        name: 'Class / Room B (Sunroom Class)',
        rentAmount: 1050,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 45,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-7-b',
          unitId: 'unit-3-class-b',
          name: 'Jordan Patel',
          phone: '+1 (619) 555-7788',
          email: 'jordan.patel@biotechlabs.com',
          leaseStart: '2026-03-01',
          leaseEnd: '2027-02-28',
          depositAmount: 1050,
          reminderPreference: 'whatsapp',
          notes: 'Paid Oct 1.'
        }
      },
      {
        id: 'unit-3-class-c',
        propertyId: 'prop-3',
        name: 'Class / Room C (Cottage Section)',
        rentAmount: 1100,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 50,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: 'ten-8-c',
          unitId: 'unit-3-class-c',
          name: 'Maya Lin',
          phone: '+1 (619) 555-3344',
          email: 'maya.lin@sdarts.edu',
          leaseStart: '2026-01-15',
          leaseEnd: '2027-01-14',
          depositAmount: 1100,
          reminderPreference: 'sms',
          notes: 'Paid Oct 1.'
        }
      }
    ]
  }
];

// Master Rent payments paid by the user to the house owners for October 2026
export const INITIAL_MASTER_PAYMENTS: MasterRentPayment[] = [
  {
    id: 'master-pay-1',
    propertyId: 'prop-1',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 2800,
    amountPaid: 2800,
    paidDate: '2026-10-01',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'ACH-OWNER-44921',
    notes: 'Paid on time to Robert Sterling for whole Maple Heights house.',
    recordedAt: '2026-10-01T08:30:00Z'
  },
  {
    id: 'master-pay-2',
    propertyId: 'prop-2',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 3200,
    amountPaid: 3200,
    paidDate: '2026-10-01',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'WIRE-OWNER-88201',
    notes: 'Paid on time to Eleanor Vance for whole Highland Ridge house.',
    recordedAt: '2026-10-01T08:45:00Z'
  },
  {
    id: 'master-pay-3',
    propertyId: 'prop-3',
    monthYear: '2026-10',
    dueDate: '2026-10-05',
    amountDue: 2600,
    amountPaid: 2600,
    paidDate: '2026-10-05',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'PORTAL-MP-9941',
    notes: 'Paid on time to Marina Properties for whole Sunset Palms house.',
    recordedAt: '2026-10-05T09:10:00Z'
  }
];

// Subtenant incoming rent payment records for October 2026 (Current Date: Oct 11, 2026)
export const INITIAL_PAYMENTS: PaymentRecord[] = [
  // Maple Heights - All 4 classes collected!
  {
    id: 'pay-2026-10-1',
    propertyId: 'prop-1',
    unitId: 'unit-1-class-a',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 950,
    amountPaid: 950,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'zelle',
    referenceNumber: 'ZEL-98234199',
    notes: 'Paid on time.',
    recordedAt: '2026-10-01T09:15:00Z'
  },
  {
    id: 'pay-2026-10-2',
    propertyId: 'prop-1',
    unitId: 'unit-1-class-b',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 850,
    amountPaid: 850,
    paidDate: '2026-10-03',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'ACH-44102941',
    notes: 'Paid during grace period.',
    recordedAt: '2026-10-03T14:22:00Z'
  },
  {
    id: 'pay-2026-10-3c',
    propertyId: 'prop-1',
    unitId: 'unit-1-class-c',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 800,
    amountPaid: 800,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'venmo',
    referenceNumber: 'VEN-44810',
    recordedAt: '2026-10-01T11:00:00Z'
  },
  {
    id: 'pay-2026-10-4d',
    propertyId: 'prop-1',
    unitId: 'unit-1-class-d',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 950,
    amountPaid: 950,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'zelle',
    recordedAt: '2026-10-01T12:00:00Z'
  },

  // Highland Ridge - 2 paid, 1 OVERDUE, 1 PARTIAL
  {
    id: 'pay-2026-10-hr-1',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-1',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1400,
    amountPaid: 0,
    lateFeeApplied: 65,
    status: 'overdue',
    notes: 'Julian Montgomery - 10 days overdue for October room rent! Late fee added.',
    recordedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'pay-2026-10-hr-2',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-2',
    monthYear: '2026-10',
    dueDate: '2026-10-05',
    amountDue: 1200,
    amountPaid: 800,
    paidDate: '2026-10-05',
    lateFeeApplied: 0,
    status: 'partial',
    paymentMethod: 'venmo',
    referenceNumber: 'VEN-550921',
    notes: 'Paid $800 on Oct 5. $400 balance remaining.',
    recordedAt: '2026-10-05T18:40:00Z'
  },
  {
    id: 'pay-2026-10-hr-3',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-3',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1100,
    amountPaid: 1100,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'zelle',
    recordedAt: '2026-10-01T09:00:00Z'
  },
  {
    id: 'pay-2026-10-hr-4',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-4',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1150,
    amountPaid: 1150,
    paidDate: '2026-10-02',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    recordedAt: '2026-10-02T10:15:00Z'
  },

  // Sunset Palms - All 3 paid!
  {
    id: 'pay-2026-10-sp-1',
    propertyId: 'prop-3',
    unitId: 'unit-3-class-a',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1350,
    amountPaid: 1350,
    paidDate: '2026-09-30',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    recordedAt: '2026-09-30T11:00:00Z'
  },
  {
    id: 'pay-2026-10-sp-2',
    propertyId: 'prop-3',
    unitId: 'unit-3-class-b',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1050,
    amountPaid: 1050,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'zelle',
    recordedAt: '2026-10-01T14:00:00Z'
  },
  {
    id: 'pay-2026-10-sp-3',
    propertyId: 'prop-3',
    unitId: 'unit-3-class-c',
    monthYear: '2026-10',
    dueDate: '2026-10-01',
    amountDue: 1100,
    amountPaid: 1100,
    paidDate: '2026-10-01',
    lateFeeApplied: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    recordedAt: '2026-10-01T15:00:00Z'
  }
];

// Unit & House Maintenance & Operating Costs (Repairs, high-speed WiFi, shared cleaning)
export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    propertyId: 'prop-1',
    unitId: 'unit-1-class-a',
    category: 'plumbing',
    amount: 160,
    date: '2026-10-04',
    vendor: 'Rainier Pro Plumbing',
    description: 'En-suite shower cartridge replaced in Class / Room A',
    receiptNumber: 'INV-7881',
    status: 'paid'
  },
  {
    id: 'exp-2',
    propertyId: 'prop-1',
    unitId: 'whole_property',
    category: 'utilities_wifi',
    amount: 140,
    date: '2026-10-02',
    vendor: 'Comcast Business Fiber',
    description: 'Gigabit Mesh WiFi for all subtenants in Maple Heights House',
    receiptNumber: 'CC-9021',
    status: 'paid'
  },
  {
    id: 'exp-3',
    propertyId: 'prop-1',
    unitId: 'whole_property',
    category: 'cleaning',
    amount: 180,
    date: '2026-10-06',
    vendor: 'Sparkle Maid Service',
    description: 'Bi-weekly common area, kitchen & hallway deep cleaning',
    receiptNumber: 'SM-4412',
    status: 'paid'
  },
  {
    id: 'exp-4',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-1',
    category: 'hvac',
    amount: 220,
    date: '2026-09-25',
    vendor: 'Sound Air Systems',
    description: 'Ductless mini-split tuneup & seasonal filter replacement in Class 1',
    receiptNumber: 'SAS-1092',
    status: 'paid'
  },
  {
    id: 'exp-5',
    propertyId: 'prop-2',
    unitId: 'whole_property',
    category: 'utilities_wifi',
    amount: 155,
    date: '2026-10-03',
    vendor: 'CenturyLink Fiber',
    description: 'High-speed Mesh WiFi for Highland Ridge House subtenants',
    receiptNumber: 'CL-8802',
    status: 'paid'
  },
  {
    id: 'exp-6',
    propertyId: 'prop-3',
    unitId: 'unit-3-class-a',
    category: 'repairs',
    amount: 195,
    date: '2026-10-07',
    vendor: 'Pacific Coast Handyman',
    description: 'Closet sliding door track repair and lock replacement in Class A',
    receiptNumber: 'PCH-8820',
    status: 'paid'
  }
];

export const INITIAL_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Upcoming Class/Room Rent Reminder (3 Days Before)',
    trigger: '3_days_before',
    subject: 'Friendly Reminder: {unit_name} rent is due on {due_date}',
    body: 'Hi {tenant_name}, this is a friendly reminder that your monthly rent of {amount_due} for {unit_name} at {property_name} is due in 3 days on {due_date}. Thank you!',
    isActive: true
  },
  {
    id: 'tpl-2',
    name: 'Class/Room Rent Due Today Reminder',
    trigger: 'due_day',
    subject: 'Rent Payment Due Today - {unit_name}',
    body: 'Hello {tenant_name}, rent of {amount_due} for {unit_name} ({property_name}) is due today, {due_date}. You can send payment via Zelle or bank transfer. Thanks!',
    isActive: true
  },
  {
    id: 'tpl-3',
    name: 'Overdue Class/Room Rent Notice',
    trigger: '3_days_overdue',
    subject: 'Notice: Rent Payment Past Due for {unit_name}',
    body: 'Hi {tenant_name}, our records show rent of {amount_due} for {unit_name} was due on {due_date} and is now overdue. Please submit payment promptly to prevent late fees. Let me know if you have sent it!',
    isActive: true
  },
  {
    id: 'tpl-4',
    name: 'Late Fee & Formal Notice (7+ Days Overdue)',
    trigger: '7_days_overdue',
    subject: 'Urgent: Overdue Rent & Late Fee Notice - {unit_name}',
    body: 'Dear {tenant_name}, your rent payment of {amount_due} for {unit_name} is now {overdue_days} days overdue. A late fee of {late_fee} has been applied, bringing the current balance to {total_due}. Please settle this balance immediately.',
    isActive: true
  }
];

export const INITIAL_REMINDER_LOGS: ReminderLog[] = [
  {
    id: 'rem-log-1',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-1',
    tenantName: 'Julian Montgomery',
    tenantContact: '+1 (425) 555-4319',
    channel: 'whatsapp',
    trigger: '3_days_overdue',
    sentAt: '2026-10-06T10:30:00Z',
    messageText: 'Hi Julian, our records show rent of $1,400 for Class / Room 1 was due Oct 1 and is past due. Please submit payment today.',
    status: 'delivered',
    amountDue: 1400
  },
  {
    id: 'rem-log-2',
    propertyId: 'prop-2',
    unitId: 'unit-2-class-2',
    tenantName: 'David & Rachel Ross',
    tenantContact: '+1 (425) 555-7722',
    channel: 'sms',
    trigger: 'due_day',
    sentAt: '2026-10-05T08:00:00Z',
    messageText: 'Hello David & Rachel, rent of $1,200 is due today Oct 5. Thanks!',
    status: 'delivered',
    amountDue: 1200
  }
];
