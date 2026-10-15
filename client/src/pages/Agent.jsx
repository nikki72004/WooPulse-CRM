import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  User, 
  ArrowRight, 
  Layers, 
  Terminal, 
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { EvidenceCard } from '../components/shared/EvidenceCard';
import { SegmentBadge } from '../components/shared/SegmentBadge';
import { api } from '../lib/api';

export function Agent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdParam);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadRecommendations(selectedCustomerId);
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers();
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecommendations = async (cId) => {
    setLoading(true);
    try {
      const res = await api.getAgentRecommendations(cId || null);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionExecute = async (action, recommendation) => {
    if (action.type === 'DRAFT_EMAIL') {
      // Navigate to compose with pre-selected customer and template
      navigate(`/communications?tab=compose&customerId=${recommendation.customer?.id}&templateId=${action.templateId}`);
      return;
    }

    setExecuting(true);
    try {
      const res = await api.executeAgentAction(action.type, {
        customerId: recommendation.customer?.id,
        taskId: action.taskId,
        taskTitle: action.taskTitle,
        taskDescription: action.taskDescription,
      });

      const logMsg = `[APPROVED] Executed ${action.type}: "${action.label}" for ${recommendation.customer?.name}`;
      setExecutionLogs(prev => [
        { id: Date.now(), message: logMsg, timestamp: new Date().toLocaleTimeString(), success: true },
        ...prev
      ]);

      // Refresh recommendations to reflect updated states
      await loadRecommendations(selectedCustomerId);
    } catch (err) {
      setExecutionLogs(prev => [
        { id: Date.now(), message: `[ERROR] ${err.message}`, timestamp: new Date().toLocaleTimeString(), success: false },
        ...prev
      ]);
    } finally {
      setExecuting(false);
    }
  };

  const filteredRecs = recommendations.filter(r => {
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 text-white flex items-center justify-center shadow-pill-glow">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">
              CRM Action Console
            </h1>
          </div>
          <p className="text-xs text-navy/60 mt-1">
            Deterministic rule-evaluation agent with transparent evidence decomposition and user approval gates.
          </p>
        </div>

        <button
          onClick={() => loadRecommendations(selectedCustomerId)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-navy/10 text-xs font-semibold text-navy hover:bg-navy/5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Evaluate Rules</span>
        </button>
      </div>

      {/* Main Grid: Left Selector, Right Action Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Triage & Patron Focus */}
        <div className="space-y-5">
          <div className="card-3d p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Evaluation Scope
            </h3>

            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1.5">
                Focus on Specific Patron:
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSearchParams(e.target.value ? { customerId: e.target.value } : {});
                }}
                className="w-full bg-navy/5 border border-navy/10 rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none focus:border-brand"
              >
                <option value="">Evaluate Entire Patron Base ({customers.length})</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.segment})
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1.5">
                Priority Filter:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setFilterUrgency(u)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      filterUrgency === u 
                        ? 'bg-navy text-white shadow-sm' 
                        : 'bg-navy/5 text-navy/60 hover:text-navy hover:bg-navy/10'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules Overview Pill */}
            <div className="p-3.5 rounded-xl bg-navy-50/50 border border-navy/8 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-navy/50 block">Active Evaluation Rules</span>
              <ul className="space-y-1 text-[11px] text-navy/70 font-medium">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Inactive Patron Win-Back (&gt;90d)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>VIP Relationship Hygiene (&gt;60d gap)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  <span>Operational Task SLA Safeguards</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>First Purchase Care Guide (&lt;14d)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Execution Terminal Feed */}
          <div className="card-3d p-5 rounded-2xl bg-navy text-white space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Agent Audit Stream</span>
              </div>
              <span className="text-[10px] text-white/50">{executionLogs.length} actions</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 text-[11px] pr-1">
              {executionLogs.length === 0 ? (
                <p className="text-white/40 italic py-4 text-center">
                  Awaiting operator action confirmations...
                </p>
              ) : (
                executionLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-white/5 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-white/40 block">{log.timestamp}</span>
                    <span className={log.success ? 'text-emerald-300' : 'text-rose-400'}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations Stack of Evidence Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Recommended Intervention Cards ({filteredRecs.length})
            </h3>
            <span className="text-xs text-navy/50">
              Evaluated strictly on observable store metrics
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-navy/40 animate-pulse">
              Evaluating patron interaction histories against business rules...
            </div>
          ) : filteredRecs.length === 0 ? (
            <div className="card-3d p-12 text-center rounded-3xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-navy">All Evaluation Criteria Clear</h3>
              <p className="text-xs text-navy/50 max-w-md mx-auto">
                No immediate interventions triggered for this selection. All patron commitments and segment touchpoints are current.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecs.map((rec) => (
                <EvidenceCard
                  key={rec.id}
                  recommendation={rec}
                  onActionExecute={handleActionExecute}
                  isExecuting={executing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
