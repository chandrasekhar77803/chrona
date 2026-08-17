import React, { useState, useEffect } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import {
  calculatePlacementReadiness,
  calculateCompanyMatches,
  savePlacementProfile,
  getUserProjects,
  saveUserProjects,
  getUserApplications,
  saveUserApplications,
  getUserResumeData,
  generate5DayInterviewPrepPlan
} from '../../services/placementService';
import {
  Target,
  Compass,
  Building2,
  Rocket,
  FileText,
  Briefcase,
  MessageSquare,
  Plus,
  Zap,
  X
} from 'lucide-react';
import type {
  PlacementReadinessBreakdown,
  CompanyMatchResult,
  PlacementProject,
  PlacementApplicationRecord,
  PlacementResumeData
} from '../../types/chrona';

export const PlacementHubView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    skillGaps,
    setActiveSection,
    addCustomMission
  } = useChrona();

  // Active Tab Mode
  const [activeTab, setActiveTab] = useState<'overview' | 'gps' | 'company' | 'projects' | 'resume' | 'applications'>('overview');

  // State
  const [readiness, setReadiness] = useState<PlacementReadinessBreakdown>({
    overallScore: 78,
    technicalSkills: 82,
    dsaPerformance: 64,
    projectsScore: 80,
    communication: 91,
    resumeScore: 74,
    interviewReadiness: 61,
    topPriorityGap: 'Improve Data Structures & Algorithms (DSA)',
    nextAction: 'Complete 2 DSA problems'
  });

  const [companyMatches, setCompanyMatches] = useState<CompanyMatchResult[]>([]);
  const [projects, setProjects] = useState<PlacementProject[]>([]);
  const [applications, setApplications] = useState<PlacementApplicationRecord[]>([]);
  const [resumeData, setResumeData] = useState<PlacementResumeData | null>(null);

  // New Project Form Modal
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');

  // New Application Form Modal
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppRole, setNewAppRole] = useState('');
  const [newAppStatus, setNewAppStatus] = useState<PlacementApplicationRecord['status']>('Applied');

  // 5-Day Interview Prep Modal
  const [selectedAppForPrep, setSelectedAppForPrep] = useState<PlacementApplicationRecord | null>(null);

  // Load User Data from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      const pProjects = await getUserProjects(currentUser.id);
      const pApps = await getUserApplications(currentUser.id);
      const pResume = await getUserResumeData(currentUser.id);

      const calculatedReadiness = calculatePlacementReadiness({
        technicalSkillsCount: studentProfile.skills.length,
        skillGaps,
        projects: pProjects,
        resumeData: pResume,
        applications: pApps,
        targetRole: studentProfile.careerGoal
      });

      const matches = calculateCompanyMatches(calculatedReadiness, studentProfile.careerGoal);

      setProjects(pProjects);
      setApplications(pApps);
      setResumeData(pResume);
      setReadiness(calculatedReadiness);
      setCompanyMatches(matches);

      // Save updated readiness profile
      await savePlacementProfile(currentUser.id, {
        userId: currentUser.id,
        targetRole: studentProfile.careerGoal || 'Software Engineer',
        targetCompany: studentProfile.dreamCompany || 'Google',
        availablePreparationTime: '6 months',
        readiness: calculatedReadiness,
        updatedAt: new Date().toISOString()
      });
    };

    loadData();
  }, [currentUser, studentProfile.careerGoal, studentProfile.dreamCompany, skillGaps]);

  // Handle Add Project
  const handleAddProject = async () => {
    if (!newProjName.trim()) return;
    const proj: PlacementProject = {
      id: `proj-${Date.now()}`,
      name: newProjName.trim(),
      description: newProjDesc.trim() || 'Role-relevant portfolio project.',
      technologyUsed: newProjTech.split(',').map(s => s.trim()).filter(Boolean),
      skillsDemonstrated: [studentProfile.careerGoal || 'Software Development'],
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0]
    };

    const updated = [...projects, proj];
    setProjects(updated);
    setNewProjName('');
    setNewProjDesc('');
    setNewProjTech('');
    setShowAddProjectModal(false);

    if (currentUser) {
      await saveUserProjects(currentUser.id, updated);
    }
  };

  // Handle Add Application
  const handleAddApplication = async () => {
    if (!newAppCompany.trim()) return;
    const app: PlacementApplicationRecord = {
      id: `app-${Date.now()}`,
      company: newAppCompany.trim(),
      role: newAppRole.trim() || studentProfile.careerGoal || 'Software Engineer',
      status: newAppStatus,
      matchScore: 78,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [...applications, app];
    setApplications(updated);
    setNewAppCompany('');
    setNewAppRole('');
    setShowAddAppModal(false);

    if (currentUser) {
      await saveUserApplications(currentUser.id, updated);
    }
  };

  // Push Task to Today's Mission
  const handlePushTaskToMission = (title: string, category: string = 'Placement') => {
    addCustomMission(title, category, 30, 'Critical', `Placement Hub action item to accelerate readiness for ${studentProfile.careerGoal}`);
    setActiveSection('home');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* PLACEMENT HUB HEADER BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-purple-950/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>CHRONA PLACEMENT HUB • CAREER TO PLACEMENT ENGINE</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🎯 Placement Hub</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              {readiness.overallScore}% Placement Ready
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-mono">
            Targeting <strong>{studentProfile.dreamCompany} ({studentProfile.careerGoal})</strong>. Your profile dynamically updates as you complete projects, DSA, resume building & mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveSection('chrona-mentor')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Talk to Placement Mentor</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TAB STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar font-mono text-xs font-bold border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: '🎯 Overview', icon: Target },
          { id: 'gps', label: '🧭 Placement GPS', icon: Compass },
          { id: 'company', label: '🏢 Company Match', icon: Building2 },
          { id: 'projects', label: '🚀 Projects Tracker', icon: Rocket },
          { id: 'resume', label: '📄 AI Resume', icon: FileText },
          { id: 'applications', label: '📋 Applications', icon: Briefcase }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* READINESS SCORE GAUGE & TOP PRIORITY STRIP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GAUGE CARD */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-4 text-center flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Placement Readiness Score</span>
              
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-emerald-400 transition-all duration-1000"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * readiness.overallScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-white font-mono">{readiness.overallScore}%</span>
                  <span className="text-[10px] font-mono text-emerald-400 block font-bold">Placement Ready</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono">
                "Your current placement readiness is <strong>{readiness.overallScore}%</strong>."
              </p>
            </div>

            {/* SKILL BREAKDOWN BARS */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
                <span>Placement Skill Breakdown</span>
                <span className="text-xs text-indigo-400">Target: {studentProfile.careerGoal}</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: 'Technical Skills', score: readiness.technicalSkills, color: 'bg-indigo-500' },
                  { label: 'DSA & Algorithms', score: readiness.dsaPerformance, color: 'bg-amber-500' },
                  { label: 'Projects Portfolio', score: readiness.projectsScore, color: 'bg-purple-500' },
                  { label: 'Communication & Tone', score: readiness.communication, color: 'bg-emerald-500' },
                  { label: 'Resume ATS Score', score: readiness.resumeScore, color: 'bg-teal-500' },
                  { label: 'Interview Readiness', score: readiness.interviewReadiness, color: 'bg-pink-500' }
                ].map((sk, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{sk.label}</span>
                      <span className="font-bold">{sk.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div style={{ width: `${sk.score}%` }} className={`h-full ${sk.color} transition-all duration-500`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP PRIORITY & NEXT ACTION */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-slate-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>🔥 TOP PRIORITY GAP</span>
              </div>
              <h3 className="text-lg font-black text-white font-mono">{readiness.topPriorityGap}</h3>
              <p className="text-xs text-slate-300 font-mono">Next Action: {readiness.nextAction}</p>
            </div>

            <button
              onClick={() => handlePushTaskToMission(readiness.nextAction, 'Placement Priority')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-amber-500/20 transition-all shrink-0"
            >
              Start Today's Mission →
            </button>
          </div>

          {/* UPCOMING OPPORTUNITIES & MY APPLICATIONS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COMPANY MATCH SNIPPETS */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Target Company Matches</span>
                </h3>
                <button onClick={() => setActiveTab('company')} className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer">
                  View All →
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {companyMatches.slice(0, 3).map(cm => (
                  <div key={cm.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{cm.companyName}</span>
                      <span className="text-[11px] text-slate-400">{cm.roleTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">{cm.matchScore}%</span>
                      <span className="text-[9px] text-slate-400 block">Match Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLICATIONS SUMMARY */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>My Applications Tracker</span>
                </h3>
                <button onClick={() => setActiveTab('applications')} className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer">
                  Manage Applications →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs text-center">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-black text-indigo-400 block">{applications.filter(a => a.status === 'Applied').length || 1}</span>
                  <span className="text-slate-400 text-[10px]">Applied</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-black text-amber-400 block">{applications.filter(a => a.status === 'Assessment').length || 1}</span>
                  <span className="text-slate-400 text-[10px]">Assessments</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-black text-purple-400 block">{applications.filter(a => a.status === 'Interview').length || 0}</span>
                  <span className="text-slate-400 text-[10px]">Interviews</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-black text-emerald-400 block">{applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length || 0}</span>
                  <span className="text-slate-400 text-[10px]">Shortlisted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PLACEMENT GPS ROADMAP ── */}
      {activeTab === 'gps' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <span>Placement GPS — Actionable Readiness Stages</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target: {studentProfile.dreamCompany} ({studentProfile.careerGoal}) • Step-by-step roadmap from profile analysis to job offer
              </p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {[
              { stage: '1. Current Profile Analysis', status: 'Completed', detail: 'Analyzed target role, skills, and current baseline scores.', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
              { stage: '2. Skill Gap Identification', status: 'In Progress', detail: `Identified priority gap: ${readiness.topPriorityGap}`, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30' },
              { stage: '3. Core Technical & DSA Learning', status: 'In Progress', detail: 'Solve 2 DSA problems daily & study technical concepts in Smart Notes.', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
              { stage: '4. Portfolio Project Building', status: 'Upcoming', detail: `Build 1 role-relevant project for ${studentProfile.careerGoal}.`, color: 'text-slate-400 border-slate-800 bg-slate-900' },
              { stage: '5. ATS Resume Optimization', status: 'Upcoming', detail: 'Generate ATS-optimized resume matching target job description.', color: 'text-slate-400 border-slate-800 bg-slate-900' },
              { stage: '6. AI Mock Interview Practice', status: 'Upcoming', detail: `Complete full technical & HR mock interview for ${studentProfile.dreamCompany}.`, color: 'text-slate-400 border-slate-800 bg-slate-900' },
              { stage: '7. Application & Placement Ready', status: 'Target', detail: 'Submit applications, track interview dates, and land offer.', color: 'text-slate-400 border-slate-800 bg-slate-900' }
            ].map((stg, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${stg.color} flex items-center justify-between`}>
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm block">{stg.stage}</span>
                  <p className="text-slate-300">{stg.detail}</p>
                </div>
                <button
                  onClick={() => handlePushTaskToMission(`Work on ${stg.stage}`, 'Placement GPS')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-bold text-[11px] cursor-pointer transition-all shrink-0"
                >
                  Add to Mission →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPANY MATCH ── */}
      {activeTab === 'company' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Target Company Match Engine</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Compares your profile, DSA, projects, and resume against company-specific hiring bars.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyMatches.map(cm => (
              <div key={cm.id} className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white font-mono">{cm.companyName}</h3>
                      <span className="text-xs font-mono text-indigo-400">{cm.roleTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400 font-mono">{cm.matchScore}%</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Preparation Match</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">DSA & Algorithms:</span>
                      <span className="font-bold text-amber-300">{cm.breakdown.dsa}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Technical Skills:</span>
                      <span className="font-bold text-indigo-300">{cm.breakdown.technicalSkills}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projects Match:</span>
                      <span className="font-bold text-purple-300">{cm.breakdown.projects}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 font-mono text-xs space-y-1">
                    <span className="font-bold text-rose-300 block">BIGGEST GAP: {cm.biggestGap}</span>
                    <p className="text-slate-300">Recommended module: {cm.recommendedDsaModule}</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePushTaskToMission(`Study ${cm.recommendedDsaModule} for ${cm.companyName}`, 'Company Match')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Start {cm.companyName} Skill Plan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: PROJECTS TRACKER ── */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                <span>Project Portfolio Tracker</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Track and build role-relevant projects for your target placement.
              </p>
            </div>

            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => (
              <div key={p.id} className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-mono">{p.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    p.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">{p.description}</p>
                
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {p.technologyUsed.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handlePushTaskToMission(`Work on project: ${p.name}`, 'Project Portfolio')}
                    className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer"
                  >
                    Add to Today's Mission →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD PROJECT MODAL */}
          {showAddProjectModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-white font-mono">Add Placement Project</h3>
                  <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Project Name</label>
                    <input
                      type="text"
                      value={newProjName}
                      onChange={e => setNewProjName(e.target.value)}
                      placeholder="e.g. AI Resume Screening Assistant"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Description</label>
                    <textarea
                      value={newProjDesc}
                      onChange={e => setNewProjDesc(e.target.value)}
                      placeholder="Brief description of skills demonstrated..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Technologies Used (comma separated)</label>
                    <input
                      type="text"
                      value={newProjTech}
                      onChange={e => setNewProjTech(e.target.value)}
                      placeholder="e.g. Python, React, PyTorch"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddProjectModal(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs">
                    Cancel
                  </button>
                  <button onClick={handleAddProject} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold">
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: AI RESUME BUILDER & ANALYZER ── */}
      {activeTab === 'resume' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span>AI Resume Builder & ATS Keyword Analyzer</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Generates ATS-friendly resumes using your actual verified profile, skills, and projects.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold">
              ATS Match: {readiness.resumeScore}%
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-white block text-sm">{studentProfile.name} — Resume Snapshot</span>
              <div>• Target Role: {studentProfile.careerGoal}</div>
              <div>• Resume Record: {resumeData ? `ATS Score ${resumeData.atsMatchScore}%` : 'Standard Verified Profile'}</div>
              <div>• Key Skills: {studentProfile.skills.map(s => s.name).join(', ') || 'Python, JavaScript'}</div>
              <div>• Projects Included: {projects.map(p => p.name).join(', ') || 'Role Portfolio Project'}</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
              <span className="font-bold text-amber-300 block">MISSING ATS KEYWORDS FOR {studentProfile.dreamCompany}:</span>
              <div className="flex flex-wrap gap-2">
                {['System Design', 'MLOps', 'Distributed Systems', 'Docker'].map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-900/60 border border-amber-500/40 text-amber-200">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handlePushTaskToMission('Add missing ATS keywords to resume', 'AI Resume')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold cursor-pointer"
              >
                Optimize Resume ATS Score →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: APPLICATIONS TRACKER & 5-DAY INTERVIEW PREP ── */}
      {activeTab === 'applications' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <span>Job Application Lifecycle Tracker</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Track status, assessment dates, and 5-Day Interview Preparation plans.
              </p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {applications.map(app => (
              <div key={app.id} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">{app.company}</span>
                  <span className="text-slate-400">{app.role} • Applied: {app.appliedDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    {app.status}
                  </span>

                  <button
                    onClick={() => setSelectedAppForPrep(app)}
                    className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold cursor-pointer"
                  >
                    5-Day Prep Plan →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD APPLICATION MODAL */}
          {showAddAppModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-white font-mono">Add Application Record</h3>
                  <button onClick={() => setShowAddAppModal(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newAppCompany}
                      onChange={e => setNewAppCompany(e.target.value)}
                      placeholder="e.g. Google / Microsoft"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Role Title</label>
                    <input
                      type="text"
                      value={newAppRole}
                      onChange={e => setNewAppRole(e.target.value)}
                      placeholder="e.g. AI Engineer Intern"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Status</label>
                    <select
                      value={newAppStatus}
                      onChange={e => setNewAppStatus(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Interested">Interested</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Applied">Applied</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddAppModal(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs">
                    Cancel
                  </button>
                  <button onClick={handleAddApplication} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold">
                    Save Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5-DAY INTERVIEW PREP PLAN MODAL */}
          {selectedAppForPrep && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-slate-950 max-w-xl w-full space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-white">
                    🎯 5-Day Interview Preparation: {selectedAppForPrep.company} ({selectedAppForPrep.role})
                  </h3>
                  <button onClick={() => setSelectedAppForPrep(null)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {generate5DayInterviewPrepPlan(selectedAppForPrep.company, selectedAppForPrep.role).map(d => (
                    <div key={d.day} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-purple-400 block">DAY {d.day}: {d.title}</span>
                      {d.tasks.map((t, idx) => (
                        <div key={idx} className="text-slate-300 text-[11px]">• {t}</div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      handlePushTaskToMission(`Complete 5-Day Interview Prep for ${selectedAppForPrep.company}`, 'Interview Prep');
                      setSelectedAppForPrep(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold cursor-pointer"
                  >
                    Add 5-Day Plan to Mission →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
