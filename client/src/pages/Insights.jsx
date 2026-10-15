import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Crown, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Bot, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SegmentBadge } from '../components/shared/SegmentBadge';
import { api } from '../lib/api';
import { formatMoney, formatDate, timeAgo } from '../lib/format';

export function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getInsights();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-navy/40 animate-pulse">
        Calculating segment health and cohort retention trends...
      </div>
    );
  }

  const { segments, loyalMetrics, atRiskMetrics, inactiveMetrics, retentionCohorts, rules } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">
            Retention & Behavioral Insights
          </h1>
          <p className="text-xs text-navy/60 mt-0.5">
            Cohort retention trends, segment movements, and automated churn prevention.
          </p>
        </div>

        <button
          onClick={() => navigate('/agent')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 text-white text-xs font-bold hover:shadow-pill-glow transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Launch Action Agent</span>
        </button>
      </div>

      {/* Hero Cohort & VIP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-3d p-6 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              VIP / Loyal Core
            </span>
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-navy mt-2 font-mono">
            {loyalMetrics.count} Patrons
          </h3>
          <p className="text-xs text-navy/60 mt-1">
            Total Qualifying Value: <span className="font-bold text-navy">{formatMoney(loyalMetrics.totalSpend)}</span>
          </p>
          <div className="mt-4 pt-3 border-t border-navy/8 text-[11px] text-navy/50">
            Average Spend: <span className="font-mono font-bold text-navy">{formatMoney(loyalMetrics.avgSpend)}</span> per VIP
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">
              At-Risk Window (45–90d)
            </span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-navy mt-2 font-mono">
            {atRiskMetrics.count} Patrons
          </h3>
          <p className="text-xs text-navy/60 mt-1">
            Accounts entering lapsing interval. Early outreach prevents full dormancy.
          </p>
          <div className="mt-4 pt-3 border-t border-navy/8 text-[11px] text-orange-600 font-semibold">
            Action: Light touchpoint or review request recommended.
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Dormant / Inactive (&gt;90d)
            </span>
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-navy mt-2 font-mono">
            {inactiveMetrics.count} Patrons
          </h3>
          <p className="text-xs text-navy/60 mt-1">
            Historical Spend at Risk: <span className="font-bold text-navy">{formatMoney(inactiveMetrics.historicSpendAtRisk)}</span>
          </p>
          <div className="mt-4 pt-3 border-t border-navy/8 text-[11px] text-rose-600 font-semibold">
            Action: Win-Back courtesy voucher campaign recommended.
          </div>
        </div>
      </div>

      {/* Cohort Retention Performance Table */}
      <div className="card-3d p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy">Quarterly Patron Retention Rates</h3>
            <p className="text-xs text-navy/50">Tracking repeat purchase behavior and cohort retention over time</p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
            +14% Retained YoY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {retentionCohorts.map((c) => (
            <div key={c.cohort} className="p-4 rounded-xl bg-navy-50/50 border border-navy/8 space-y-2">
              <span className="text-xs font-bold text-navy">{c.cohort}</span>
              <div className="text-2xl font-extrabold text-navy font-mono">
                {c.retainedPercent}%
              </div>
              <div className="w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                <div 
                  style={{ width: `${c.retainedPercent}%` }}
                  className="bg-brand h-full rounded-full"
                />
              </div>
              <div className="text-[10px] text-navy/50 font-mono flex justify-between pt-1">
                <span>{c.activeBuyers} Active</span>
                <span>{c.churned} Churned</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inactive Customer Triage Section */}
      <div className="card-3d p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy">Inactive Patrons (&gt;90 Days Inactivity)</h3>
            <p className="text-xs text-navy/50">One-click re-engagement handoff into Action Console</p>
          </div>
          <span className="text-xs font-bold bg-navy/5 text-navy px-2.5 py-1 rounded-lg">
            {inactiveMetrics.customers.length} Patrons
          </span>
        </div>

        <div className="divide-y divide-navy/8">
          {inactiveMetrics.customers.map((c) => (
            <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {c.firstName?.[0] || 'C'}
                </div>
                <div>
                  <div className="font-bold text-navy">{c.firstName} {c.lastName}</div>
                  <div className="text-[11px] text-navy/50 font-mono">{c.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-navy/40 block">Last Purchase</span>
                  <span className="text-navy">{formatDate(c.lastOrderDate)} ({c.daysSinceLastOrder || '>90'}d ago)</span>
                </div>
                <div>
                  <span className="text-[10px] text-navy/40 block">Historical Spend</span>
                  <span className="font-bold text-navy">{formatMoney(c.lifetimeOrderValue)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/agent?customerId=${c.id}`)}
                className="px-3.5 py-2 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand-hover shadow-pill-glow transition-all flex items-center gap-1.5 self-end sm:self-auto"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Act in Agent</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
