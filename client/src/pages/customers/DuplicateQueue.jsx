import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitMerge, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowLeft, 
  User, 
  Lock, 
  ShoppingBag, 
  CheckCircle2 
} from 'lucide-react';
import { SegmentBadge } from '../../components/shared/SegmentBadge';
import { api } from '../../lib/api';
import { formatMoney, formatDate } from '../../lib/format';

export function DuplicateQueue() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const res = await api.getDuplicates();
      setCandidates(res.duplicates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (candidateId, action) => {
    setProcessingId(candidateId);
    try {
      await api.resolveDuplicate(candidateId, action);
      await loadDuplicates();
    } catch (err) {
      alert(err.message || 'Failed to resolve duplicate candidate');
    } finally {
      setProcessingId(null);
    }
  };

  const openCandidates = candidates.filter(c => c.status === 'OPEN');

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Customer Directory</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">
          Duplicate Customer Review Queue
        </h1>
        <p className="text-xs text-navy/60 mt-0.5">
          Deterministic conflict queue identifying shared normalized emails across guest checkouts and registered accounts.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-navy/40 animate-pulse">
          Loading duplicate queue...
        </div>
      ) : openCandidates.length === 0 ? (
        <div className="card-3d p-12 text-center rounded-3xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy">Zero Conflicts Detected</h3>
          <p className="text-xs text-navy/50 max-w-sm mx-auto mt-1">
            All customer records adhere to clean identity isolation. Ingestion automatically checks new orders for matching normalized emails.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {openCandidates.map((cand) => (
            <div key={cand.id} className="card-3d p-6 rounded-3xl space-y-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Conflict Reason: {cand.reason}</span>
                </div>
                <span className="text-[10px] font-mono text-navy/40">
                  Detected {formatDate(cand.createdAt)}
                </span>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile A */}
                <div className="p-5 rounded-2xl bg-navy-50/50 border border-navy/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy/50">
                      Record A ({cand.customerA?.source === 'woo' ? 'Registered Account' : 'Guest Checkout'})
                    </span>
                    <SegmentBadge segment={cand.customerA?.segment} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                      {cand.customerA?.firstName?.[0] || 'A'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy">
                        {cand.customerA?.firstName} {cand.customerA?.lastName}
                      </h4>
                      <p className="text-xs text-navy/60 font-mono">{cand.customerA?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy/8 text-xs font-mono">
                    <div>
                      <span className="text-navy/40 text-[10px] block">Order Spend</span>
                      <span className="font-bold">{formatMoney(cand.customerA?.lifetimeOrderValue)}</span>
                    </div>
                    <div>
                      <span className="text-navy/40 text-[10px] block">Qualifying Orders</span>
                      <span className="font-bold">{cand.customerA?.qualifyingOrderCount}</span>
                    </div>
                  </div>
                </div>

                {/* Profile B */}
                <div className="p-5 rounded-2xl bg-navy-50/50 border border-navy/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy/50">
                      Record B ({cand.customerB?.source === 'woo' ? 'Registered Account' : 'Guest Checkout'})
                    </span>
                    <SegmentBadge segment={cand.customerB?.segment} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {cand.customerB?.firstName?.[0] || 'B'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy">
                        {cand.customerB?.firstName} {cand.customerB?.lastName}
                      </h4>
                      <p className="text-xs text-navy/60 font-mono">{cand.customerB?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy/8 text-xs font-mono">
                    <div>
                      <span className="text-navy/40 text-[10px] block">Order Spend</span>
                      <span className="font-bold">{formatMoney(cand.customerB?.lifetimeOrderValue)}</span>
                    </div>
                    <div>
                      <span className="text-navy/40 text-[10px] block">Qualifying Orders</span>
                      <span className="font-bold">{cand.customerB?.qualifyingOrderCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-navy/8 flex-wrap gap-3">
                <p className="text-xs text-navy/60 italic">
                  Merging consolidates orders, tasks, and communications into the primary WooCommerce account.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={processingId === cand.id}
                    onClick={() => handleResolve(cand.id, 'DISMISS')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-navy/20 text-navy text-xs font-semibold hover:bg-navy/5 transition-colors"
                  >
                    Keep Separate (Dismiss)
                  </button>
                  <button
                    disabled={processingId === cand.id}
                    onClick={() => handleResolve(cand.id, 'MERGE')}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-pill-glow flex items-center gap-1.5"
                  >
                    <GitMerge className="w-4 h-4" />
                    <span>Merge Accounts</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
