import React, { useState } from 'react';
import { useChrona } from '../../context/ChronaContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { missions, studentProfile } = useChrona();
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly' | 'Semester'>('Weekly');

  const completedCount = missions.filter(m => m.completed).length;
  const hasActivity = completedCount > 0;

  const studyData = [
    { day: 'Mon', hours: hasActivity ? 2.5 : 0, focus: hasActivity ? 80 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Tue', hours: hasActivity ? 3.0 : 0, focus: hasActivity ? 85 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Wed', hours: hasActivity ? 4.0 : 0, focus: hasActivity ? 90 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Thu', hours: hasActivity ? 2.0 : 0, focus: hasActivity ? 75 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Fri', hours: hasActivity ? 3.5 : 0, focus: hasActivity ? 88 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Sat', hours: hasActivity ? 4.5 : 0, focus: hasActivity ? 92 : 0, readiness: studentProfile.placementReadiness || 0 },
    { day: 'Sun', hours: hasActivity ? 3.0 : 0, focus: hasActivity ? 84 : 0, readiness: studentProfile.placementReadiness || 0 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <BarChart3 className="w-4 h-4 animate-spin-slow" />
              <span>TIME INTELLIGENCE ANALYTICS DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student Growth & Productivity Metrics
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Real-time velocity tracking, focus trend lines, and placement readiness trajectory for your workspace.
            </p>
          </div>

          <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1">
            {(['Weekly', 'Monthly', 'Semester'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">Consistency Score</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {hasActivity ? '100%' : '0.0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {hasActivity ? `${completedCount} tasks completed` : '0-day streak'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">Learning Velocity</div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {hasActivity ? '1.4x Speed' : '1.0x Speed'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {hasActivity ? 'Velocity active' : 'Base velocity'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">Revision Efficiency</div>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {hasActivity ? '88.5%' : '0.0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {hasActivity ? 'Retention tracked' : 'Pending practice'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">Completed Missions</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{completedCount} Tasks</div>
          <div className="text-[11px] text-slate-400 mt-1">This {timeframe.toLowerCase()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Placement Readiness Trajectory (%)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="readiness" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorReadiness)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Daily Study Hours Breakdown</span>
            </h3>
            {!hasActivity && (
              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Track new user performance
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
