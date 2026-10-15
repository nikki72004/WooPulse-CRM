import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Activity,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { SegmentBadge } from '../components/shared/SegmentBadge';
import { api } from '../lib/api';
import { formatMoney, formatDate, timeAgo } from '../lib/format';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-navy/5 rounded-2xl w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-navy/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-2xl border border-navy/5" />
          <div className="h-80 bg-white rounded-2xl border border-navy/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-900">Failed to load dashboard</h3>
        <p className="text-xs text-rose-700 mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, chartData, needsAttention, recentActivity, segmentDistribution } = data;

  return (
    <div className="space-y-8">
      {/* Header with Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Store Performance & Triage
          </h1>
          <p className="text-xs text-navy/60 mt-1">
            Real-time customer intelligence and rule-based action recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/agent')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 text-white text-xs font-bold hover:shadow-pill-glow transition-all shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Open Action Console</span>
          </button>
        </div>
      </div>

      {/* 4 Hero Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Patrons"
          value={metrics.totalCustomers.value}
          delta={metrics.totalCustomers.delta}
          positive={metrics.totalCustomers.positive}
          icon={Users}
        />
        <StatCard
          title="Active Orders"
          value={metrics.activeOrders.value}
          delta={metrics.activeOrders.delta}
          positive={metrics.activeOrders.positive}
          icon={ShoppingBag}
        />
        <StatCard
          title={metrics.qualifyingOrderValue.label}
          value={formatMoney(metrics.qualifyingOrderValue.value)}
          delta={metrics.qualifyingOrderValue.delta}
          positive={metrics.qualifyingOrderValue.positive}
          disclaimer={metrics.qualifyingOrderValue.disclaimer}
          icon={DollarSign}
        />
        <StatCard
          title="Attention Required"
          value={metrics.attentionRequired.value}
          delta={metrics.attentionRequired.delta}
          positive={metrics.attentionRequired.positive}
          icon={AlertCircle}
        />
      </div>

      {/* Main Grid: Orders Chart + Needs Attention Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Over Time Chart */}
        <div className="lg:col-span-2 card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-navy">Order Value Velocity</h3>
              <p className="text-xs text-navy/50 mt-0.5">Monthly qualifying order volume across active cycles</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-brand/10 text-brand px-2.5 py-1 rounded-lg">
              Qualifying Only
            </span>
          </div>

          {/* Interactive SVG Chart */}
          <div className="h-60 w-full relative flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-navy/10">
            {chartData.map((item, idx) => {
              const maxVal = Math.max(...chartData.map(d => d.orderValue));
              const heightPercent = Math.max(15, Math.round((item.orderValue / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[10px] font-mono py-1 px-2 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    {item.month}: ${item.orderValue} ({item.orderCount} orders)
                  </div>

                  {/* Bar with 3D gradient */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-brand to-indigo-400 group-hover:from-brand-hover group-hover:to-indigo-300 transition-all duration-300 shadow-sm"
                  />
                  
                  <span className="text-[11px] font-semibold text-navy/60 mt-2 font-mono">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Segment Distribution Pill bar */}
          <div className="mt-5 pt-4 border-t border-navy/8 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-semibold text-navy/70">Patron Segments:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(segmentDistribution).filter(([k]) => k !== 'Total').map(([seg, count]) => (
                <div key={seg} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-navy/5">
                  <SegmentBadge segment={seg} size="sm" />
                  <span className="font-mono font-bold text-navy text-[11px]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Attention Panel */}
        <div className="card-3d p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-navy">Needs Attention</h3>
            </div>
            <span className="text-xs font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
              {needsAttention.length} Items
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px]">
            {needsAttention.length === 0 ? (
              <div className="py-12 text-center text-xs text-navy/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                All customer SLA obligations and segment alerts are clear.
              </div>
            ) : (
              needsAttention.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-xl bg-navy-50/50 hover:bg-navy-50 border border-navy/8 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-navy">{item.title}</p>
                    <p className="text-[11px] text-navy/60">{item.subtitle}</p>
                  </div>

                  <button
                    onClick={() => navigate(item.link)}
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-navy hover:bg-navy-800 text-white text-[11px] font-semibold transition-transform hover:scale-105"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Feed */}
      <div className="card-3d p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand" />
            <h3 className="text-base font-bold text-navy">Recent Store Activity</h3>
          </div>
          <span className="text-xs text-navy/50 font-mono">Real-time event stream</span>
        </div>

        <div className="divide-y divide-navy/8">
          {recentActivity.map((act) => {
            const isSync = act.type === 'SYNC';
            const isHook = act.type === 'WEBHOOK';
            const isAgent = act.type === 'AGENT';
            const isComm = act.type === 'COMMUNICATION';

            return (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSync ? 'bg-blue-100 text-blue-700' :
                    isHook ? 'bg-purple-100 text-purple-700' :
                    isAgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isSync && <RefreshCw className="w-3.5 h-3.5" />}
                    {isHook && <ShoppingBag className="w-3.5 h-3.5" />}
                    {isAgent && <Sparkles className="w-3.5 h-3.5" />}
                    {isComm && <Mail className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-navy font-medium">{act.message}</span>
                </div>
                <span className="text-[11px] text-navy/40 font-mono flex-shrink-0">
                  {timeAgo(act.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
