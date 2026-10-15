import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  History, 
  CheckSquare, 
  ShieldAlert, 
  Sparkles,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { api } from '../../lib/api';
import { formatDate, formatDateTime, timeAgo } from '../../lib/format';

export function Communications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'compose';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Compose State
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sendError, setSendError] = useState(null);

  // History & Tasks State
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('ALL');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      updatePreview();
    }
  }, [selectedCustomerId, selectedTemplateId]);

  const loadInitialData = async () => {
    try {
      const [cRes, tRes, hRes, taskRes] = await Promise.all([
        api.getCustomers(),
        api.getTemplates(),
        api.getCommHistory(),
        api.getTasks(),
      ]);
      setCustomers(cRes.customers || []);
      setTemplates(tRes.templates || []);
      setHistory(hRes.communications || []);
      setTasks(taskRes.tasks || []);

      if (cRes.customers?.length > 0 && !selectedCustomerId) {
        // Pre-select first or one with consent
        setSelectedCustomerId(cRes.customers[0].id);
      }
      if (tRes.templates?.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(tRes.templates[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updatePreview = async () => {
    if (!selectedCustomerId) return;
    setLoadingPreview(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const res = await api.previewEmail({
        customerId: selectedCustomerId,
        templateId: selectedTemplateId || undefined,
      });
      setPreviewData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendEmail = async () => {
    if (!previewData || !previewData.recipient.hasConsent) return;
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const res = await api.sendEmail({
        customerId: selectedCustomerId,
        templateId: selectedTemplateId,
        subject: previewData.renderedSubject,
        body: previewData.renderedBody,
      });
      setSendSuccess(`Email dispatched successfully! Delivery ID: ${res.providerMessageId}`);
      // Refresh history
      const hRes = await api.getCommHistory();
      setHistory(hRes.communications || []);
    } catch (err) {
      setSendError(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      const taskRes = await api.getTasks();
      setTasks(taskRes.tasks || []);
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const navTabs = [
    { id: 'compose', label: 'Compose & Dispatch', icon: Mail },
    { id: 'templates', label: `Templates (${templates.length})`, icon: FileText },
    { id: 'history', label: `Delivery History (${history.length})`, icon: History },
    { id: 'tasks', label: `Operational Tasks (${tasks.filter(t => t.status === 'PENDING').length} Due)`, icon: CheckSquare },
  ];

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'PENDING') return t.status === 'PENDING';
    if (taskFilter === 'OVERDUE') return t.isOverdue;
    if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">
          Communications & Task Operations
        </h1>
        <p className="text-xs text-navy/60 mt-0.5">
          Consent-guarded outreach workflows with variable interpolation and compliance guards.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy/10 pb-2 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-navy/60 hover:text-navy hover:bg-navy/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Compose */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="card-3d p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Outreach Parameters
            </h3>

            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1.5">
                Target Patron
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-navy/5 border border-navy/10 rounded-xl px-3 py-2.5 text-xs text-navy font-medium focus:outline-none focus:border-brand"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email}) - {c.segment}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Picker */}
            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1.5">
                Email Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-navy/5 border border-navy/10 rounded-xl px-3 py-2.5 text-xs text-navy font-medium focus:outline-none focus:border-brand"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Allowed Placeholders pill guide */}
            <div className="p-3 bg-navy-50/50 rounded-xl border border-navy/5 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-navy/50 block">Auto-Interpolated Fields</span>
              <div className="flex flex-wrap gap-1">
                {['{{firstName}}', '{{totalSpend}}', '{{lastOrderDate}}', '{{storeName}}'].map((ph) => (
                  <span key={ph} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-navy/10 text-brand">
                    {ph}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preview & Dispatch Column */}
          <div className="lg:col-span-2 card-3d p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy/8">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Rendered Communication Preview
                </span>
                {previewData && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    previewData.recipient.hasConsent 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {previewData.recipient.hasConsent ? 'Marketing Consent: Granted' : 'Marketing Consent: BLOCKED'}
                  </span>
                )}
              </div>

              {/* Consent Warning Banner */}
              {previewData && !previewData.recipient.hasConsent && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Legal Compliance Enforcement</h4>
                    <p className="mt-0.5 leading-relaxed">
                      This patron has explicitly revoked email consent or unsubscribed. WooPulse CRM strictly disables email dispatch to comply with CAN-SPAM and GDPR mandates.
                    </p>
                  </div>
                </div>
              )}

              {sendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Email Content Preview */}
              {previewData ? (
                <div className="p-5 rounded-2xl bg-navy-50/40 border border-navy/8 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-navy/40 font-bold block mb-0.5">To:</span>
                    <span className="text-navy font-semibold">{previewData.recipient.name} &lt;{previewData.recipient.email}&gt;</span>
                  </div>
                  <div>
                    <span className="text-navy/40 font-bold block mb-0.5">Subject:</span>
                    <span className="text-navy font-bold font-sans text-sm">{previewData.renderedSubject}</span>
                  </div>
                  <div className="pt-3 border-t border-navy/10 font-sans whitespace-pre-line text-navy/80 leading-relaxed text-xs">
                    {previewData.renderedBody}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-navy/40">
                  Select a patron to generate rendered preview...
                </div>
              )}
            </div>

            {/* Approve and Send Button */}
            <div className="mt-6 pt-4 border-t border-navy/8 flex items-center justify-between">
              <span className="text-xs text-navy/50">
                Dispatches via Resend API (or simulated sandbox).
              </span>

              <button
                disabled={isSending || !previewData?.recipient?.hasConsent}
                onClick={handleSendEmail}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-pill-glow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Dispatching...' : 'Approve & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.id} className="card-3d p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded">
                  Template
                </span>
                <h4 className="text-base font-bold text-navy mt-2">{t.name}</h4>
                <p className="text-xs font-semibold text-navy/70 mt-1">{t.subject}</p>
                <div className="p-3 bg-navy-50/50 rounded-xl border border-navy/5 text-xs text-navy/70 whitespace-pre-line mt-3 leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {t.body}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy/8 flex items-center justify-between">
                <span className="text-[10px] text-navy/40 font-mono">
                  {t.allowedPlaceholders?.length || 0} variables
                </span>
                <button
                  onClick={() => {
                    setSelectedTemplateId(t.id);
                    setActiveTab('compose');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="card-3d rounded-2xl overflow-hidden border border-navy/8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-50/60 border-b border-navy/8 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                <th className="py-3 px-6">Recipient Patron</th>
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Provider Message ID</th>
                <th className="py-3 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-navy/50">
                    No communication dispatch logs on file.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-6">
                      <div className="font-bold text-navy">{h.customer?.name || 'Patron'}</div>
                      <div className="text-[10px] font-mono text-navy/50">{h.customer?.email}</div>
                    </td>
                    <td className="py-3 px-6 font-medium text-navy max-w-xs truncate">
                      {h.subject}
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{h.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-6 font-mono text-[11px] text-navy/60">
                      {h.providerMessageId || '—'}
                    </td>
                    <td className="py-3 px-6 text-right text-navy/50 font-mono">
                      {formatDateTime(h.sentAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Task Filters */}
          <div className="flex items-center gap-2">
            {['ALL', 'PENDING', 'OVERDUE', 'COMPLETED'].map((f) => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  taskFilter === f ? 'bg-navy text-white shadow-sm' : 'bg-white border border-navy/10 text-navy hover:bg-navy/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-navy/50 card-3d p-6 rounded-2xl">
                No tasks matching the selected filter.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`card-3d p-4 rounded-2xl flex items-center justify-between gap-4 ${
                    t.isOverdue ? 'border-l-4 border-l-rose-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-navy/30 hover:border-brand'
                      }`}
                    >
                      {t.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold text-navy ${t.status === 'COMPLETED' ? 'line-through text-navy/40' : ''}`}>
                        {t.title}
                      </h4>
                      {t.description && (
                        <p className="text-[11px] text-navy/60 mt-0.5">{t.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-navy/40 font-mono mt-1">
                        <span>Due: {formatDate(t.dueDate)}</span>
                        {t.isOverdue && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">
                            Overdue
                          </span>
                        )}
                        <span>· Patron: {t.customer?.name}</span>
                        <span>· Created by: {t.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={t.status} type="task" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
