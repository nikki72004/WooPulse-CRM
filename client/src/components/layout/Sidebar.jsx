import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Mail, 
  BarChart3, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../lib/format';

export function Sidebar({ collapsed, setCollapsed, syncStatus, onTriggerSync, isSyncing }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Communications', path: '/communications', icon: Mail },
    { label: 'Retention & Insights', path: '/insights', icon: BarChart3 },
    { label: 'Action Agent', path: '/agent', icon: Bot, badge: 'Rules Engine' },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-40 bg-navy text-white transition-all duration-300 flex flex-col border-r border-white/10 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-indigo-500 flex items-center justify-center shadow-pill-glow flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight text-white block">WooPulse CRM</span>
              <span className="text-[10px] text-brand-light/60 font-mono tracking-widest uppercase">Woo Commerce</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                isActive 
                  ? 'bg-brand text-white shadow-pill-glow' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Left active indicator pill */}
              {isActive && (
                <span className="absolute -left-3 top-2 bottom-2 w-1.5 bg-white rounded-r-full shadow-sm" />
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
              }`} />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sync Status Pill Card */}
      <div className="p-3 border-t border-white/10">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-white/70 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>{isSyncing ? 'Sync In-Flight' : 'Woo Sync'}</span>
              </span>
              <button
                disabled={isSyncing}
                onClick={onTriggerSync}
                className="text-[10px] text-brand-light hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Trigger immediate sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-[10px] text-white/50 font-mono">
              Last synced: {syncStatus?.lastSync ? timeAgo(syncStatus.lastSync) : 'Never'}
            </div>
          </div>
        ) : (
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Sync with WooCommerce"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        )}

        {/* User Card */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-white/50 truncate font-mono">{user?.email}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-white/50 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
