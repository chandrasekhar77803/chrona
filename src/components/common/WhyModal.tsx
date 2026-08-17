import React from 'react';
import { useChrona } from '../../context/ChronaContext';
import { Sparkles, X, Target, Clock, AlertTriangle, Zap, Brain, ArrowRight } from 'lucide-react';

export const WhyModal: React.FC = () => {
  const { activeWhyRationale, closeWhyRationale } = useChrona();

  if (!activeWhyRationale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-indigo-500/40 p-6 shadow-2xl relative overflow-hidden bg-slate-950/90">
        {/* Glowing Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Why Chrona Recommended This Action
              </h3>
              <p className="text-xs text-slate-400">AI Personalization & Decision Engine Matrix</p>
            </div>
          </div>
          <button
            onClick={closeWhyRationale}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown Rationale Text */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-sm text-indigo-100 leading-relaxed flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">AI Recommendation Synthesis: </span>
            {activeWhyRationale.why}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>Career Goal Alignment</span>
            </div>
            <div className="text-sm font-bold text-slate-200">{activeWhyRationale.goal}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Deadline</span>
            </div>
            <div className="text-sm font-bold text-amber-300">{activeWhyRationale.deadline}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Skill Gap Weight</span>
            </div>
            <div className="text-sm font-bold text-rose-300">{activeWhyRationale.skillGap}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Energy & Focus Forecast</span>
            </div>
            <div className="text-sm font-bold text-emerald-300">{activeWhyRationale.energyLevel}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={closeWhyRationale}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <span>Proceed with Recommended Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
