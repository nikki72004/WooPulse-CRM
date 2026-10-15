import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export function StatCard({ title, value, delta, positive, icon: Icon, disclaimer }) {
  return (
    <div className="card-3d p-6 rounded-2xl relative overflow-hidden group">
      {/* Subtle top ambient sheen */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-navy/60">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-navy mt-1.5 tabular-nums tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand group-hover:scale-105 transition-transform duration-200">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {delta && (
          <div className="flex items-center gap-1 font-medium">
            {positive === true && (
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {delta}
              </span>
            )}
            {positive === false && (
              <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {delta}
              </span>
            )}
            {positive === null && (
              <span className="text-navy/60 bg-navy/5 px-2 py-0.5 rounded-md">
                {delta}
              </span>
            )}
          </div>
        )}

        {disclaimer && (
          <div className="group/tooltip relative cursor-help text-navy/40 hover:text-navy/70 ml-auto">
            <Info className="w-3.5 h-3.5" />
            <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/tooltip:block w-48 p-2 text-[11px] bg-navy text-white rounded-lg shadow-lg z-20 leading-tight">
              {disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
