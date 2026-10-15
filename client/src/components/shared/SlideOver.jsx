import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function SlideOver({ isOpen, onClose, title, children, width = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className={`w-screen ${width} bg-white shadow-2xl border-l border-navy/10 flex flex-col transform transition-transform duration-300 ease-in-out`}>
          {/* Header */}
          <div className="p-6 border-b border-navy/10 flex items-center justify-between bg-navy-50/50">
            <h3 className="text-lg font-bold text-navy">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-navy/50 hover:text-navy hover:bg-navy/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
