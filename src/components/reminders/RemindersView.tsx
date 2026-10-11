import React, { useState } from 'react';
import { Property, PaymentRecord, ReminderTemplate, ReminderLog } from '../../types';
import { formatCurrency, formatDate, APP_CURRENT_DATE } from '../../utils/formatters';
import { 
  evaluatePendingReminders, 
  buildWhatsAppUrl, 
  buildSmsUrl, 
  buildEmailUrl, 
  PendingReminderItem 
} from '../../utils/reminders';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Settings2, 
  History,
  Sparkles
} from 'lucide-react';

interface RemindersViewProps {
  properties: Property[];
  payments: PaymentRecord[];
  templates: ReminderTemplate[];
  reminderLogs: ReminderLog[];
  isAutoEnabled: boolean;
  onToggleAuto: (enabled: boolean) => void;
  onUpdateTemplates: (templates: ReminderTemplate[]) => void;
  onLogReminderSent: (log: ReminderLog) => void;
  onBatchSendReminders: (items: PendingReminderItem[]) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  properties,
  payments,
  templates,
  reminderLogs,
  isAutoEnabled,
  onToggleAuto,
  onUpdateTemplates,
  onLogReminderSent,
  onBatchSendReminders,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'templates' | 'history'>('queue');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null);
  const [showBatchSuccess, setShowBatchSuccess] = useState(false);

  // Evaluate reminders that need sending
  const pendingReminders = evaluatePendingReminders(properties, payments, templates, APP_CURRENT_DATE);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSingleDispatch = (item: PendingReminderItem, channel: 'whatsapp' | 'sms' | 'email') => {
    const log: ReminderLog = {
      id: `rem-log-${Date.now()}`,
      propertyId: item.property.id,
      unitId: item.unit.id,
      tenantName: item.tenant.name,
      tenantContact: channel === 'email' ? item.tenant.email : item.tenant.phone,
      channel,
      trigger: item.trigger,
      sentAt: new Date().toISOString(),
      messageText: item.messageText,
      status: 'delivered',
      amountDue: item.balanceDue,
    };
    onLogReminderSent(log);
  };

  const handleRunBatch = () => {
    if (pendingReminders.length === 0) return;
    onBatchSendReminders(pendingReminders);
    setShowBatchSuccess(true);
    setTimeout(() => setShowBatchSuccess(false), 4000);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const updated = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    onUpdateTemplates(updated);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Automated Payment Reminders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automate rent collection reminders via WhatsApp, SMS, and Email with overdue tracking
          </p>
        </div>

        {/* Automated Engine Status Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Auto Reminders:</span>
            <button
              onClick={() => onToggleAuto(!isAutoEnabled)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                isAutoEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isAutoEnabled ? 'Active' : 'Paused'}
            </button>
          </div>

          {pendingReminders.length > 0 && (
            <button
              onClick={handleRunBatch}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send All ({pendingReminders.length})</span>
            </button>
          )}
        </div>
      </div>

      {showBatchSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Automated reminders generated and logged to history for all {pendingReminders.length} pending tenants!</span>
        </div>
      )}

      {/* Sub Tabs: Queue, Templates, History */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'queue'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Reminder Queue ({pendingReminders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'templates'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Message Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'history'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dispatch History ({reminderLogs.length})
        </button>
      </div>

      {/* SUBTAB 1: QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          {pendingReminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">All Rent Collections are Current!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No tenants currently have upcoming deadlines or overdue balances. The automated reminder engine will notify you when a due date approaches.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReminders.map(item => {
                const waUrl = buildWhatsAppUrl(item.tenant.phone, item.messageText);
                const smsUrl = buildSmsUrl(item.tenant.phone, item.messageText);
                const emailUrl = buildEmailUrl(item.tenant.email, item.emailSubject, item.messageText);

                return (
                  <div
                    key={item.id}
                    className={`p-5 bg-white rounded-2xl border shadow-xs transition-all space-y-3 ${
                      item.urgency === 'critical'
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : item.urgency === 'high'
                        ? 'border-amber-300'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.urgency === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : item.urgency === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.triggerLabel}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.property.name} · {item.unit.name}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 mt-1">{item.tenant.name}</h2>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-500 block">Outstanding Balance</span>
                        <div className="flex items-baseline gap-1.5 sm:justify-end">
                          <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                            {formatCurrency(item.totalWithLateFee)}
                          </span>
                          {item.lateFee > 0 && (
                            <span className="text-[11px] font-medium text-amber-700">
                              (incl. {formatCurrency(item.lateFee)} late fee)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pre-formatted message preview */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 relative group font-sans">
                      <p className="whitespace-pre-line leading-relaxed">{item.messageText}</p>
                      <button
                        onClick={() => handleCopyText(item.id, item.messageText)}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                        title="Copy reminder text"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Dispatch Channels */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Phone: <strong className="text-slate-700">{item.tenant.phone}</strong></span>
                        <span>Email: <strong className="text-slate-700">{item.tenant.email}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleSingleDispatch(item, 'whatsapp')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* SMS */}
                        <a
                          href={smsUrl}
                          onClick={() => handleSingleDispatch(item, 'sms')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>SMS</span>
                        </a>

                        {/* Email */}
                        <a
                          href={emailUrl}
                          onClick={() => handleSingleDispatch(item, 'email')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-600" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customizable Reminder Templates</h2>
            <p className="text-xs text-slate-500">
              Customize automated messages. Available merge tags:{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{tenant_name}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{property_name}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{unit_name}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{amount_due}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{due_date}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{overdue_days}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{late_fee}'}</code>,{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{'{total_due}'}</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900">{tpl.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{tpl.trigger.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-2">Subject: {tpl.subject}</p>
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed">
                    {tpl.body}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Template Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Edit Reminder Template</h3>
                <form onSubmit={handleSaveTemplate} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Subject</label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Message Body</label>
                    <textarea
                      rows={5}
                      value={editingTemplate.body}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(null)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: HISTORY LOG */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Sent Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Tenant & Unit</th>
                  <th className="py-3 px-4 font-semibold">Channel</th>
                  <th className="py-3 px-4 font-semibold">Trigger Notice</th>
                  <th className="py-3 px-4 font-semibold">Message Dispatched</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reminderLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No reminder notifications have been logged yet.
                    </td>
                  </tr>
                ) : (
                  reminderLogs.map(log => {
                    const prop = properties.find(p => p.id === log.propertyId);
                    const unit = prop?.units.find(u => u.id === log.unitId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {formatDate(log.sentAt.substring(0, 10))}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{log.tenantName}</span>
                          <span className="text-[11px] text-slate-500">{unit?.name || log.unitId}</span>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-slate-700">
                          {log.channel}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                            {log.trigger.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-sm">
                          <span className="block truncate font-sans">{log.messageText}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(log.amountDue)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
