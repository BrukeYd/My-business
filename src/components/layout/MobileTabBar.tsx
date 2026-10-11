import React from 'react';
import { ViewTab } from '../../types';
import { LayoutDashboard, Home, DollarSign, Calendar, Wrench, Bell, Plus } from 'lucide-react';

interface MobileTabBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenQuickRecord: () => void;
  pendingRemindersCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickRecord,
  pendingRemindersCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Overview */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'dashboard' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Overview</span>
        </button>

        {/* Tab 2: Houses & Units */}
        <button
          onClick={() => onTabChange('properties')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'properties' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'properties' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Houses</span>
        </button>

        {/* Tab 3: Center Quick Add Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenQuickRecord}
            className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer -mt-3 border-2 border-white"
            title="Record payment or expense"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Payments / Overdue */}
        <button
          onClick={() => onTabChange('payments')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'payments' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className={`w-5 h-5 ${currentTab === 'payments' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Rent</span>
        </button>

        {/* Tab 5: Reminders or Calendar */}
        <button
          onClick={() => onTabChange('reminders')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'reminders' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className={`w-5 h-5 ${currentTab === 'reminders' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          {pendingRemindersCount > 0 && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
          <span className="text-[10px] mt-1 tracking-tight">Reminders</span>
        </button>
      </div>
    </div>
  );
};
