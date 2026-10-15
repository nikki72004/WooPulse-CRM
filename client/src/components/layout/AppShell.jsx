import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandSearch } from './CommandSearch';
import { api } from '../../lib/api';

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchStatus = async () => {
    try {
      const [sStatus, sSettings] = await Promise.all([
        api.getSyncStatus().catch(() => null),
        api.getSettings().catch(() => null),
      ]);
      if (sStatus) {
        setSyncStatus(sStatus);
        setIsSyncing(sStatus.isSyncing);
      }
      if (sSettings?.woocommerce) {
        setStoreInfo(sSettings.woocommerce);
      }
    } catch (err) {
      // Ignore background status failure
    }
  };

  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await api.runSync('incremental');
      await fetchStatus();
    } catch (err) {
      console.error('Failed to trigger sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-navy antialiased">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Topbar
          onOpenCommand={() => setCommandOpen(true)}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncing}
          storeInfo={storeInfo}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandSearch
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
