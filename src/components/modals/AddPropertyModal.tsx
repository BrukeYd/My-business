import React, { useState } from 'react';
import { Property, Unit } from '../../types';
import craftsmanImg from '../../assets/images/prop_craftsman_house_1791746096895.jpg';
import duplexImg from '../../assets/images/prop_modern_duplex_1791746109850.jpg';
import bungalowImg from '../../assets/images/prop_sunset_bungalow_1791746121704.jpg';
import { EthDatePicker } from '../common/EthDatePicker';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Trash2, ShieldCheck, Calendar } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProperty: (property: Property) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onSaveProperty,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [state, setState] = useState('Bole');
  const [zip, setZip] = useState('1000');
  const [selectedImage, setSelectedImage] = useState<string>(craftsmanImg);

  // Master Lease from House Owner
  const [masterRentAmount, setMasterRentAmount] = useState<number>(35000);
  const [masterRentDueDay, setMasterRentDueDay] = useState<number>(1);
  const [masterLeaseStart, setMasterLeaseStart] = useState<string>('2026-09-11'); // Meskerem 1, 2019 ዓ.ም
  const [masterLeaseEnd, setMasterLeaseEnd] = useState<string>('2027-09-10'); // Pagume 5, 2019 ዓ.ም
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPaymentMethod, setOwnerPaymentMethod] = useState('CBE / Telebirr');

  // Classes / Rooms Rented Separately to Subtenants
  const [units, setUnits] = useState<Omit<Unit, 'id' | 'propertyId'>[]>([
    {
      name: 'Class / Room 1 (Master)',
      rentAmount: 14000,
      rentDueDay: 1,
      gracePeriodDays: 5,
      lateFeeAmount: 500,
      status: 'occupied',
      capacity: 1,
      tenant: {
        id: `ten-${Date.now()}-1`,
        unitId: '',
        name: '',
        phone: '',
        email: '',
        leaseStart: '2026-09-11',
        leaseEnd: '2027-09-10',
        depositAmount: 14000,
        reminderPreference: 'whatsapp',
      }
    },
    {
      name: 'Class / Room 2',
      rentAmount: 12000,
      rentDueDay: 1,
      gracePeriodDays: 5,
      lateFeeAmount: 400,
      status: 'occupied',
      capacity: 1,
      tenant: {
        id: `ten-${Date.now()}-2`,
        unitId: '',
        name: '',
        phone: '',
        email: '',
        leaseStart: '2026-09-11',
        leaseEnd: '2027-09-10',
        depositAmount: 12000,
        reminderPreference: 'sms',
      }
    },
    {
      name: 'Class / Room 3',
      rentAmount: 11000,
      rentDueDay: 1,
      gracePeriodDays: 5,
      lateFeeAmount: 400,
      status: 'occupied',
      capacity: 1,
      tenant: {
        id: `ten-${Date.now()}-3`,
        unitId: '',
        name: '',
        phone: '',
        email: '',
        leaseStart: '2026-09-11',
        leaseEnd: '2027-09-10',
        depositAmount: 11000,
        reminderPreference: 'whatsapp',
      }
    }
  ]);

  if (!isOpen) return null;

  const totalSubtenantRent = units.reduce((s, u) => s + (u.rentAmount || 0), 0);
  const projectedSpread = totalSubtenantRent - masterRentAmount;

  const handleAddUnit = () => {
    setUnits([
      ...units,
      {
        name: `Class / Room ${units.length + 1}`,
        rentAmount: 10000,
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeeAmount: 400,
        status: 'occupied',
        capacity: 1,
        tenant: {
          id: `ten-${Date.now()}-${units.length}`,
          unitId: '',
          name: '',
          phone: '',
          email: '',
          leaseStart: '2026-09-11',
          leaseEnd: '2027-09-10',
          depositAmount: 10000,
          reminderPreference: 'sms',
        }
      }
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    if (units.length <= 1) return;
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || masterRentAmount <= 0) return;

    const propId = `prop-${Date.now()}`;
    const builtUnits: Unit[] = units.map((u, i) => {
      const uId = `unit-${propId}-${i + 1}`;
      return {
        ...u,
        id: uId,
        propertyId: propId,
        tenant: u.tenant && u.tenant.name.trim() ? {
          ...u.tenant,
          unitId: uId,
        } : undefined,
      };
    });

    const newProp: Property = {
      id: propId,
      name: name.trim(),
      address: address.trim(),
      city: city.trim() || 'Addis Ababa',
      state: state.trim() || 'Bole',
      zip: zip.trim() || '1000',
      type: 'whole_house_sublease',
      imageUrl: selectedImage,
      masterRentAmount: Number(masterRentAmount),
      masterRentDueDay: Number(masterRentDueDay),
      masterLeaseStart,
      masterLeaseEnd,
      masterLandlord: {
        name: ownerName.trim() || 'Property Owner',
        phone: ownerPhone.trim() || '',
        email: ownerEmail.trim() || '',
        paymentMethod: ownerPaymentMethod,
      },
      units: builtUnits,
    };

    onSaveProperty(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add Leased House & Separate Classes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              የተከራዩት ሙሉ ቤት እና ክፍሎች መመዝገቢያ (የኢትዮጵያ ዘመን አቆጣጠር)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Projected Arbitrage Summary Badge */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Master Rent Paid to Owner:</span>
              <strong className="font-mono text-sm text-rose-300">{formatCurrency(masterRentAmount)}/mo</strong>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[10px]">Total Subtenant Rent:</span>
              <strong className="font-mono text-sm text-emerald-400">{formatCurrency(totalSubtenantRent)}/mo</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Projected Net Arbitrage Spread:</span>
              <strong className="font-mono text-sm text-emerald-300 font-bold">
                {projectedSpread >= 0 ? `+${formatCurrency(projectedSpread)}/mo` : `-${formatCurrency(Math.abs(projectedSpread))}/mo`}
              </strong>
            </div>
          </div>

          {/* House Image Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Property Photo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { img: craftsmanImg, label: 'Craftsman Estate' },
                { img: duplexImg, label: 'Modern Multi-Room' },
                { img: bungalowImg, label: 'Villa Compound' },
              ].map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(item.img)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === item.img ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={item.img} alt={item.label} className="w-full h-16 object-cover" />
                  <span className="block text-[10px] text-center font-medium py-1 bg-slate-900/80 text-white truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: House & Master Lease Terms */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Whole House & Master Lease to House Owner</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">House Name / Label</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bole Medhanialem House (4 Rooms)"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Master Rent Paid to Owner</label>
                <input
                  type="number"
                  min="1"
                  value={masterRentAmount || ''}
                  onChange={(e) => setMasterRentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 35000"
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-rose-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCurrency(masterRentAmount || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Edna Mall, House #412"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Master Rent Due Day <span className="text-[10px] text-emerald-700 font-semibold">(ቀን)</span>
                </label>
                <select
                  value={masterRentDueDay}
                  onChange={(e) => setMasterRentDueDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="1">ቀን 1 (Ethiopian Day 1 / መጀመሪያ)</option>
                  <option value="5">ቀን 5 (Ethiopian Day 5)</option>
                  <option value="10">ቀን 10 (Ethiopian Day 10)</option>
                  <option value="15">ቀን 15 (Ethiopian Day 15)</option>
                  <option value="20">ቀን 20 (Ethiopian Day 20)</option>
                  <option value="25">ቀን 25 (Ethiopian Day 25)</option>
                  <option value="30">ቀን 30 (Ethiopian Day 30 / መጨረሻ)</option>
                </select>
              </div>
            </div>

            {/* Master Lease Agreement Dates with Owner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Master Lease Period with Owner (የውል ጊዜ ከዋናው ባለቤት ጋር)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EthDatePicker
                  label="የውል መጀመሪያ ቀን / Lease Start"
                  value={masterLeaseStart}
                  onChange={setMasterLeaseStart}
                />
                <EthDatePicker
                  label="የውል ማብቂያ ቀን / Lease End"
                  value={masterLeaseEnd}
                  onChange={setMasterLeaseEnd}
                />
              </div>
            </div>

            {/* Owner Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">House Owner / Head Landlord Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner Full Name (e.g. Ato Bekele)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="Owner Phone (+251...)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={ownerPaymentMethod}
                    onChange={(e) => setOwnerPaymentMethod(e.target.value)}
                    placeholder="Payment (e.g. CBE / Telebirr)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Classes / Rooms Subleased Separately */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Classes / Rooms Rented Separately to Subtenants
                </h3>
                <p className="text-[11px] text-slate-500">
                  ለተከራዮች የተከራዩ ክፍሎች እና የክፍያ ቀናት (የኢትዮጵያ ቀን አቆጣጠር)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddUnit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Class / Room</span>
              </button>
            </div>

            {units.map((unit, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">Class / Room #{idx + 1}</span>
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Class/Room Name</label>
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(e) => {
                        const next = [...units];
                        next[idx].name = e.target.value;
                        setUnits(next);
                      }}
                      placeholder="e.g. Class 1 (Main Hall)"
                      required
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Subtenant Rent (ብር/mo)</label>
                    <input
                      type="number"
                      min="1"
                      value={unit.rentAmount}
                      onChange={(e) => {
                        const next = [...units];
                        next[idx].rentAmount = parseFloat(e.target.value) || 0;
                        setUnits(next);
                      }}
                      placeholder="Rent amount"
                      required
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Due Day (የክፍያ ቀን)</label>
                    <select
                      value={unit.rentDueDay}
                      onChange={(e) => {
                        const next = [...units];
                        next[idx].rentDueDay = parseInt(e.target.value, 10);
                        setUnits(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    >
                      <option value="1">ቀን 1 (Ethiopian Day 1)</option>
                      <option value="5">ቀን 5 (Ethiopian Day 5)</option>
                      <option value="10">ቀን 10 (Ethiopian Day 10)</option>
                      <option value="15">ቀን 15 (Ethiopian Day 15)</option>
                      <option value="20">ቀን 20 (Ethiopian Day 20)</option>
                      <option value="25">ቀን 25 (Ethiopian Day 25)</option>
                      <option value="30">ቀን 30 (Ethiopian Day 30)</option>
                    </select>
                  </div>
                </div>

                {/* Subtenant details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Subtenant Name</label>
                    <input
                      type="text"
                      value={unit.tenant?.name || ''}
                      onChange={(e) => {
                        const next = [...units];
                        if (next[idx].tenant) next[idx].tenant!.name = e.target.value;
                        setUnits(next);
                      }}
                      placeholder="Tenant Name (e.g. Almaz Tadesse)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Phone (for WhatsApp/SMS)</label>
                    <input
                      type="tel"
                      value={unit.tenant?.phone || ''}
                      onChange={(e) => {
                        const next = [...units];
                        if (next[idx].tenant) next[idx].tenant!.phone = e.target.value;
                        setUnits(next);
                      }}
                      placeholder="+251 9..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Email</label>
                    <input
                      type="email"
                      value={unit.tenant?.email || ''}
                      onChange={(e) => {
                        const next = [...units];
                        if (next[idx].tenant) next[idx].tenant!.email = e.target.value;
                        setUnits(next);
                      }}
                      placeholder="tenant@gmail.com"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Subtenant Lease Start in Ethiopian Date */}
                {unit.tenant && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <EthDatePicker
                      label="Subtenant Lease Start (የተከራይ ውል መጀመሪያ)"
                      value={unit.tenant.leaseStart}
                      onChange={(d) => {
                        const next = [...units];
                        if (next[idx].tenant) next[idx].tenant!.leaseStart = d;
                        setUnits(next);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
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
              Save Leased House & Classes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
