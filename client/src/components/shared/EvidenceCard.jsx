import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Mail, 
  CheckSquare, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { SegmentBadge } from './SegmentBadge';

export function EvidenceCard({ recommendation, onActionExecute, isExecuting }) {
  const [expanded, setExpanded] = useState(true);

  const urgencyStyles = {
    CRITICAL: 'border-l-4 border-l-rose-500 bg-rose-50/20',
    HIGH: 'border-l-4 border-l-amber-500 bg-amber-50/20',
    MEDIUM: 'border-l-4 border-l-brand bg-brand/5',
    LOW: 'border-l-4 border-l-slate-400 bg-slate-50',
  };

  const urgencyBadges = {
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const rec = recommendation;
  const cardBorder = urgencyStyles[rec.urgency] || urgencyStyles.MEDIUM;

  return (
    <div className={`card-3d rounded-2xl p-6 ${cardBorder} transition-all duration-200`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${urgencyBadges[rec.urgency]}`}>
            {rec.urgency} PRIORITY
          </span>
          <span className="text-xs font-semibold text-navy/50 uppercase tracking-wider">
            {rec.category}
          </span>
          {rec.customer && (
            <div className="flex items-center gap-2 bg-navy/5 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-bold text-navy">{rec.customer.name}</span>
              <SegmentBadge segment={rec.customer.segment} size="sm" />
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-navy/50 hover:text-navy text-xs flex items-center gap-1 font-medium self-end sm:self-auto"
        >
          <span>{expanded ? 'Collapse Evidence' : 'Expand Evidence'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Headline */}
      <h4 className="text-lg font-bold text-navy mt-3 leading-snug">
        {rec.headline}
      </h4>

      {expanded && (
        <div className="mt-4 space-y-3.5 pt-3 border-t border-navy/10 text-sm">
          {/* Section 1: Facts */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy/70 mb-2">
              <FileText className="w-3.5 h-3.5 text-brand" />
              <span>Observable Facts (Evidence Base)</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {rec.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-navy/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/60 mt-1.5 flex-shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Inferences */}
          <div className="p-3 bg-white/80 rounded-xl border border-navy/8 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>System Inference & Rationale</span>
            </div>
            <p className="text-xs text-navy/80 leading-relaxed">
              {rec.inference}
            </p>
          </div>
        </div>
      )}

      {/* Action Approval Buttons */}
      <div className="mt-5 pt-4 border-t border-navy/8 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-navy/50 italic">
          Requires operator confirmation to dispatch.
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {rec.suggestedActions.map((action, idx) => {
            const isEmail = action.type === 'DRAFT_EMAIL';
            const isTask = action.type === 'CREATE_TASK';
            const isComplete = action.type === 'COMPLETE_TASK';
            const isReschedule = action.type === 'RESCHEDULE_TASK';

            return (
              <button
                key={idx}
                disabled={action.disabled || isExecuting}
                onClick={() => onActionExecute(action, rec)}
                title={action.tooltip || ''}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  action.disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-500'
                    : isEmail
                    ? 'bg-brand text-white hover:bg-brand-hover shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5'
                    : isTask
                    ? 'bg-navy text-white hover:bg-navy-800 hover:-translate-y-0.5'
                    : isComplete
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5'
                    : 'bg-white border border-navy/20 text-navy hover:bg-navy/5'
                }`}
              >
                {isEmail && <Mail className="w-3.5 h-3.5" />}
                {isTask && <CheckSquare className="w-3.5 h-3.5" />}
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isReschedule && <Clock className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
