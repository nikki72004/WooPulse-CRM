import React from 'react';
import { Search, Command, RefreshCw, Store, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ onOpenCommand, onTriggerSync, isSyncing, storeInfo }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-navy/8 flex items-center justify-between px-6 transition-all">
      {/* ⌘K Command Search Trigger */}
      <div className="flex-1 max-w-md">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-navy/5 hover:bg-navy/10 border border-navy/5 text-navy/60 hover:text-navy text-xs font-medium transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-brand group-hover:scale-110 transition-transform" />
            <span>Search patrons, orders, or run action...</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-navy/10 shadow-sm text-navy/70">
            <Command className="w-3 h-3" /> K
          </span>
        </button>
      </div>

      {/* Topbar Right Actions */}
      <div className="flex items-center gap-4">
        {/* Connected Store Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand/5 border border-brand/15 text-xs text-navy font-semibold">
          <Store className="w-3.5 h-3.5 text-brand" />
          <span>{storeInfo?.storeName || 'Demo Boutique (WC v3 REST)'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Store REST API operational" />
        </div>

        {/* Sync Now Button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-800 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-navy/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name ? user.name[0] : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
