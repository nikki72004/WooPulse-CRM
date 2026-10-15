import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Lock, 
  UserPlus, 
  Copy, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SegmentBadge } from '../../components/shared/SegmentBadge';
import { api } from '../../lib/api';
import { formatMoney, formatDate, timeAgo } from '../../lib/format';

export function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [sortBy, setSortBy] = useState('spend');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
    loadDuplicates();
  }, [selectedSegment, sortBy]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({
        segment: selectedSegment !== 'All' ? selectedSegment : undefined,
        sortBy,
        search: search.trim() || undefined,
      });
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    try {
      const res = await api.getDuplicates();
      const open = (res.duplicates || []).filter(d => d.status === 'OPEN').length;
      setDuplicatesCount(open);
    } catch (err) {
      // Ignore
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const segments = ['All', 'Loyal', 'Active', 'New', 'At Risk', 'Inactive'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-navy/60 mt-0.5">
            Dual-source profile management with automated behavioral segmentation.
          </p>
        </div>

        {duplicatesCount > 0 && (
          <button
            onClick={() => navigate('/customers/duplicates')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Review Duplicates Queue ({duplicatesCount} Pending)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-3d p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSegment === seg
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-navy/60 hover:text-navy hover:bg-navy/5'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-navy/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full bg-navy/5 border border-navy/10 rounded-xl pl-9 pr-3 py-2 text-xs text-navy placeholder:text-navy/40 focus:outline-none focus:border-brand"
            />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-navy/5 border border-navy/10 rounded-xl px-3 py-2 text-xs font-medium text-navy focus:outline-none"
          >
            <option value="spend">Sort: Highest Order Value</option>
            <option value="orders">Sort: Order Frequency</option>
            <option value="recent">Sort: Recent Purchase</option>
            <option value="oldest">Sort: Account Age</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-3d rounded-2xl overflow-hidden border border-navy/8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-50/60 border-b border-navy/8 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                <th className="py-3.5 px-6">Patron Profile</th>
                <th className="py-3.5 px-6">Segment</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6 text-center">Qualifying Orders</th>
                <th className="py-3.5 px-6 text-right">Lifetime Order Value</th>
                <th className="py-3.5 px-6">Last Purchase</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-navy/40 animate-pulse">
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-navy/50">
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="hover:bg-brand/5 transition-colors cursor-pointer group"
                  >
                    {/* Patron Name and Email */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand/20 to-indigo-100 text-brand font-bold flex items-center justify-center text-xs">
                          {c.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-navy group-hover:text-brand transition-colors">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-[11px] text-navy/50 font-mono">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Segment Badge */}
                    <td className="py-3.5 px-6">
                      <SegmentBadge segment={c.segment} size="sm" />
                    </td>

                    {/* Source Lock Indicator */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-navy/70 bg-navy/5 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-navy/40" />
                        <span>{c.source === 'woo' ? 'WooCommerce' : 'Guest Checkout'}</span>
                      </span>
                    </td>

                    {/* Qualifying Orders Count */}
                    <td className="py-3.5 px-6 text-center font-mono font-bold text-navy">
                      {c.qualifyingOrderCount}
                    </td>

                    {/* Lifetime Order Value */}
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-navy text-sm">
                      {formatMoney(c.lifetimeOrderValue)}
                    </td>

                    {/* Last Purchase */}
                    <td className="py-3.5 px-6 text-navy/70">
                      <div>{formatDate(c.lastOrderDate)}</div>
                      <div className="text-[10px] text-navy/40">{timeAgo(c.lastOrderDate)}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-brand group-hover:translate-x-1 transition-transform">
                        <span>Profile</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
