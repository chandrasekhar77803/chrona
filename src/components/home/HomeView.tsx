import React, { useState } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { StatCardModals } from './StatCardModals';
import { PlanMyDayModal } from './PlanMyDayModal';
import { ChronaMentorCard } from './ChronaMentorCard';
import { VoiceInputField } from '../common/VoiceInputField';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Award,
  Plus,
  Trash2,
  RotateCcw,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const [isPlanMyDayOpen, setIsPlanMyDayOpen] = useState(false);
  const {
    missions,
    toggleMission,
    addCustomMission,
    deleteMission,
    regenerateMissions,
    showMissionSuccess,
    setShowMissionSuccess,
    openWhyRationale,
    studentProfile,
    nextMidnightFormatted
  } = useChrona();

  // Active Stat Card Modal State
  const [activeStatModal, setActiveStatModal] = useState<'readiness' | 'focus' | 'streak' | 'target' | null>(null);

  // Custom Mission Creator Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Data Structures & Algorithms');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [customImpact, setCustomImpact] = useState<'High' | 'Medium' | 'Critical'>('High');
  const [customWhy, setCustomWhy] = useState('');

  // Task Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');

  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredMissions = missions.filter(m => {
    if (filterMode === 'active') return !m.completed;
    if (filterMode === 'completed') return m.completed;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    addCustomMission(
      customTitle,
      customCategory,
      Number(customMinutes) || 30,
      customImpact,
      customWhy.trim() || undefined
    );

    setCustomTitle('');
    setCustomWhy('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="tab-home" className="space-y-6 animate-fadeIn">
      {/* STAT CARD MODALS OVERLAY */}
      <StatCardModals
        activeModal={activeStatModal}
        onClose={() => setActiveStatModal(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Today's Focus Operating Command</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
              Live Synchronized
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="gradient-text">{studentProfile.name}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
            Targeting <strong className="text-indigo-300">{studentProfile.dreamCompany}</strong>. Chrona AI has predicted your peak cognitive focus window between <span className="text-purple-300 font-semibold font-mono">09:00 - 11:30 AM</span>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* ✨ CHRONA MENTOR DASHBOARD BLOCK (STEP 3) */}
      <ChronaMentorCard />

      {/* MISSION COMPLETE CELEBRATION MODAL */}
      {showMissionSuccess && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-indigo-950/80 space-y-4 animate-scaleUp text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 text-3xl shadow-lg shadow-emerald-500/20">
            🎉
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Daily Missions Complete!</h2>
            <p className="text-xs text-emerald-300 max-w-md mx-auto">
              You increased your placement readiness by <span className="font-bold text-white">+1.8%</span> today. Excellent consistency!
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={regenerateMissions}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Load Next Mission Set</span>
            </button>
            <button
              onClick={() => setShowMissionSuccess(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* TODAY'S MISSION CARD & CHECKLIST */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-5 bg-slate-950/80 relative">
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-extrabold text-white">Today's Mission Checklist</h2>
            </div>
            <p className="text-xs text-slate-400">
              Personalized & user-defined tasks automatically tuned to your goal.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({missions.length})
              </button>
              <button
                onClick={() => setFilterMode('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({missions.filter(m => !m.completed).length})
              </button>
              <button
                onClick={() => setFilterMode('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Plan My Day Button */}
            <button
              onClick={() => setIsPlanMyDayOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>📅 Plan My Day</span>
            </button>

            {/* 12 AM Midnight Reset Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-purple-300">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Resets 12 AM (in {nextMidnightFormatted})</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Daily Mission Completion</span>
            <span className="font-bold text-indigo-400">{completedCount} of {totalCount} completed ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* MISSION ITEMS LIST */}
        <div className="space-y-3 pt-2">
          {filteredMissions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-4 glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-slate-950/60">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Target className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Complete Career GPS to generate your personalized AI mission.</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your daily planner uses your Career GPS roadmap, energy level, and target deadlines to generate tailored missions.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlanMyDayOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  📅 Plan My Day
                </button>
              </div>
            </div>
          ) : (
            filteredMissions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  item.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'glass-panel border-indigo-500/20 hover:border-indigo-500/40 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleMission(item.id)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 hover:text-indigo-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold truncate ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {item.title}
                      </span>
                      {item.isUserCreated && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Custom
                        </span>
                      )}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        item.impact === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.impact === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {item.impact} Impact
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.estimatedMinutes} mins</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openWhyRationale(item.aiRationale)}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-purple-100 bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-xl border border-purple-500/40 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why?</span>
                  </button>

                  <button
                    onClick={() => deleteMission(item.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DASHBOARD STATISTICS CARDS (FULLY INTERACTIVE WITH RICH MODAL OVERLAYS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: PLACEMENT READINESS */}
        <div
          onClick={() => setActiveStatModal('readiness')}
          className="glass-panel glass-card-hover p-5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 space-y-2 cursor-pointer transition-all group hover:border-emerald-400/60"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 group-hover:text-emerald-300 transition-colors">Placement Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{studentProfile.placementReadiness > 0 ? `${studentProfile.placementReadiness}%` : '0%'}</div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span>{studentProfile.placementReadiness > 0 ? '+1.8% today' : 'No Activity Yet'}</span>
              <span className="text-slate-400">• Target {studentProfile.dreamCompany || 'Google'}</span>
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* CARD 2: FOCUS SCORE */}
        <div
          onClick={() => setActiveStatModal('focus')}
          className="glass-panel glass-card-hover p-5 rounded-2xl border border-purple-500/30 bg-slate-950/80 space-y-2 cursor-pointer transition-all group hover:border-purple-400/60"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 group-hover:text-purple-300 transition-colors">Focus Score</span>
            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{completedCount > 0 ? `${Math.min(100, completedCount * 25)} / 100` : '0 / 100'}</div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-purple-300 font-semibold">
              {completedCount > 0 ? 'Peak Focus Window: 09:00 AM' : 'Start tasks to track focus'}
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* CARD 3: STUDY STREAK */}
        <div
          onClick={() => setActiveStatModal('streak')}
          className="glass-panel glass-card-hover p-5 rounded-2xl border border-amber-500/30 bg-slate-950/80 space-y-2 cursor-pointer transition-all group hover:border-amber-400/60"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 group-hover:text-amber-300 transition-colors">Study Streak</span>
            <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{completedCount > 0 ? `${completedCount} Days 🔥` : '0 Days'}</div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-amber-300 font-semibold">
              {completedCount > 0 ? 'Consistency Active' : 'Complete first mission'}
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* CARD 4: TARGET OA ROUND */}
        <div
          onClick={() => setActiveStatModal('target')}
          className="glass-panel glass-card-hover p-5 rounded-2xl border border-indigo-500/30 bg-slate-950/80 space-y-2 cursor-pointer transition-all group hover:border-indigo-400/60"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 group-hover:text-indigo-300 transition-colors">Target OA Round</span>
            <Target className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{studentProfile.dreamCompany || 'Google'}</div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-indigo-300 font-semibold">
              {completedCount > 0 ? 'Goal Roadmap Active' : 'Create goal to start countdown'}
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* CUSTOM TASK CREATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add Custom Task</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <VoiceInputField
                  label="Task Title"
                  placeholder="Type or speak (e.g. Solve 5 LeetCode Array Questions)..."
                  value={customTitle}
                  onChange={setCustomTitle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Category</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Data Structures & Algorithms">DSA</option>
                    <option value="System Design">System Design</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Full Stack Project">Project</option>
                    <option value="Resume & Portfolio">Resume</option>
                    <option value="Mock Interview">Mock Interview</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Estimated Mins</label>
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(Number(e.target.value))}
                    min={5}
                    max={300}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-300">Impact Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Medium', 'High', 'Critical'] as const).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setCustomImpact(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        customImpact === lvl
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <VoiceInputField
                  label="Why are you doing this task? (Optional)"
                  isTextArea
                  rows={2}
                  placeholder="Type or speak (e.g. Needed for Google Online Assessment graph section)..."
                  value={customWhy}
                  onChange={setCustomWhy}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 transition-all mt-2 cursor-pointer"
              >
                Add Task to Today's Checklist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Plan My Day Modal */}
      <PlanMyDayModal isOpen={isPlanMyDayOpen} onClose={() => setIsPlanMyDayOpen(false)} />
    </div>
  );
};
