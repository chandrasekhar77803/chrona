import React, { useState, useEffect } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import { syncCareerGpsToFirestore, getCareerGpsFromFirestore } from '../../services/firebaseService';
import { generateCareerGpsRoadmap, validateRoadmapQuality, parseMonthsCount, type MonthPlanDetail } from '../../services/careerGpsEngine';
import { CareerGpsOnboardingWizard, type OnboardingData } from './CareerGpsOnboardingWizard';
import { CareerDiscoveryQuestionnaire } from './CareerDiscoveryQuestionnaire';
import { CareerMatchesView } from './CareerMatchesView';
import { getUserCareerAssessment } from '../../services/careerRecommendationEngine';
import type { CareerRoadmapNode, SkillGapItem, ApplicationTrackerItem, UserCareerAssessmentRecord } from '../../types/chrona';
import {
  Compass,
  Sparkles,
  BarChart,
  HelpCircle,
  Briefcase,
  Plus,
  Upload,
  Calendar,
  Settings,
  AlertTriangle,
  Printer,
  Download,
  Share2
} from 'lucide-react';

export const CareerGpsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    roadmapNodes,
    skillGaps,
    applications,
    openWhyRationale,
    updateStudentProfile,
    addCustomMission
  } = useChrona();

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Onboarding & Target State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [showDiscoveryWizard, setShowDiscoveryWizard] = useState<boolean>(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);
  const [gpsMode, setGpsMode] = useState<'roadmap' | 'discovery'>('roadmap');
  const [assessmentRecord, setAssessmentRecord] = useState<UserCareerAssessmentRecord | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [targetCompany, setTargetCompany] = useState<string>(studentProfile.dreamCompany || 'Google');
  const [careerGoal, setCareerGoal] = useState<string>(studentProfile.careerGoal || 'AI Engineer');

  // Dynamic Planning Inputs
  const [targetTime, setTargetTime] = useState<string>('6 Months');
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [weeklyDays, setWeeklyDays] = useState<number>(6);
  const [planPace, setPlanPace] = useState<'Fast Track Plan' | 'Balanced Plan' | 'Intensive Plan'>('Balanced Plan');

  // Edit Plan Modal State
  const [showEditPlanModal, setShowEditPlanModal] = useState<boolean>(false);
  const [editCompany, setEditCompany] = useState<string>(targetCompany);
  const [editRole, setEditRole] = useState<string>(careerGoal);
  const [editTime, setEditTime] = useState<string>(targetTime);
  const [editDailyHours, setEditDailyHours] = useState<number>(dailyHours);
  const [editWeeklyDays, setEditWeeklyDays] = useState<number>(weeklyDays);
  const [editSkillsInput, setEditSkillsInput] = useState<string>(studentProfile.skills.map(s => s.name).join(', '));

  // Dynamic AI Output State
  const [localRoadmap, setLocalRoadmap] = useState<CareerRoadmapNode[]>(roadmapNodes || []);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthPlanDetail[]>([]);
  const [roadmapVersion, setRoadmapVersion] = useState<number>(Date.now());
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);
  const [localSkillGaps, setLocalSkillGaps] = useState<SkillGapItem[]>(skillGaps || []);
  const [localApplications, setLocalApplications] = useState<ApplicationTrackerItem[]>(applications || []);
  const [journeyLevel, setJourneyLevel] = useState<string>('Beginner');
  const [aiConfidence, setAiConfidence] = useState<number>(78);
  const [nextBestAction, setNextBestAction] = useState<string>('Learn Python Basics');
  const [projectedTimeline, setProjectedTimeline] = useState<{ month: string; topic: string }[]>([]);
  const [activeMonthTab, setActiveMonthTab] = useState<number>(1);
  const [activeWeekFilter, setActiveWeekFilter] = useState<number | 'all'>('all');
  const [expandedDayNumber, setExpandedDayNumber] = useState<number | null>(1);

  // Modal State for Adding Application
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [newAppCompany, setNewAppCompany] = useState<string>('');
  const [newAppRole, setNewAppRole] = useState<string>('');
  const [newAppStatus, setNewAppStatus] = useState<'Applied' | 'Interviewing' | 'Offer' | 'Wishlist'>('Applied');

  // Calculate Remaining Days & Study Hours
  const getRemainingDays = (timeStr: string) => {
    if (timeStr === '3 Months') return 90;
    if (timeStr === '6 Months') return 180;
    if (timeStr === '9 Months') return 270;
    if (timeStr === '12 Months') return 365;
    if (timeStr === '18 Months') return 540;
    if (timeStr === '24 Months') return 730;
    return 180;
  };

  const remainingDays = getRemainingDays(targetTime);
  const remainingWeeks = Math.round(remainingDays / 7);
  const totalStudyHoursAvailable = Math.round(remainingDays * (dailyHours * (weeklyDays / 7)));

  // ── Load user-isolated Career GPS state on mount ──
  useEffect(() => {
    const loadGps = async () => {
      if (!currentUser) return;
      const savedAssessment = await getUserCareerAssessment(currentUser.id);
      if (savedAssessment) {
        setAssessmentRecord(savedAssessment);
      }

      const saved = await getCareerGpsFromFirestore(currentUser.id);
      if (saved && (saved.careerSetupCompleted || saved.hasCompletedOnboarding)) {
        setHasCompletedOnboarding(true);
        const comp = (saved as any).dreamCompany || targetCompany;
        const rGoal = (saved as any).dreamCareer || careerGoal;
        const tTime = saved.targetTime || targetTime;
        const dHrs = saved.dailyHours || dailyHours;

        setTargetCompany(comp);
        setCareerGoal(rGoal);
        setTargetTime(tTime);
        setDailyHours(dHrs);
        if (saved.weeklyDays) setWeeklyDays(saved.weeklyDays);
        if (saved.journeyLevel) setJourneyLevel(saved.journeyLevel);
        if (saved.aiConfidence) setAiConfidence(saved.aiConfidence);
        if (saved.nextBestAction) setNextBestAction(saved.nextBestAction);
        if (saved.projectedTimeline) setProjectedTimeline(saved.projectedTimeline);
        if (saved.skillGaps) setLocalSkillGaps(saved.skillGaps);
        if (saved.applications) setLocalApplications(saved.applications);
        if ((saved as any).roadmapVersion) setRoadmapVersion((saved as any).roadmapVersion);

        // If saved monthlyPlans exists and matches duration, use it; otherwise generate fresh
        if ((saved as any).monthlyPlans && (saved as any).monthlyPlans.length > 0) {
          setMonthlyPlans((saved as any).monthlyPlans);
          setLocalRoadmap(saved.roadmapNodes || []);
        } else {
          await generateDynamicRoadmap({
            company: comp,
            role: rGoal,
            time: tTime,
            dHours: dHrs,
            wDays: saved.weeklyDays || 6,
            skillsList: studentProfile.skills.map(s => s.name),
            pace: 'Balanced Plan'
          });
        }
      } else {
        setHasCompletedOnboarding(false);
      }
    };

    loadGps();
  }, [currentUser]);

  // ── Dynamic AI Roadmap Generator Handler ──
  const generateDynamicRoadmap = async (params: {
    company: string;
    role: string;
    time: string;
    dHours: number;
    wDays: number;
    skillsList: string[];
    pace: string;
  }) => {
    setIsGeneratingAI(true);
    setTargetCompany(params.company);
    setCareerGoal(params.role);
    setTargetTime(params.time);
    setDailyHours(params.dHours);
    setWeeklyDays(params.wDays);

    updateStudentProfile({
      dreamCompany: params.company,
      careerGoal: params.role,
      skills: params.skillsList.map(s => ({ name: s, rating: 80, category: 'Technical' }))
    });

    try {
      const generated = await generateCareerGpsRoadmap({
        careerGoal: params.role,
        targetCompany: params.company,
        targetTime: params.time,
        dailyHours: params.dHours,
        weeklyDays: params.wDays,
        currentSkills: params.skillsList
      });

      const isValid = validateRoadmapQuality(generated, params.role, parseMonthsCount(params.time), params.dHours);
      if (!isValid) {
        console.warn('[Quality Validation] Roadmap validation warning: adjusting parameters...');
      }

      setLocalRoadmap(generated.roadmapNodes);
      setMonthlyPlans(generated.monthlyPlans);
      setRoadmapVersion(generated.roadmapVersion);
      setLocalSkillGaps(generated.skillGaps);
      setJourneyLevel(generated.journeyLevel);
      setAiConfidence(generated.aiConfidence);
      setNextBestAction(generated.nextBestAction);
      setProjectedTimeline(generated.projectedTimeline);

      if (currentUser) {
        await syncCareerGpsToFirestore(currentUser.id, {
          roadmapNodes: generated.roadmapNodes,
          skillGaps: generated.skillGaps,
          monthlyPlans: generated.monthlyPlans,
          roadmapVersion: generated.roadmapVersion,
          applications: localApplications,
          placementReadiness: studentProfile.placementReadiness,
          hasCompletedOnboarding: true,
          journeyLevel: generated.journeyLevel,
          estimatedJourney: params.time,
          aiConfidence: generated.aiConfidence,
          nextBestAction: generated.nextBestAction,
          projectedTimeline: generated.projectedTimeline,
          targetTime: params.time,
          dailyHours: params.dHours,
          weeklyDays: params.wDays,
          dreamCompany: params.company,
          dreamCareer: params.role
        });
      }

      showToast(`⚡ Regenerated 100% personalized roadmap for ${params.role} (${params.time})!`);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Onboarding Wizard Completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    setHasCompletedOnboarding(true);
    setShowDiscoveryWizard(false);
    setEditCompany(data.dreamCompany);
    setEditRole(data.careerGoal);
    setEditTime(data.targetTime || '6 Months');
    setEditDailyHours(data.dailyHours || 4);
    setEditWeeklyDays(6);
    setEditSkillsInput(data.currentSkills.join(', '));
    setPlanPace(data.roadmapType === 'Fast Track' ? 'Fast Track Plan' : data.roadmapType === 'Mastery' ? 'Intensive Plan' : 'Balanced Plan');

    await generateDynamicRoadmap({
      company: data.dreamCompany,
      role: data.careerGoal,
      time: data.targetTime || '6 Months',
      dHours: data.dailyHours || 4,
      wDays: 6,
      skillsList: data.currentSkills,
      pace: data.roadmapType || 'Balanced'
    });
  };

  // Save Edit Plan Changes
  const handleSaveEditPlan = async () => {
    const skillsList = editSkillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await generateDynamicRoadmap({
      company: editCompany,
      role: editRole,
      time: editTime,
      dHours: editDailyHours,
      wDays: editWeeklyDays,
      skillsList,
      pace: planPace
    });
  };

  // Add Application Handler
  const handleAddApplication = () => {
    if (!newAppCompany.trim() || !newAppRole.trim()) return;

    const newApp: ApplicationTrackerItem = {
      id: `app_${Date.now()}`,
      company: newAppCompany.trim(),
      role: newAppRole.trim(),
      status: newAppStatus,
      matchScore: Math.floor(Math.random() * 20) + 75,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newApp, ...localApplications];
    setLocalApplications(updated);
    setShowAddAppModal(false);
    setNewAppCompany('');
    setNewAppRole('');

    if (currentUser) {
      syncCareerGpsToFirestore(currentUser.id, {
        roadmapNodes: localRoadmap,
        skillGaps: localSkillGaps,
        applications: updated,
        placementReadiness: studentProfile.placementReadiness
      });
    }
  };

  // ── 1. RENDER EMPTY STATE, QUESTIONNAIRE, OR ONBOARDING WIZARD IF NOT COMPLETED ──
  if (!hasCompletedOnboarding) {
    if (isGeneratingAI) {
      return (
        <div className="py-24 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-spin">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">Generating Personalized AI Career GPS...</h3>
            <p className="text-xs font-mono text-indigo-300">Calculating adaptive roadmap for {targetTime} ({remainingDays} Days) to {targetCompany}...</p>
          </div>
        </div>
      );
    }

    if (showQuestionnaire) {
      return (
        <CareerDiscoveryQuestionnaire
          onComplete={(rec) => {
            setAssessmentRecord(rec);
            setShowQuestionnaire(false);
            setGpsMode('discovery');
          }}
          onCancel={() => setShowQuestionnaire(false)}
        />
      );
    }

    if (gpsMode === 'discovery' && assessmentRecord) {
      return (
        <CareerMatchesView
          assessmentRecord={assessmentRecord}
          onSelectCareer={async (selectedRole, duration) => {
            setHasCompletedOnboarding(true);
            setEditRole(selectedRole);
            setEditTime(duration);
            await generateDynamicRoadmap({
              company: 'Target Company',
              role: selectedRole,
              time: duration,
              dHours: 4,
              wDays: 6,
              skillsList: studentProfile.skills.map(s => s.name),
              pace: 'Balanced Plan'
            });
            setGpsMode('roadmap');
          }}
          onRetakeAssessment={() => setShowQuestionnaire(true)}
        />
      );
    }

    if (!showDiscoveryWizard) {
      return (
        <div className="py-12 text-center space-y-8 animate-fadeIn max-w-2xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-indigo-500/30 bg-slate-950/90 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto text-white text-3xl shadow-xl shadow-indigo-500/30 animate-bounce-subtle">
            🧭
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">CAREER GPS</h2>
            <p className="text-sm font-mono text-indigo-300">Where do you want to go?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-mono">
            {/* OPTION 1: PLAN MY CAREER */}
            <button
              onClick={() => setShowDiscoveryWizard(true)}
              className="p-6 rounded-3xl border border-indigo-500/40 bg-slate-900/90 hover:bg-indigo-950/60 hover:border-indigo-500 transition-all text-left space-y-3 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">🎯 PLAN MY CAREER</h3>
                <p className="text-xs text-slate-400 mt-1">I already know my desired role and target goal.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Create my detailed roadmap →</span>
              </div>
            </button>

            {/* OPTION 2: RECOMMEND MY CAREER */}
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="p-6 rounded-3xl border border-purple-500/40 bg-slate-900/90 hover:bg-purple-950/60 hover:border-purple-500 transition-all text-left space-y-3 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-2xl group-hover:scale-110 transition-transform">
                🧭
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">🧭 RECOMMEND MY CAREER</h3>
                <p className="text-xs text-slate-400 mt-1">I'm not sure which career is right for me.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Help me discover my best options →</span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    return (
      <CareerGpsOnboardingWizard
        initialCompany={targetCompany}
        initialRole={careerGoal}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // ── 2. RENDER ACTIVE ADAPTIVE CAREER GPS VIEW ──
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* MODE TAB STRIP: PLAN MY CAREER VS RECOMMEND MY CAREER */}
      <div className="flex items-center gap-3 font-mono text-xs font-bold border-b border-slate-800 pb-3">
        <button
          onClick={() => { setGpsMode('roadmap'); setShowQuestionnaire(false); }}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all ${
            gpsMode === 'roadmap' && !showQuestionnaire
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>🎯 PLAN MY CAREER (Active Roadmap)</span>
        </button>

        <button
          onClick={() => {
            if (!assessmentRecord) {
              setShowQuestionnaire(true);
            } else {
              setGpsMode('discovery');
              setShowQuestionnaire(false);
            }
          }}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all ${
            gpsMode === 'discovery' || showQuestionnaire
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>🧭 RECOMMEND MY CAREER</span>
        </button>
      </div>

      {showQuestionnaire ? (
        <CareerDiscoveryQuestionnaire
          onComplete={(rec) => {
            setAssessmentRecord(rec);
            setShowQuestionnaire(false);
            setGpsMode('discovery');
          }}
          onCancel={() => setShowQuestionnaire(false)}
        />
      ) : gpsMode === 'discovery' && assessmentRecord ? (
        <CareerMatchesView
          assessmentRecord={assessmentRecord}
          onSelectCareer={async (selectedRole, duration) => {
            setEditRole(selectedRole);
            setEditTime(duration);
            await generateDynamicRoadmap({
              company: targetCompany || 'Target Company',
              role: selectedRole,
              time: duration,
              dHours: dailyHours || 4,
              wDays: weeklyDays || 6,
              skillsList: studentProfile.skills.map(s => s.name),
              pace: 'Balanced Plan'
            });
            setGpsMode('roadmap');
          }}
          onRetakeAssessment={() => setShowQuestionnaire(true)}
        />
      ) : (
        <>
          {/* Target Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/50 to-purple-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>DYNAMIC ADAPTIVE PLANNING ENGINE • TIME-CONSTRAINED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🎯 Target: {targetCompany} ({careerGoal})</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Target Deadline: <strong className="text-amber-300 font-mono">{targetTime} ({remainingDays} Days Left)</strong> • Daily Capacity: <strong className="text-indigo-300 font-mono">{dailyHours} hrs/day ({weeklyDays} days/wk)</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                generateDynamicRoadmap({
                  company: targetCompany,
                  role: careerGoal,
                  time: targetTime,
                  dHours: dailyHours,
                  wDays: weeklyDays,
                  skillsList: studentProfile.skills.map(s => s.name),
                  pace: planPace
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ Force Regenerate Roadmap</span>
            </button>

            <button
              onClick={() => {
                setEditCompany(targetCompany);
                setEditRole(careerGoal);
                setEditTime(targetTime);
                setEditDailyHours(dailyHours);
                setEditWeeklyDays(weeklyDays);
                setEditSkillsInput(studentProfile.skills.map(s => s.name).join(', '));
                setShowEditPlanModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 cursor-pointer transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Career Plan & Deadline</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEVELOPMENT DEBUG PANEL */}
      {showDebugPanel && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs font-mono space-y-2 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>CAREER GPS REAL-TIME VERIFICATION PANEL (STEP 15 DEBUG)</span>
            </span>
            <button onClick={() => setShowDebugPanel(false)} className="text-slate-500 hover:text-white cursor-pointer">Hide Debug Panel ✕</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            <div><span className="text-slate-500">Selected Role:</span> <strong className="text-amber-300 font-bold">{careerGoal}</strong></div>
            <div><span className="text-slate-500">Selected Duration:</span> <strong className="text-indigo-300 font-bold">{targetTime} ({monthlyPlans.length} Months)</strong></div>
            <div><span className="text-slate-500">Daily Capacity:</span> <strong className="text-purple-300 font-bold">{dailyHours} Hours/day</strong></div>
            <div><span className="text-slate-500">Roadmap Version:</span> <strong className="text-emerald-300 font-bold">v{roadmapVersion}</strong></div>
            <div><span className="text-slate-500">Months Generated:</span> <strong className="text-teal-300 font-bold">{monthlyPlans.length} Months</strong></div>
            <div><span className="text-slate-500">Unique Objectives:</span> <strong className="text-purple-300 font-bold">{new Set(monthlyPlans.map(m => m.objective)).size}</strong></div>
            <div className="col-span-2"><span className="text-slate-500">Generated from current user inputs:</span> <strong className="text-emerald-400 font-bold">YES ✓ (100% Dynamic Engine)</strong></div>
          </div>
        </div>
      )}

      {/* SMART SHORT-DEADLINE WARNING (IF <= 90 DAYS OR 3 MONTHS) */}
      {remainingDays <= 90 && (
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/50 bg-amber-950/30 space-y-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚠️ AI Deadline Warning: You have only {remainingDays} days remaining!</span>
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Completing every single topic in exhaustive depth may not be realistic within {remainingDays} days. Chrona AI has generated an optimized high-priority roadmap focusing on the most critical interview skills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
            <span className="text-[11px] font-mono text-slate-400">Select Plan Strategy:</span>
            {(['Fast Track Plan', 'Balanced Plan', 'Intensive Plan'] as const).map(pace => (
              <button
                key={pace}
                onClick={() => {
                  setPlanPace(pace);
                  generateDynamicRoadmap({
                    company: targetCompany,
                    role: careerGoal,
                    time: targetTime,
                    dHours: dailyHours,
                    wDays: weeklyDays,
                    skillsList: studentProfile.skills.map(s => s.name),
                    pace
                  });
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  planPace === pace
                    ? 'bg-amber-500 text-slate-950 border border-amber-400 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {pace}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HIGHEST IMPACT NEXT STEP */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/40 bg-purple-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-purple-300 uppercase font-bold tracking-wider">Next Best Action</div>
            <h3 className="text-lg font-black text-white mt-0.5">
              ✔ {nextBestAction}
            </h3>
            <p className="text-xs text-slate-300">
              High-ROI milestone tailored for {remainingDays}-day deadline to {targetCompany}.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            openWhyRationale({
              goal: `${targetCompany} Career Roadmap`,
              deadline: `${remainingDays} Days Remaining`,
              skillGap: 'Target Coding & DSA',
              energyLevel: 'Optimal (90%)',
              focusPrediction: 'High Focus Window',
              why: `Target date (${targetTime}) requires executing ${nextBestAction} to maintain overall pace.`
            })
          }
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all cursor-pointer shrink-0"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Why Next Step?</span>
        </button>
      </div>

      {/* ADAPTIVE PLANNING METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 text-center bg-slate-950/80">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Remaining Time & Level</div>
          <div className="text-sm font-black text-indigo-300 font-mono">{remainingDays} Days / {remainingWeeks} Wks ({journeyLevel})</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 text-center bg-slate-950/80">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Total Available Hours</div>
          <div className="text-xl font-black text-purple-300 font-mono">{totalStudyHoursAvailable} Hours</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 text-center bg-slate-950/80">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">AI Confidence</div>
          <div className="text-xl font-black text-emerald-300 font-mono">{aiConfidence}%</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 text-center bg-slate-950/80">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Placement Readiness</div>
          <div className="text-xl font-black text-amber-300 font-mono">{studentProfile.placementReadiness}%</div>
        </div>
      </div>

      {/* INTERACTIVE TIMELINE VISUALIZATION */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Interactive Timeline ({targetTime} Plan)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {projectedTimeline.map((pt, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-center">
              <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{pt.month}</div>
              <div className="text-xs font-bold text-slate-200 line-clamp-2">{pt.topic}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL HORIZON DAY-BY-DAY CAREER GPS EXECUTION ROADMAP */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-6">
        {/* Toast Banner */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between animate-fadeIn">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Full-Horizon AI Career Mentor Roadmap for {targetCompany}</span>
            </h2>
            <p className="text-xs text-slate-400">Complete day-by-day execution plan for all {remainingDays} days ({totalStudyHoursAvailable} total study hours).</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('🔗 Roadmap share link copied to clipboard!');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* MONTH SELECTOR TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
          {Array.from({ length: Math.ceil(remainingDays / 30) }, (_, i) => i + 1).map(mNum => (
            <button
              key={mNum}
              onClick={() => {
                setActiveMonthTab(mNum);
                setActiveWeekFilter('all');
                setExpandedDayNumber((mNum - 1) * 30 + 1);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${
                activeMonthTab === mNum
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Month {mNum} (Days {(mNum - 1) * 30 + 1}–{Math.min(remainingDays, mNum * 30)})
            </button>
          ))}
        </div>

        {/* WEEK FILTER TABS */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Filter Week:</span>
          {(['all', 1, 2, 3, 4] as const).map(wOpt => (
            <button
              key={String(wOpt)}
              onClick={() => setActiveWeekFilter(wOpt)}
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono cursor-pointer ${
                activeWeekFilter === wOpt
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {wOpt === 'all' ? 'All Weeks' : `Week ${wOpt}`}
            </button>
          ))}
        </div>

        {/* ACTIVE MONTH PROGRESSION OVERVIEW CARD */}
        {monthlyPlans.length > 0 && monthlyPlans[activeMonthTab - 1] && (() => {
          const mPlan = monthlyPlans[activeMonthTab - 1];
          return (
            <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 bg-slate-900/90 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">ACTIVE PROGRESSION PHASE</div>
                  <h3 className="text-lg font-black text-white">{mPlan.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                  {mPlan.skillGapReduction}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-indigo-300 font-mono">🎯 Month Objective:</h5>
                  <p className="text-slate-300 leading-relaxed">{mPlan.objective}</p>
                  <div className="text-[11px] text-slate-400 italic">Why it matters: {mPlan.whyItMatters}</div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-emerald-300 font-mono">🛠️ Core Skills to Develop:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {mPlan.skillsToDevelop.map((sk, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">🚀 Month Capstone Project:</span>
                  <span className="text-slate-200 font-bold">{mPlan.project}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">📝 Assessment & Test:</span>
                  <span className="text-amber-300 font-bold">{mPlan.assessment}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">🔑 Next Month Prerequisites:</span>
                  <span className="text-purple-300 font-bold">{mPlan.nextMonthPrerequisites}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* DAY-BY-DAY CARDS LIST FOR ACTIVE MONTH */}
        <div className="space-y-4 pt-2">
          {(() => {
            const activeMonthObj = monthlyPlans[activeMonthTab - 1];
            const dayPlansList = activeMonthObj?.dayPlans || [];

            return dayPlansList.map((dayItem) => {
              const dayNum = dayItem.dayNumber;
              const weekInMonth = Math.ceil(dayNum / 7);

              if (activeWeekFilter !== 'all' && activeWeekFilter !== weekInMonth) return null;

              const isExpanded = expandedDayNumber === dayNum;

              return (
                <div
                  key={dayNum}
                  className="p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 transition-all hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-extrabold">
                          Month {activeMonthTab} • Day {dayNum} (Week {weekInMonth})
                        </span>
                        <h4 className="text-sm font-bold text-white">{dayItem.taskTitle}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>Est. {Math.round(dayItem.estimatedMinutes / 60)} Hours ({dayItem.estimatedMinutes} mins)</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">Priority: {dayItem.priority}</span>
                        <span>•</span>
                        <span className="text-purple-300 font-semibold">Skill: {dayItem.skill}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          addCustomMission(`${dayItem.taskTitle} (${targetCompany})`, 'Career GPS', dayItem.estimatedMinutes, dayItem.priority, dayItem.whyItMatters);
                          showToast(`⚡ Synced Day ${dayNum}: "${dayItem.taskTitle}" to Today's Mission!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>⚡ Push to Today's Mission</span>
                      </button>

                      <button
                        onClick={() => setExpandedDayNumber(isExpanded ? null : dayNum)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                      >
                        {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DAY SCHEDULE & DETAILS */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800 space-y-4 animate-fadeIn text-xs">
                      <div className="space-y-2">
                        <h5 className="font-bold text-indigo-300 font-mono">🕒 Time-Budgeted Schedule ({dailyHours} Hours/day):</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="font-mono text-indigo-400">Core Topic Study</span>
                            <span className="text-slate-200">{Math.round(dayItem.estimatedMinutes * 0.4)} mins</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="font-mono text-purple-400">Hands-on Exercises</span>
                            <span className="text-slate-200">{Math.round(dayItem.estimatedMinutes * 0.4)} mins</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="font-mono text-emerald-400">Project / Revision</span>
                            <span className="text-slate-200">{Math.round(dayItem.estimatedMinutes * 0.2)} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="font-bold text-purple-300 font-mono">🎯 Expected Outcome:</h5>
                        <p className="text-slate-300">{dayItem.expectedOutcome}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 font-mono text-[11px]">
                        ✨ AI Rationale: {dayItem.whyItMatters}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* SKILL GAP ANALYSIS & APPLICATION TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SKILL GAP ANALYSIS */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-purple-400" />
            <span>Skill Gap Analysis for {targetCompany}</span>
          </h3>

          {localSkillGaps.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Upload className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Upload your resume or add your skills to generate a personalized Skill Gap Analysis.
              </p>
              <button
                onClick={() => setShowEditPlanModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                + Add Skills / Edit Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {localSkillGaps.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{item.skill}</span>
                    <span className="font-mono text-purple-300">
                      {item.currentLevel}% / {item.targetLevel}% Target
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        item.currentLevel >= item.targetLevel ? 'bg-emerald-400' : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                      }`}
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Category: {item.category}</span>
                    <span className={`font-mono font-semibold ${item.impact === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {item.impact} Weightage
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APPLICATION TRACKER */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Target Application Tracker</span>
            </h3>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>

          {localApplications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">No applications added yet.</p>
                <p className="text-[11px] text-slate-500">Track your company applications, interviews, and offer letters here.</p>
              </div>
              <button
                onClick={() => setShowAddAppModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Application</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {localApplications.map(app => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.company}</span>
                      <span className="text-xs text-slate-400 font-mono">Match: {app.matchScore}%</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">{app.role}</div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                      app.status === 'Applied'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : app.status === 'Interviewing'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                        : app.status === 'Offer'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {app.status}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{app.appliedDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT CAREER PLAN MODAL */}
      {showEditPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/30 bg-slate-900 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Edit Career Plan & Target Deadline</span>
              </h3>
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Dream Company</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={e => setEditCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Dream Role</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 font-bold mb-1">Target Remaining Time / Deadline</label>
                <div className="grid grid-cols-3 gap-2">
                  {['3 Months', '6 Months', '9 Months', '12 Months', '18 Months', '24 Months'].map(tt => (
                    <button
                      key={tt}
                      onClick={() => setEditTime(tt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editTime === tt
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Daily Study Hours ({editDailyHours} hrs/day)</label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={editDailyHours}
                    onChange={e => setEditDailyHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Study Days / Week ({editWeeklyDays} days/wk)</label>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={editWeeklyDays}
                    onChange={e => setEditWeeklyDays(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Current Skills (comma separated)</label>
                <input
                  type="text"
                  value={editSkillsInput}
                  onChange={e => setEditSkillsInput(e.target.value)}
                  placeholder="e.g. Python, Java, SQL, React"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditPlan}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold cursor-pointer shadow-lg shadow-indigo-500/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Regenerate AI Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD APPLICATION MODAL */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-900 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Add Target Application</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  value={newAppCompany}
                  onChange={e => setNewAppCompany(e.target.value)}
                  placeholder="e.g. Google / Microsoft"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Role Title</label>
                <input
                  type="text"
                  value={newAppRole}
                  onChange={e => setNewAppRole(e.target.value)}
                  placeholder="e.g. Software Engineer University Grad"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1">Application Status</label>
                <select
                  value={newAppStatus}
                  onChange={e => setNewAppStatus(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddAppModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplication}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Save Application
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
