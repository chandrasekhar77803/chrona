import React, { useState } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { X, Zap, Target, TrendingUp, Award, ShieldCheck, ArrowRight, Play } from 'lucide-react';

interface StatCardModalsProps {
  activeModal: 'readiness' | 'focus' | 'streak' | 'target' | null;
  onClose: () => void;
}

export const StatCardModals: React.FC<StatCardModalsProps> = ({ activeModal, onClose }) => {
  const { studentProfile, toggleFocusBubble, setActiveSection } = useChrona();
  const [shieldActive, setShieldActive] = useState(true);

  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-panel rounded-3xl border border-indigo-500/40 bg-slate-950 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            {activeModal === 'readiness' && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'focus' && (
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'streak' && (
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'target' && (
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-lg font-black text-white">
                {activeModal === 'readiness' && 'Placement Readiness Analytics'}
                {activeModal === 'focus' && 'Cognitive Focus & Energy Timeline'}
                {activeModal === 'streak' && '30-Day Consistency Grid'}
                {activeModal === 'target' && `${studentProfile.dreamCompany} OA Target Roadmap`}
              </h2>
              <p className="text-xs text-slate-400">
                {activeModal === 'readiness' && 'Real-time skill domain weightages & benchmark comparison'}
                {activeModal === 'focus' && 'AI predicted cognitive windows & distraction protection'}
                {activeModal === 'streak' && 'Daily activity tracking & Streak Freeze Shield protection'}
                {activeModal === 'target' && '12-Day sprint milestone roadmap leading to assessment date'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL 1: PLACEMENT READINESS */}
        {activeModal === 'readiness' && (
          <div className="space-y-6 relative z-10">
            {/* Top Ring & Benchmark Summary */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {/* Circular SVG Progress Ring */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1E293B"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - 0.92)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white font-mono">92%</span>
                  <span className="block text-[9px] font-mono text-emerald-400 font-bold">+1.8% Today</span>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Placement Benchmark Target</span>
                  <span className="font-bold text-emerald-400 font-mono">85% Required</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                  <div className="w-[85%] h-full bg-slate-600" />
                  <div className="w-[92%] h-full bg-emerald-400 absolute top-0 left-0 opacity-80" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your overall readiness score is <strong className="text-emerald-400">7% above</strong> the recommended benchmark for {studentProfile.dreamCompany} SDE-1 roles.
                </p>
              </div>
            </div>

            {/* Skill Domain Breakdown Bar Chart */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Skill Domain Breakdown</h3>

              {[
                { name: 'Coding & Algorithms (DSA)', percent: 94, color: 'bg-emerald-400' },
                { name: 'CS Fundamentals (OS, DBMS, CN)', percent: 88, color: 'bg-indigo-400' },
                { name: 'Mock Technical Interviews', percent: 90, color: 'bg-purple-400' },
                { name: 'Resume & Portfolio Impact', percent: 92, color: 'bg-pink-400' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono font-bold text-white">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                setActiveSection('career-gps');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Explore Full Career GPS Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODAL 2: FOCUS SCORE & 24-HOUR TIMELINE */}
        {activeModal === 'focus' && (
          <div className="space-y-6 relative z-10">
            {/* Top Score Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
                <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">Focus Score</span>
                <div className="text-3xl font-black text-white font-mono mt-1">92 / 100</div>
                <span className="text-[10px] text-emerald-400 font-semibold">+4 pts vs yesterday</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Peak Window</span>
                <div className="text-xl font-black text-indigo-300 font-mono mt-1">09:00 - 11:30 AM</div>
                <span className="text-[10px] text-slate-400 font-semibold">Predicted High Energy</span>
              </div>
            </div>

            {/* 24-Hour Cognitive Focus Timeline Graph */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase">24-Hour Focus Energy Curve</span>
                <span className="text-purple-400">Peak predicted right now</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                {/* Timeline Bars */}
                <div className="h-32 flex items-end justify-between gap-1 pt-4 px-2 border-b border-slate-800">
                  {[
                    { time: '6A', h: 30, peak: false },
                    { time: '8A', h: 65, peak: false },
                    { time: '9A', h: 100, peak: true },
                    { time: '10A', h: 95, peak: true },
                    { time: '11A', h: 88, peak: true },
                    { time: '12P', h: 50, peak: false },
                    { time: '1P', h: 35, peak: false },
                    { time: '2P', h: 60, peak: false },
                    { time: '4P', h: 80, peak: false },
                    { time: '6P', h: 70, peak: false },
                    { time: '8P', h: 45, peak: false },
                    { time: '10P', h: 25, peak: false }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-white pointer-events-none transition-opacity">
                        {bar.h}% Focus
                      </div>
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          bar.peak
                            ? 'bg-gradient-to-t from-purple-600 to-indigo-400 shadow-lg shadow-purple-500/40'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={{ height: `${bar.h}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Focus Bubble Primary Action Button */}
            <button
              onClick={() => {
                onClose();
                toggleFocusBubble(true);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Focus Bubble Now (Distraction Shield)</span>
            </button>
          </div>
        )}

        {/* MODAL 3: STUDY STREAK & 30-DAY CONTRIBUTION GRID */}
        {activeModal === 'streak' && (
          <div className="space-y-6 relative z-10">
            {/* Top Streak Metric & Shield Badge */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Active Consistency Streak</span>
                <div className="text-3xl font-black text-white font-mono">14 Days 🔥</div>
                <p className="text-xs text-amber-200">Top 5% Tier across all Chrona CSE students</p>
              </div>

              {/* Streak Freeze Shield Badge */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Streak Freeze Shield</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                    {shieldActive ? '1 Shield Active ✓' : 'Shield Consumed'}
                  </div>
                </div>
              </div>
            </div>

            {/* 30-Day Contribution Heatmap Grid (GitHub style) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase">Last 30 Days Activity Heatmap</span>
                <span className="text-slate-400">3.8 Avg Hrs/Day</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const isStreak = idx >= 16;
                    const level = isStreak ? (idx % 3 === 0 ? 'bg-emerald-400' : 'bg-emerald-500') : (idx % 4 === 0 ? 'bg-slate-800' : 'bg-indigo-900/60');
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-md ${level} border border-slate-800 hover:border-emerald-300 transition-all cursor-pointer group relative`}
                        title={`Day ${idx + 1}: ${isStreak ? 'Complete (3.5+ hrs)' : 'Rest/Light Study'}`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  <span>Less Active</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" />
                    <span className="w-2.5 h-2.5 rounded bg-indigo-900/60" />
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                  </div>
                  <span>More Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShieldActive(!shieldActive)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/40 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{shieldActive ? 'Streak Freeze Shield Protected' : 'Reactivate Streak Shield'}</span>
            </button>
          </div>
        )}

        {/* MODAL 4: TARGET OA ROADMAP COUNTDOWN */}
        {activeModal === 'target' && (
          <div className="space-y-6 relative z-10">
            {/* Target Header Info */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase">Target Assessment</span>
                <div className="text-2xl font-black text-white">{studentProfile.dreamCompany} SDE-1</div>
                <span className="text-xs text-slate-400">Scheduled Date: August 13, 2026</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-400 font-mono">12 Days</div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Sprint Active</span>
              </div>
            </div>

            {/* 12-Day Interactive Countdown Roadmap Steps */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">12-Day Sprint Roadmap</h3>

              <div className="space-y-2.5">
                {[
                  { days: 'Days 1 - 3', title: 'Advanced Graph & Dynamic Programming', status: 'In Progress', active: true },
                  { days: 'Days 4 - 6', title: 'System Design Caching & Redis Architecture', status: 'Upcoming', active: false },
                  { days: 'Days 7 - 9', title: 'Full-Length OpenAI Mock OA Simulations', status: 'Scheduled', active: false },
                  { days: 'Days 10 - 12', title: 'Final Code Optimization & Mental Peak Prep', status: 'Scheduled', active: false }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      step.active
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        step.active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{step.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">{step.days}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      step.active
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setActiveSection('career-gps');
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <span>View Full OpenAI Candidate Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
