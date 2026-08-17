import React, { useState, useEffect, useRef } from 'react';
import { useChrona } from '../../context/ChronaContext';
import {
  Search,
  Compass,
  Mic,
  Zap,
  BookOpen,
  Calendar,
  Clock,
  Link2,
  FileText,
  Target,
  Settings,
  Award,
  ArrowRight,
  X,
  Command
} from 'lucide-react';
import type { NavSection } from '../../types/chrona';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  targetSection: NavSection;
  isPlanMyDay?: boolean;
  icon: React.ReactNode;
}

export const GlobalSearchBar: React.FC = () => {
  const { setActiveSection } = useChrona();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchItems: SearchItem[] = [
    {
      id: 'placement-hub',
      title: '🎯 Placement Hub',
      category: 'Placement Engine',
      description: 'Placement Readiness Score, Placement GPS, Company Match, Projects & Applications',
      keywords: ['placement', 'placement hub', 'placement readiness', 'company match', 'resume', 'projects', 'application tracker'],
      targetSection: 'placement-hub',
      icon: <Target className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'career-gps',
      title: 'Career GPS',
      category: 'AI Career Architect',
      description: 'Role-specific roadmap, daily progression & skill gap analysis',
      keywords: ['career', 'career gps', 'roadmap', 'placement', 'skills', 'gps', 'goal', 'ai engineer', 'full stack', 'data scientist'],
      targetSection: 'career-gps',
      icon: <Compass className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'mock-interviews',
      title: 'AI Mock Interview',
      category: 'Interview Coach',
      description: 'Practice role-specific interviews, STAR behavioral & live coding',
      keywords: ['mock', 'interview', 'ai mock interview', 'voice interview', 'coding interview', 'behavioral', 'star'],
      targetSection: 'mock-interviews',
      icon: <Mic className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'focus-bubble',
      title: 'Focus Bubble',
      category: 'Deep Work Timer',
      description: 'Distraction-free ambient focus timer & cognitive environment',
      keywords: ['focus', 'focus bubble', 'timer', 'pomodoro', 'deep work', 'distraction free', 'study timer'],
      targetSection: 'focus-bubble',
      icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'smart-notes',
      title: 'Smart Notes',
      category: 'Academic AI',
      description: 'AI lecture recorder, auto transcription & flashcard generator',
      keywords: ['notes', 'smart notes', 'lecture', 'transcript', 'summary', 'flashcards', 'audio notes'],
      targetSection: 'smart-notes',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'calendar',
      title: 'AI Calendar',
      category: 'Schedule',
      description: 'Master academic timetable, exam dates & contest deadlines',
      keywords: ['calendar', 'ai calendar', 'schedule', 'deadlines', 'events', 'timetable'],
      targetSection: 'calendar',
      icon: <Calendar className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'plan-my-day',
      title: 'Plan My Day',
      category: 'Daily Planner',
      description: 'Intelligent AI daily timetable generator & task budgeter',
      keywords: ['plan', 'plan my day', 'timetable', 'day planner', 'schedule day', 'tasks'],
      targetSection: 'home',
      isPlanMyDay: true,
      icon: <Clock className="w-5 h-5 text-pink-400" />
    },
    {
      id: 'chrona-connect',
      title: 'Chrona Connect & LeetCode',
      category: 'Integrations',
      description: 'Connect LeetCode, GitHub, LinkedIn & notice board notifications',
      keywords: ['connect', 'chrona connect', 'leetcode', 'github', 'linkedin', 'integrations', 'opportunity'],
      targetSection: 'chrona-connect',
      icon: <Link2 className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'study-companion',
      title: 'AI Study Companion',
      category: 'Academic Assistant',
      description: 'RAG-powered document analyzer, PDF Q&A & syllabus tutor',
      keywords: ['study', 'companion', 'document', 'pdf', 'rag', 'chat doc', 'notes'],
      targetSection: 'study-companion',
      icon: <FileText className="w-5 h-5 text-teal-400" />
    },
    {
      id: 'goals',
      title: 'Goal DNA Deconstructor',
      category: 'Milestone Planner',
      description: 'Deconstruct long-term career aspirations into actionable daily milestones',
      keywords: ['goals', 'goal', 'dna', 'milestones', 'target'],
      targetSection: 'goals',
      icon: <Target className="w-5 h-5 text-rose-400" />
    },
    {
      id: 'achievements',
      title: 'Achievements & Readiness Score',
      category: 'Gamification',
      description: 'View earned badges, active streaks & Placement Readiness metrics',
      keywords: ['achievements', 'badges', 'streak', 'score', 'placement readiness', 'readiness'],
      targetSection: 'achievements',
      icon: <Award className="w-5 h-5 text-yellow-400" />
    },
    {
      id: 'settings',
      title: 'Settings & LeetCode Linking',
      category: 'Preferences',
      description: 'Configure profile, Gemini API keys & LeetCode account link',
      keywords: ['settings', 'preferences', 'account', 'theme', 'leetcode sync'],
      targetSection: 'settings',
      icon: <Settings className="w-5 h-5 text-slate-400" />
    }
  ];

  // Filter items based on query
  const filteredResults = query.trim() === '' ? [] : searchItems.filter(item => {
    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  // Handle Ctrl+K / Cmd+K shortcut & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: SearchItem) => {
    setActiveSection(item.targetSection);
    setQuery('');
    setIsOpen(false);

    if (item.isPlanMyDay) {
      setTimeout(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const planBtn = buttons.find(b => b.textContent?.includes('Plan My Day'));
        if (planBtn) planBtn.click();
      }, 100);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filteredResults.length || 1)) % (filteredResults.length || 1));
    } else if (e.key === 'Enter' && filteredResults.length > 0) {
      e.preventDefault();
      const target = filteredResults[selectedIndex] || filteredResults[0];
      if (target) handleSelectResult(target);
    }
  };

  const isMac = typeof window !== 'undefined' && /Mac/i.test(navigator.userAgent);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto my-3 z-40">
      {/* VISIBLE HORIZONTAL SEARCH BAR (RENDERED DIRECTLY ON DASHBOARD) */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-purple-400 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="🔍 Search Chrona features, tools and actions (e.g. career, mock, focus, notes, plan)..."
          className="w-full pl-12 pr-24 py-3.5 rounded-2xl glass-panel bg-slate-950/90 border border-indigo-500/30 text-white placeholder:text-slate-400 font-sans text-sm md:text-base focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 shadow-xl shadow-indigo-950/20 transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2 pointer-events-none">
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="pointer-events-auto text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
              <Command className="w-3 h-3" />
              <span>{isMac ? 'K' : 'Ctrl+K'}</span>
            </kbd>
          )}
        </div>
      </div>

      {/* DROPDOWN RESULTS (FLOATS DIRECTLY BELOW SEARCH BAR) */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 right-0 top-full mt-2.5 rounded-2xl glass-panel bg-slate-950/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden z-50 animate-fadeIn">
          {filteredResults.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-mono">
              No Chrona features matched "<strong className="text-white">{query}</strong>". Try typing <span className="text-indigo-400">"career"</span>, <span className="text-purple-400">"mock"</span>, <span className="text-amber-400">"focus"</span>, or <span className="text-pink-400">"plan"</span>.
            </div>
          ) : (
            <div className="p-2 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between items-center">
                <span>Matched Chrona Features ({filteredResults.length})</span>
                <span>Press Enter to select</span>
              </div>

              {filteredResults.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    idx === selectedIndex
                      ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500/60 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-indigo-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold shrink-0 pl-2">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
