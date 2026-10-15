import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, ArrowRight, X, Command } from 'lucide-react';
import { api } from '../../lib/api';

export function CommandSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res.results || []);
        setSelectedIndex(0);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    onClose();
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      <div 
        className="fixed inset-0 bg-navy/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-navy/10 overflow-hidden transform transition-all"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-navy/10">
          <Search className="w-5 h-5 text-brand mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, orders, or type a command... (Press ESC to exit)"
            className="w-full bg-transparent border-0 focus:outline-none text-navy text-sm font-medium placeholder:text-navy/40"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-navy/40 hover:text-navy mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-navy/40 bg-navy/5 px-2 py-1 rounded-md">
            <Command className="w-3 h-3" /> K
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-xs text-navy/50 animate-pulse">
              Searching store records...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-navy/50">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isCust = item.type === 'CUSTOMER';
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-brand/10 text-brand' : 'hover:bg-navy/5 text-navy'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCust ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isCust ? <User className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[11px] text-navy/60">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'opacity-100 translate-x-1' : 'opacity-0'} transition-all`} />
                  </button>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="p-4 text-xs text-navy/50 space-y-2">
              <div className="font-semibold text-navy/70 uppercase text-[10px] tracking-wider mb-2">Quick Navigation Shortcuts</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onClose(); navigate('/customers'); }} className="p-2.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-left">
                  <div className="font-semibold text-navy">/customers</div>
                  <div className="text-[10px] text-navy/60">Browse patron directory</div>
                </button>
                <button onClick={() => { onClose(); navigate('/agent'); }} className="p-2.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-left">
                  <div className="font-semibold text-navy">/agent</div>
                  <div className="text-[10px] text-navy/60">CRM Action Console</div>
                </button>
                <button onClick={() => { onClose(); navigate('/orders'); }} className="p-2.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-left">
                  <div className="font-semibold text-navy">/orders</div>
                  <div className="text-[10px] text-navy/60">Inspect transactions</div>
                </button>
                <button onClick={() => { onClose(); navigate('/insights'); }} className="p-2.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-left">
                  <div className="font-semibold text-navy">/insights</div>
                  <div className="text-[10px] text-navy/60">Retention & cohorts</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
