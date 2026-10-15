import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SlideOver } from '../../components/shared/SlideOver';
import { api } from '../../lib/api';
import { formatMoney, formatDate, formatDateTime, timeAgo } from '../../lib/format';

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && orders.length > 0) {
      const matched = orders.find(o => o.id === selectedId || o.number === selectedId);
      if (matched) {
        setSelectedOrder(matched);
        setDrawerOpen(true);
      }
    }
  }, [searchParams, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: search.trim() || undefined,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const statuses = ['All', 'completed', 'processing', 'cancelled', 'refunded', 'pending'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">
          Store Transactions & Orders
        </h1>
        <p className="text-xs text-navy/60 mt-0.5">
          Read-only transactional feed synchronized directly from WooCommerce REST API v3.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-3d p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-navy/60 hover:text-navy hover:bg-navy/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-navy/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer email..."
            className="w-full bg-navy/5 border border-navy/10 rounded-xl pl-9 pr-3 py-2 text-xs text-navy placeholder:text-navy/40 focus:outline-none focus:border-brand"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="card-3d rounded-2xl overflow-hidden border border-navy/8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-50/60 border-b border-navy/8 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Billing Customer</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Classification</th>
                <th className="py-3.5 px-6">Date Ingested</th>
                <th className="py-3.5 px-6 text-right">Order Value</th>
                <th className="py-3.5 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-navy/40 animate-pulse">
                    Loading order records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-navy/50">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openDrawer(order)}
                    className="hover:bg-brand/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-6 font-bold text-navy font-mono">
                      #{order.number}
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-navy">
                        {order.billing?.firstName} {order.billing?.lastName || 'Guest Buyer'}
                      </div>
                      <div className="text-[11px] text-navy/50 font-mono">
                        {order.billingEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.isQualifying ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.isQualifying ? 'Qualifying Purchase' : 'Excluded from Totals'}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-navy/70">
                      <div>{formatDate(order.dateCreated)}</div>
                      <div className="text-[10px] text-navy/40 font-mono">{timeAgo(order.dateCreated)}</div>
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono font-bold text-navy text-sm">
                      {formatMoney(order.total)}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(order);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy font-semibold text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedOrder ? `Order #${selectedOrder.number} Inspector` : 'Order Inspector'}
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Qualifying Status Banner */}
            <div className={`p-4 rounded-2xl border ${
              selectedOrder.isQualifying ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy">Order Status & Classification</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <p className="text-[11px] text-navy/60 mt-1 leading-relaxed">
                {selectedOrder.isQualifying
                  ? 'This order meets strict qualification criteria (processing or completed) and is incorporated into the customer’s Lifetime Order Value and segment calculation.'
                  : 'This order status is excluded from customer frequency and lifetime value calculation.'}
              </p>
            </div>

            {/* Customer Link */}
            {selectedOrder.customerId && (
              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/8 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy/50 block">Linked Patron</span>
                  <span className="font-bold text-navy text-sm">{selectedOrder.billing?.firstName} {selectedOrder.billing?.lastName}</span>
                  <span className="block text-[11px] text-navy/50 font-mono">{selectedOrder.billingEmail}</span>
                </div>
                <button
                  onClick={() => navigate(`/customers/${selectedOrder.customerId}`)}
                  className="px-3 py-1.5 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 transition-colors flex items-center gap-1"
                >
                  <span>View Patron</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <h4 className="font-bold text-navy uppercase text-[11px] tracking-wider mb-3">
                Itemized Products ({selectedOrder.lineItems?.length || 0})
              </h4>
              <div className="rounded-xl border border-navy/8 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-navy-50/60 border-b border-navy/8 text-[10px] uppercase font-bold text-navy/50">
                    <tr>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5 font-mono">
                    {selectedOrder.lineItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-sans font-medium text-navy">{item.name}</td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{formatMoney(item.price)}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{formatMoney(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-navy-50/80 font-bold border-t border-navy/10">
                    <tr>
                      <td colSpan="3" className="py-2.5 px-3 text-right font-sans">Gross Order Value:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm text-navy">{formatMoney(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Billing Details */}
            <div className="p-4 rounded-xl border border-navy/8 bg-navy-50/30 space-y-2">
              <h4 className="font-bold text-navy uppercase text-[11px] tracking-wider">Delivery & Billing</h4>
              <div className="text-[11px] font-mono text-navy/70 leading-relaxed">
                <p>{selectedOrder.billing?.address_1 || 'Address on file'}</p>
                <p>{selectedOrder.billing?.city}, {selectedOrder.billing?.state} {selectedOrder.billing?.postcode}</p>
              </div>
            </div>

            {/* Raw Sync Metadata */}
            <div className="p-4 rounded-xl border border-navy/8 bg-white space-y-1 font-mono text-[10px] text-navy/50">
              <div className="flex justify-between">
                <span>WooCommerce Order ID:</span>
                <span className="font-bold text-navy">#{selectedOrder.wooOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Created at Store:</span>
                <span>{formatDateTime(selectedOrder.dateCreated)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified at Store:</span>
                <span>{formatDateTime(selectedOrder.dateModified)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Raw Ingestion:</span>
                <span>{formatDateTime(selectedOrder.rawSyncedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
