import React, { useState } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import { getWhatShouldIDoNext } from '../../services/mentorService';
import {
  Sparkles,
  Target,
  Clock,
  BookOpen,
  ArrowRight,
  Zap
} from 'lucide-react';
import type { WellbeingCheckin } from '../../types/chrona';

export const ChronaMentorCard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    missions,
    roadmapNodes,
    skillGaps,
    setActiveSection,
    saveWellbeingCheckin
  } = useChrona();

  const [selectedMood, setSelectedMood] = useState<WellbeingCheckin['mood'] | null>(null);
  const [showNextModal, setShowNextModal] = useState(false);

  const context = {
    userId: currentUser?.id || 'guest',
    profile: studentProfile,
    missions,
    roadmapNodes,
    skillGaps,
    latestMood: selectedMood || undefined
  };

  const nextAction = getWhatShouldIDoNext(context);

  const activeNode = roadmapNodes.find(n => n.status === 'in-progress') || roadmapNodes[0];
  const pendingTasks = missions.filter(m => !m.completed);

  const handleMoodSelect = (mood: WellbeingCheckin['mood']) => {
    setSelectedMood(mood);
    saveWellbeingCheckin({
      id: `check-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mood,
      recommendedAdjustment: mood === 'Tired' || mood === 'Stressed' ? 'Prioritized 2 core tasks; postponed low impact items.' : 'Optimal pacing maintained.'
    });
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-purple-950/30 space-y-5 shadow-xl">
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base tracking-tight">CHRONA MENTOR</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Personal AI Guide
              </span>
            </div>
            <p className="text-xs text-slate-300">
              "Good day, {studentProfile.name}! I reviewed your target for <strong className="text-indigo-300">{studentProfile.dreamCompany}</strong>."
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('chrona-mentor')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <span>Talk to Mentor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>🎯 Career GPS</span>
          </div>
          <p className="text-slate-200 font-sans text-xs truncate">
            {activeNode?.title || `${studentProfile.careerGoal} Roadmap`}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>📚 Today's Mission</span>
          </div>
          <p className="text-slate-200 font-sans text-xs">
            <strong className="text-purple-300">{pendingTasks.length}</strong> tasks remaining
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>⏰ Available Budget</span>
          </div>
          <p className="text-slate-200 font-sans text-xs">
            <strong className="text-amber-300">3–4 Hours</strong> predicted
          </p>
        </div>
      </div>

      {/* HIGHEST VALUE RECOMMENDATION BOX */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-indigo-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            💡 MENTOR RECOMMENDATION:
          </span>
          <button
            onClick={() => setShowNextModal(true)}
            className="text-[11px] font-mono text-purple-300 hover:text-white underline cursor-pointer font-bold"
          >
            What should I do next?
          </button>
        </div>
        <p className="text-slate-200 font-medium leading-relaxed">
          {nextAction.recommendation}
        </p>
      </div>

      {/* WELL-BEING CHECK-IN STRIP (STEP 11) */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-800/80">
        <span className="font-mono text-slate-400 font-semibold">
          How are you feeling today?
        </span>

        <div className="flex items-center gap-2">
          {(['Great', 'Okay', 'Stressed', 'Tired', 'Low'] as const).map(mood => {
            const isSel = selectedMood === mood;
            return (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {mood === 'Great' && '🙂 Great'}
                {mood === 'Okay' && '😐 Okay'}
                {mood === 'Stressed' && '😓 Stressed'}
                {mood === 'Tired' && '😴 Tired'}
                {mood === 'Low' && '😔 Low'}
              </button>
            );
          })}
        </div>
      </div>

      {/* WHAT SHOULD I DO NEXT MODAL */}
      {showNextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950/95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>SIGNATURE ACTION RECOMMENDATION</span>
              </div>
              <button
                onClick={() => setShowNextModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">{nextAction.headline}</h3>
              <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-2xl bg-slate-900 border border-slate-800">
                {nextAction.recommendation}
              </p>
              <p className="text-[11px] font-mono text-indigo-300">
                <strong>Why:</strong> {nextAction.rationale}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowNextModal(false);
                  setActiveSection('career-gps');
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer"
              >
                🎯 Open Career GPS
              </button>
              <button
                onClick={() => setShowNextModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
