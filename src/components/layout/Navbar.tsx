import React from 'react';
import { ViewTab } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Plus, Smartphone, Monitor, FileText, Building2, Calendar } from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenQuickRecord: () => void;
  onOpenRecordMasterPayment?: () => void;
  onOpenFinancialReport: () => void;
  deviceMode: 'desktop' | 'mobile_preview';
  onToggleDeviceMode: () => void;
  pendingRemindersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickRecord,
  onOpenRecordMasterPayment,
  onOpenFinancialReport,
  deviceMode,
  onToggleDeviceMode,
  pendingRemindersCount,
}) => {
  const navItems: { id: ViewTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'properties', label: 'Houses & Classes' },
    { id: 'payments', label: 'Subtenant Rents' },
    { id: 'master_rents', label: 'Master Rent to Owners' },
    { id: 'expenses', label: 'Repairs & Costs' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'reminders', label: 'Reminders', badge: pendingRemindersCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="text-left group cursor-pointer"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors whitespace-nowrap">
                Hearthstone
              </span>
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-normal">
              Sublease Arbitrage
            </span>
            <button
              onClick={() => onTabChange('calendar')}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-lg text-emerald-900 text-xs font-mono font-medium transition-colors cursor-pointer"
              title="View Ethiopian Rent Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>ጥቅምት 1, 2019 ዓ.ም (Tikimt 1)</span>
            </button>
          </div>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-1 text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + helper utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Device preview switcher */}
            <button
              onClick={onToggleDeviceMode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title={deviceMode === 'desktop' ? 'Switch to mobile app phone preview' : 'Switch to desktop widescreen view'}
            >
              {deviceMode === 'desktop' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Phone View</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Desktop View</span>
                </>
              )}
            </button>

            {/* Financial summary print/export button */}
            <button
              onClick={onOpenFinancialReport}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Generate financial arbitrage summary"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-medium">Arbitrage Report</span>
            </button>

            <PWAInstallButton />

            {/* Primary Action Button */}
            <button
              onClick={onOpenQuickRecord}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Record Rent</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
