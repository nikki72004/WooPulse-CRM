import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Edit3, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CheckSquare, 
  FileText, 
  Clock, 
  Bot, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { SegmentBadge } from '../../components/shared/SegmentBadge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { api } from '../../lib/api';
import { formatMoney, formatDate, formatDateTime, timeAgo } from '../../lib/format';

export function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Note creation form state
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Task creation form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Consent editing state
  const [savingConsent, setSavingConsent] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerById(id);
      setCustomer(res.customer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async () => {
    if (!customer) return;
    setSavingConsent(true);
    const newConsent = !customer.emailConsent;
    try {
      await api.updateCustomer(customer.id, { emailConsent: newConsent });
      await loadCustomer();
    } catch (err) {
      alert(err.message || 'Failed to update consent status');
    } finally {
      setSavingConsent(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      await api.addNote(customer.id, newNote);
      setNewNote('');
      await loadCustomer();
    } catch (err) {
      alert(err.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.deleteNote(noteId);
      await loadCustomer();
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsSubmittingTask(true);
    try {
      await api.createTask({
        customerId: customer.id,
        title: newTaskTitle,
        dueDate: newTaskDue || undefined,
      });
      setNewTaskTitle('');
      setNewTaskDue('');
      await loadCustomer();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      await loadCustomer();
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-navy/40 animate-pulse">
        Loading patron record...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-navy/10">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-navy">Customer Not Found</h3>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl"
        >
          Return to Customer Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'orders', label: `Orders (${customer.orders?.length || 0})`, icon: ShoppingBag },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'notes', label: `Notes (${customer.notes?.length || 0})`, icon: Edit3 },
    { id: 'tasks', label: `Tasks (${customer.tasks?.length || 0})`, icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Customer Directory</span>
      </button>

      {/* Hero Header Card */}
      <div className="card-3d p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-pill-glow flex-shrink-0">
              {customer.firstName?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-navy tracking-tight">
                  {customer.firstName} {customer.lastName}
                </h1>
                <SegmentBadge segment={customer.segment} />
              </div>
              <div className="flex items-center gap-4 text-xs text-navy/60 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Patron since {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-navy/10 pt-4 md:pt-0 md:pl-6 justify-between md:justify-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
                Lifetime Order Value
              </p>
              <h2 className="text-2xl font-extrabold text-navy font-mono">
                {formatMoney(customer.lifetimeOrderValue)}
              </h2>
              <p className="text-[10px] text-navy/40">
                {customer.qualifyingOrderCount} qualifying orders
              </p>
            </div>

            <button
              onClick={() => navigate(`/agent?customerId=${customer.id}`)}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-pill-glow flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Evaluate in Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-navy/10 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: WooCommerce Read-Only Data */}
          <div className="card-3d p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-navy/50" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                  WooCommerce Ingested Data (Read-Only)
                </h3>
              </div>
              <span className="text-[10px] bg-navy/5 text-navy/60 font-mono px-2 py-0.5 rounded">
                Store ID: #{customer.wooCustomerId || 'Guest'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-navy/50 block mb-0.5">Registration Source</span>
                <span className="font-semibold text-navy capitalize">{customer.source} Account</span>
              </div>
              <div>
                <span className="text-navy/50 block mb-0.5">Last Sync Timestamp</span>
                <span className="font-mono text-navy">{formatDateTime(customer.wooDateModified)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-navy/50 block mb-0.5">Original Billing Address</span>
                <div className="p-3 bg-navy-50/50 rounded-xl font-mono text-[11px] text-navy leading-relaxed border border-navy/5">
                  <p>{customer.billing?.address_1 || 'No street address on file'}</p>
                  <p>{customer.billing?.city}, {customer.billing?.state} {customer.billing?.postcode}</p>
                  <p>{customer.billing?.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: CRM Managed Editable Data */}
          <div className="card-3d p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                  CRM Managed Attributes (Editable)
                </h3>
              </div>
              <span className="text-[10px] bg-brand/10 text-brand font-semibold px-2 py-0.5 rounded">
                CRM Authority
              </span>
            </div>

            {/* Email Consent Card */}
            <div className="p-4 rounded-xl border border-navy/8 bg-navy-50/30 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy">Marketing Email Consent</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    customer.emailConsent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {customer.emailConsent ? 'Opted In' : 'Revoked / Blocked'}
                  </span>
                </div>
                <p className="text-[11px] text-navy/60 mt-1">
                  Enforces CAN-SPAM and GDPR dispatch blocks across communication templates.
                </p>
                {customer.unsubscribedAt && (
                  <p className="text-[10px] text-rose-600 mt-1 font-mono">
                    Unsubscribed on {formatDate(customer.unsubscribedAt)}
                  </p>
                )}
              </div>

              <button
                disabled={savingConsent}
                onClick={handleToggleConsent}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  customer.emailConsent 
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                }`}
              >
                {savingConsent ? 'Updating...' : customer.emailConsent ? 'Revoke Consent' : 'Grant Consent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="card-3d rounded-2xl overflow-hidden border border-navy/8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-50/60 border-b border-navy/8 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                <th className="py-3 px-6">Order</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Qualifying?</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Items</th>
                <th className="py-3 px-6 text-right">Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {customer.orders?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-navy/50">
                    No orders linked to this customer account.
                  </td>
                </tr>
              ) : (
                customer.orders.map((o) => {
                  const isQual = ['completed', 'processing'].includes(o.status.toLowerCase());
                  return (
                    <tr key={o.id} className="hover:bg-navy-50/50">
                      <td className="py-3 px-6 font-bold text-navy font-mono">
                        #{o.number}
                      </td>
                      <td className="py-3 px-6">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isQual ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isQual ? 'Yes' : 'Excluded'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-navy/70">
                        {formatDate(o.dateCreated)}
                      </td>
                      <td className="py-3 px-6 text-navy/70">
                        {o.lineItems?.length || 1} product(s)
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-navy">
                        {formatMoney(o.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="card-3d p-6 rounded-2xl">
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-navy/10">
            {customer.timeline?.map((item) => (
              <div key={item.id} className="flex items-start gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-brand flex items-center justify-center text-brand flex-shrink-0 z-10 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                </div>
                <div className="flex-1 bg-navy-50/40 p-4 rounded-xl border border-navy/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-navy">{item.title}</span>
                    <span className="text-[10px] font-mono text-navy/40">{timeAgo(item.timestamp)}</span>
                  </div>
                  <p className="text-xs text-navy/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Note Form */}
          <form onSubmit={handleAddNote} className="card-3d p-4 rounded-2xl flex gap-3">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add confidential client note (e.g. style preferences, trunk show feedback)..."
              className="flex-1 bg-navy/5 border border-navy/10 rounded-xl px-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={isSubmittingNote || !newNote.trim()}
              className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {customer.notes?.length === 0 ? (
              <div className="py-8 text-center text-xs text-navy/50 card-3d p-6 rounded-2xl">
                No private CRM notes recorded yet.
              </div>
            ) : (
              customer.notes.map((note) => (
                <div key={note.id} className="card-3d p-4 rounded-2xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-navy leading-relaxed">{note.body}</p>
                    <span className="text-[10px] font-mono text-navy/40 block">
                      Added {timeAgo(note.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-navy/30 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="card-3d p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title (e.g. Follow up on sizing)..."
              className="flex-1 bg-navy/5 border border-navy/10 rounded-xl px-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:outline-none focus:border-brand"
            />
            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="bg-navy/5 border border-navy/10 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmittingTask || !newTaskTitle.trim()}
              className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2">
            {customer.tasks?.length === 0 ? (
              <div className="py-8 text-center text-xs text-navy/50 card-3d p-6 rounded-2xl">
                No tasks assigned to this customer.
              </div>
            ) : (
              customer.tasks.map((task) => {
                const isOverdue = task.status === 'PENDING' && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className="card-3d p-4 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-navy/30 hover:border-brand'
                        }`}
                      >
                        {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p className={`text-xs font-semibold text-navy ${task.status === 'COMPLETED' ? 'line-through text-navy/40' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-navy/50 font-mono mt-0.5">
                          <span>Due {formatDate(task.dueDate)}</span>
                          {isOverdue && (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                              Overdue
                            </span>
                          )}
                          <span>· Created by {task.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={task.status} type="task" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
