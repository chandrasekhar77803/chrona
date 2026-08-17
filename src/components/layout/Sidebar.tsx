import React from 'react';
import { useChrona } from '../../context/ChronaContext';
import { getTranslation } from '../../utils/i18n';
import type { NavSection } from '../../types/chrona';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Mic,
  Video,
  Sparkles,
  Target,
  Calendar as CalendarIcon,
  BarChart3,
  User,
  Settings as SettingsIcon,
  Rocket,
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert,
  Link2,
  Trophy
} from 'lucide-react';

interface NavItem {
  id: NavSection;
  labelKey: string;
  defaultLabel: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, theme, toggleTheme, studentProfile, isFocusBubbleActive, toggleFocusBubble, currentLanguage } = useChrona();

  const navItems: NavItem[] = [
    { id: 'home', labelKey: 'todaysMission', defaultLabel: "Today's Mission", icon: LayoutDashboard, badge: 'AI' },
    { id: 'chrona-mentor', labelKey: 'chronaMentor', defaultLabel: 'Chrona Mentor', icon: Sparkles, badge: 'AI Guide' },
    { id: 'achievements', labelKey: 'achievements', defaultLabel: 'Achievements', icon: Trophy, badge: 'Badges' },
    { id: 'chrona-connect', labelKey: 'chronaConnect', defaultLabel: 'Chrona Connect', icon: Link2, badge: 'Hub' },
    { id: 'career-gps', labelKey: 'careerGps', defaultLabel: 'Career GPS', icon: Compass, badge: 'Google Maps' },
    { id: 'placement-hub', labelKey: 'placementHub', defaultLabel: 'Placement Hub', icon: Target, badge: 'Placement' },
    { id: 'study-companion', labelKey: 'aiStudyCompanion', defaultLabel: 'AI Study Companion', icon: BookOpen },
    { id: 'smart-notes', labelKey: 'smartNotes', defaultLabel: 'Smart Notes', icon: Mic, badge: 'Live Rec' },
    { id: 'mock-interviews', labelKey: 'mockInterviews', defaultLabel: 'Mock Interviews', icon: Video, badge: 'AI Voice' },
    { id: 'focus-bubble', labelKey: 'focusBubble', defaultLabel: 'Focus Bubble', icon: Sparkles, badge: 'Mode' },
    { id: 'goals', labelKey: 'goalsMilestones', defaultLabel: 'Goals & Milestones', icon: Target },
    { id: 'calendar', labelKey: 'aiCalendar', defaultLabel: 'AI Calendar', icon: CalendarIcon },
    { id: 'analytics', labelKey: 'analytics', defaultLabel: 'Analytics', icon: BarChart3 },
    { id: 'profile', labelKey: 'profile', defaultLabel: 'Profile', icon: User },
    { id: 'settings', labelKey: 'settings', defaultLabel: 'Settings', icon: SettingsIcon },
    { id: 'future-modules', labelKey: 'futureModules', defaultLabel: 'Future Modules', icon: Rocket, badge: 'Next-Gen' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-800/60 z-30 flex flex-col justify-between p-4 select-none">
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 group">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 22h14" />
                <path d="M5 2h14" />
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                <circle cx="12" cy="12" r="2" fill="#a855f7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">CHRONA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                OS v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Time Intelligence OS</p>
          </div>
        </div>

        <div className="mb-4 px-2">
          <button
            onClick={() => toggleFocusBubble(!isFocusBubbleActive)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all border ${
              isFocusBubbleActive
                ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500/50 text-purple-200 shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFocusBubbleActive ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{isFocusBubbleActive ? 'Focus Mode Active' : 'Start Focus Session'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{getTranslation(currentLanguage, item.labelKey)}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/60 space-y-3">
        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <div className="text-[11px]">
              <div className="text-slate-400">Readiness Score</div>
              <div className="font-bold text-emerald-400">{studentProfile.placementReadiness}% • High</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">+1.8%</span>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <img
              src={studentProfile.avatar}
              alt={studentProfile.name}
              className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
            />
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-slate-100">{studentProfile.name}</div>
              <div className="text-[10px] text-indigo-400 font-mono">{studentProfile.dreamCompany} Target</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
