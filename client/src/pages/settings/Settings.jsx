import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Webhook, 
  Mail, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate, formatDateTime, timeAgo } from '../../lib/format';

export function Settings() {
  const [statusData, setStatusData] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [webhookEvents, setWebhookEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Webhook simulate state
  const [simulating, setSimulating] = useState(false);
  const [simulateResult, setSimulateResult] = useState(null);

  // Sync now state
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [sRes, hRes, wRes] = await Promise.all([
        api.getSettings(),
        api.getSyncHistory(),
        api.getWebhookEvents(),
      ]);
      setStatusData(sRes);
      setSyncHistory(hRes.history || []);
      setWebhookEvents(wRes.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      await api.runSync('full');
      await loadSettings();
    } catch (err) {
      alert(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await api.sendTestEmail(testEmail || undefined);
      setTestResult({ success: true, message: res.message });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSimulateWebhook = async (type) => {
    setSimulating(true);
    setSimulateResult(null);
    try {
      const res = await api.simulateWebhook(type);
      setSimulateResult({ success: true, message: `Simulated webhook event dispatched! Delivery ID: ${res.deliveryId}` });
      // Refresh events
      const wRes = await api.getWebhookEvents();
      setWebhookEvents(wRes.events || []);
    } catch (err) {
      setSimulateResult({ success: false, message: err.message });
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-navy/40 animate-pulse">
        Loading system configuration & connection states...
      </div>
    );
  }

  const { woocommerce, webhooks, email, segmentRules } = statusData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">
          System Integrations & Governance
        </h1>
        <p className="text-xs text-navy/60 mt-0.5">
          WooCommerce REST credentials, webhook receiver status, email dispatchers, and segment configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: WooCommerce Connection & Sync */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-brand" />
                <h3 className="text-sm font-bold text-navy">WooCommerce Store Link</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                woocommerce.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {woocommerce.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Store Name:</span>
                <span className="font-bold text-navy">{woocommerce.storeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Endpoint URL:</span>
                <span className="text-navy truncate max-w-xs">{woocommerce.storeUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Mode:</span>
                <span className="text-brand font-bold uppercase">{woocommerce.mode} Store Mode</span>
              </div>
            </div>

            <p className="text-xs text-navy/60 leading-relaxed font-sans">
              WooPulse CRM automatically syncs orders incrementally using <code>modified_after</code> and handles pagination up to <code>per_page=100</code> with no fake records.
            </p>
          </div>

          <div className="pt-4 border-t border-navy/8 flex items-center justify-between">
            <span className="text-xs text-navy/40 font-mono">
              {syncHistory.length} sync runs logged
            </span>
            <button
              disabled={syncing}
              onClick={handleTriggerSync}
              className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sync In-Flight...' : 'Trigger Full Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Webhooks Ingestion & Simulator */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-navy">Webhook Ingestion & Idempotency</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                HMAC-SHA256
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Webhook Route:</span>
                <span className="font-bold text-navy">{webhooks.endpoint}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Signature Validation:</span>
                <span className="text-emerald-600 font-bold">Enabled & Enforced</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Delivery Idempotency:</span>
                <span className="text-emerald-600 font-bold">Active (WebhookEvent Table)</span>
              </div>
            </div>

            {simulateResult && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>{simulateResult.message}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-navy/8 flex items-center justify-between">
            <span className="text-xs text-navy/40 font-mono">
              {webhookEvents.length} events logged
            </span>
            <button
              disabled={simulating}
              onClick={() => handleSimulateWebhook('order.updated')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>{simulating ? 'Simulating...' : 'Simulate Incoming Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Email Dispatcher (Resend) */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-navy">Email Gateway (Resend)</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                email.isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {email.isLive ? 'Live Dispatch' : 'Simulated Sandbox'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Sender Email:</span>
                <span className="font-bold text-navy">{email.fromAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Reply-To:</span>
                <span className="text-navy">{email.replyToAddress}</span>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="flex gap-2 pt-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Send test email to address..."
                className="flex-1 bg-navy/5 border border-navy/10 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="px-3.5 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTest ? 'Sending...' : 'Test Send'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Card 4: Configurable Segment Rules */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-navy">Segment Rules Engine</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-navy/5 text-navy px-2 py-0.5 rounded">
                server/src/config/segmentRules.js
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Loyal / VIP Threshold:</span>
                <span className="font-bold text-navy">&ge; {segmentRules.THRESHOLDS.LOYAL_MIN_ORDERS} orders OR &ge; ${segmentRules.THRESHOLDS.LOYAL_MIN_SPEND}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Inactive Interval:</span>
                <span className="font-bold text-navy">&gt; {segmentRules.THRESHOLDS.INACTIVE_DAYS} days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">At-Risk Interval:</span>
                <span className="font-bold text-navy">{segmentRules.THRESHOLDS.AT_RISK_MIN_DAYS} to {segmentRules.THRESHOLDS.AT_RISK_MAX_DAYS} days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy/5">
                <span className="text-navy/50 font-sans">Qualifying Statuses:</span>
                <span className="text-emerald-700 font-bold">{segmentRules.QUALIFYING_STATUSES.join(', ')}</span>
              </div>
            </div>

            <p className="text-[11px] text-navy/50 italic">
              Segment thresholds are dynamic and calculated on-the-fly, ensuring consistent state across all views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
