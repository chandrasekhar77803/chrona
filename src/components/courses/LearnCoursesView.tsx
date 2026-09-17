import React, { useState, useEffect, useMemo } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { FeatureRatingBadge } from '../common/FeatureRatingBadge';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  PlusCircle,
  Code2,
  Cpu,
  Globe,
  Terminal,
  BookOpen,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Check,
  Bot
} from 'lucide-react';
import { COURSES_DATA, type Course, type CourseCategory, type RoadmapStage } from '../../data/coursesData';

export const LearnCoursesView: React.FC = () => {
  const { setActiveSection, addCustomMission } = useChrona();
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('All Skills');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    return localStorage.getItem('chrona_active_course') || 'dsa-mastery';
  });
  const [completedConcepts, setCompletedConcepts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('chrona_course_concepts_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [syncToast, setSyncToast] = useState<{ message: string; stageTitle: string } | null>(null);

  // Sync active course to localStorage
  useEffect(() => {
    if (activeCourseId) {
      localStorage.setItem('chrona_active_course', activeCourseId);
    }
  }, [activeCourseId]);

  // Save concepts progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chrona_course_concepts_progress', JSON.stringify(completedConcepts));
    } catch (e) {
      console.warn('Failed to save concepts progress:', e);
    }
  }, [completedConcepts]);

  const activeCourse = useMemo(() => {
    return COURSES_DATA.find(c => c.id === activeCourseId) || COURSES_DATA[0];
  }, [activeCourseId]);

  // Filtered courses list
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter(course => {
      const matchesCategory = selectedCategory === 'All Skills' || course.category === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        course.placementTier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle concept completion
  const toggleConcept = (conceptId: string) => {
    setCompletedConcepts(prev => {
      const nextState = !prev[conceptId];
      if (nextState) {
        // Micro celebration
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366F1', '#34D399', '#38BDF8']
        });
      }
      return {
        ...prev,
        [conceptId]: nextState
      };
    });
  };

  // Calculate course progress
  const getCourseProgress = (course: Course) => {
    const allConcepts = course.stages.flatMap(s => s.concepts);
    if (allConcepts.length === 0) return 0;
    const completedCount = allConcepts.filter(c => completedConcepts[c.id]).length;
    return Math.round((completedCount / allConcepts.length) * 100);
  };

  const activeCourseProgress = useMemo(() => {
    return getCourseProgress(activeCourse);
  }, [activeCourse, completedConcepts]);

  // Sync stage tasks to Today's Mission
  const handleSyncStageToMission = (stage: RoadmapStage) => {
    stage.syncTasks.forEach(task => {
      addCustomMission(
        task.title,
        activeCourse.category,
        task.estimatedMinutes,
        task.impact,
        `${task.why} (From Course: ${activeCourse.title} - Stage ${stage.stageNumber})`
      );
    });

    // Big confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366F1', '#34D399', '#F59E0B', '#EC4899']
    });

    setSyncToast({
      message: `✨ ${stage.syncTasks.length} Actionable Tasks Synced to Today's Mission! (+1.2% Readiness Boost)`,
      stageTitle: stage.title
    });

    setTimeout(() => {
      setSyncToast(null);
    }, 5000);
  };

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    // Smooth scroll to roadmap display
    const el = document.getElementById('course-roadmap-display');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetProgress = () => {
    if (window.confirm(`Reset progress for ${activeCourse.title}?`)) {
      setCompletedConcepts(prev => {
        const next = { ...prev };
        activeCourse.stages.flatMap(s => s.concepts).forEach(c => {
          delete next[c.id];
        });
        return next;
      });
    }
  };

  return (
    <div id="tab-courses" className="space-y-8 pb-16 animate-fadeIn">
      {/* ─── TOAST NOTIFICATION ─── */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border border-indigo-500/50 shadow-2xl shadow-indigo-500/30 backdrop-blur-xl flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">{syncToast.message}</p>
              <p className="text-[11px] text-indigo-300 font-mono mt-0.5">{syncToast.stageTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('home')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1 shadow-md shadow-indigo-600/30 flex-shrink-0"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── HERO & HEADER SECTION ─── */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#111827]/90 via-[#0B0F19]/95 to-[#111827]/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Glow decorative orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                Career Engineering Curriculum
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                10 Job-Ready Programs
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50">
                Placement OA & System Design Aligned
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Learn Courses & Career Roadmaps
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
              Industrial-grade engineering curriculums with AI-structured 4-stage roadmaps, hands-on capstones, interactive concept tracking, and 1-click sync to <span className="text-indigo-400 font-semibold">Today's Mission</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-2">
            <FeatureRatingBadge featureId="learn-courses" variant="standard" showRateLabel={true} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection('chrona-mentor')}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Ask AI Mentor</span>
              </button>
              <button
                onClick={() => setActiveSection('home')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Today's Mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/70">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Courses</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">10 Curriculums</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Roadmap Stages</p>
            <p className="text-xl font-bold text-indigo-400 font-mono mt-0.5">4 Stages / Course</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Capstone Blueprints</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">40+ Projects</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target CTC Band</p>
            <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">₹18 - 75+ LPA</p>
          </div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER CONTROLS ─── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {(['All Skills', 'Core Programming', 'Placement & DSA', 'AI & Systems', 'Web & Cloud'] as CourseCategory[]).map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-[#111827]/70 hover:bg-[#111827] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All Skills' && <Layers className="w-3.5 h-3.5" />}
                  {cat === 'Core Programming' && <Terminal className="w-3.5 h-3.5" />}
                  {cat === 'Placement & DSA' && <Code2 className="w-3.5 h-3.5" />}
                  {cat === 'AI & Systems' && <Cpu className="w-3.5 h-3.5" />}
                  {cat === 'Web & Cloud' && <Globe className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                  {cat === 'All Skills' && <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-200 font-mono">10</span>}
                </button>
              );
            })}
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, skills, tech stack..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111827]/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── COURSES CATALOG GRID ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Available Engineering Curriculums ({filteredCourses.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Click any course to inspect roadmap & capstones</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const isSelected = course.id === activeCourseId;
            const progress = getCourseProgress(course);

            return (
              <div
                key={course.id}
                onClick={() => handleSelectCourse(course.id)}
                className={`relative rounded-2xl p-5 bg-[#111827]/80 border transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 ${
                  isSelected
                    ? 'border-indigo-500/80 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/40 bg-gradient-to-b from-[#161f38] to-[#111827]'
                    : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 border border-indigo-400 text-[10px] font-bold text-white uppercase tracking-wider font-mono shadow-md shadow-indigo-600/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Active Roadmap</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Category & Difficulty */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${course.color.badge}`}>
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                      {course.level}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.techStack.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900/80 text-slate-300 border border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="pt-4 mt-4 border-t border-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {course.duration}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {course.ctcTarget}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Mastery Progress</span>
                        <span className="text-indigo-300 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 group-hover:text-white group-hover:bg-slate-800'
                    }`}
                  >
                    <span>{isSelected ? 'Viewing Roadmap Below' : 'Generate Optimal Roadmap'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── DYNAMIC 4-STAGE ROADMAP GENERATOR DISPLAY ─── */}
      <div
        id="course-roadmap-display"
        className="rounded-3xl p-6 md:p-8 bg-[#111827]/90 border border-indigo-500/40 shadow-2xl backdrop-blur-xl space-y-8 scroll-mt-20"
      >
        {/* ACTIVE ROADMAP HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${activeCourse.color.badge}`}>
                {activeCourse.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Placement Target: {activeCourse.placementTier}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CTC Range: {activeCourse.ctcTarget}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeCourse.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeCourse.description}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
            <div className="text-left lg:text-right">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Course Mastery</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-indigo-400 font-mono">{activeCourseProgress}%</span>
                <span className="text-xs text-slate-400 font-mono">Completed</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetProgress}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all text-xs flex items-center gap-1.5"
                title="Reset Concept Progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setActiveSection('chrona-mentor')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Mentor on this Roadmap</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 4 SEQUENTIAL STAGE CARDS ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>4-Stage Sequential Mastery Pathway</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Check off concepts as you master them
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeCourse.stages.map((stage) => {
              const stageConcepts = stage.concepts;
              const completedInStage = stageConcepts.filter(c => completedConcepts[c.id]).length;
              const isStageCompleted = stageConcepts.length > 0 && completedInStage === stageConcepts.length;
              const stageProgress = Math.round((completedInStage / stageConcepts.length) * 100);

              return (
                <div
                  key={stage.stageNumber}
                  className={`rounded-2xl p-6 bg-[#0B0F19]/90 border transition-all duration-300 space-y-6 ${
                    isStageCompleted
                      ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* STAGE HEADER */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isStageCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {isStageCompleted ? <Check className="w-5 h-5" /> : `0${stage.stageNumber}`}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base md:text-lg font-bold text-white">
                            {stage.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {stage.duration}
                          </span>
                          {isStageCompleted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Stage Mastered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Stage Sync Action & Progress */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] font-mono text-slate-400">
                          {completedInStage} / {stageConcepts.length} Mastered
                        </span>
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleSyncStageToMission(stage)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-200" />
                        <span>➕ Sync Stage to Today's Mission</span>
                      </button>
                    </div>
                  </div>

                  {/* CHECKABLE CONCEPTS LIST */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Key Engineering Competencies & Drills</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {stageConcepts.map(concept => {
                        const isDone = !!completedConcepts[concept.id];
                        return (
                          <div
                            key={concept.id}
                            onClick={() => toggleConcept(concept.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                                : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'border border-slate-600 hover:border-indigo-400'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <div className="space-y-0.5">
                              <p className={`text-xs font-semibold leading-tight ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                {concept.name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-normal leading-normal">
                                {concept.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CAPSTONE PROJECT BLUEPRINT CARD */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/80 via-[#131b2e]/80 to-slate-900/80 border border-indigo-500/25 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        Stage Capstone Project: {stage.capstone.name}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stage.capstone.tech.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stage.capstone.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <span className="font-semibold text-slate-300">Deliverables:</span>
                      {stage.capstone.deliverables.map((del, i) => (
                        <span key={i} className="flex items-center gap-1 text-[11px] text-indigo-200">
                          <Check className="w-3 h-3 text-emerald-400" />
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* INTERVIEW OA DRILLS STRIP */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1 font-semibold">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      OA & Interview Drills:
                    </span>
                    {stage.interviewDrills.map((drill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]"
                      >
                        {drill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
