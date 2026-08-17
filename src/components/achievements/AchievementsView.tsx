import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import {
  saveCertificateToFirestore,
  getUserCertificatesFromFirestore,
  deleteCertificateFromFirestore,
  type FirestoreCertificate
} from '../../services/firebaseService';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Eye,
  Flame,
  Star,
  Printer,
  X,
  Trash2,
  Users,
  Zap
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { studentProfile, updateStudentProfile } = useChrona();

  // Active Tab: 'certificates' | 'milestones' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'certificates' | 'milestones' | 'leaderboard'>('certificates');

  // Certificates State from Firestore
  const [certificates, setCertificates] = useState<FirestoreCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<FirestoreCertificate | null>(null);

  // Celebration Modal State
  const [celebrationCert, setCelebrationCert] = useState<FirestoreCertificate | null>(null);

  // Leaderboard Opt-In State
  const [isLeaderboardOptIn, setIsLeaderboardOptIn] = useState<boolean>(true);
  const [certFilterLevel, setCertFilterLevel] = useState<string>('All');

  // Load User Certificates on Mount
  useEffect(() => {
    const loadCerts = async () => {
      if (!currentUser) return;
      const data = await getUserCertificatesFromFirestore(currentUser.id);
      setCertificates(data);
    };

    loadCerts();
  }, [currentUser]);

  // Trigger Confetti Animation
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Generate & Award New Certificate
  const handleAwardCertificate = async (
    title: string,
    description: string,
    achievementType: FirestoreCertificate['achievementType'],
    level: FirestoreCertificate['level'],
    earnedFrom: string
  ) => {
    if (!currentUser) return;

    const code = `CHRONA-${level.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCert: FirestoreCertificate = {
      certificateId: `cert_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name || studentProfile.name || 'Alex Johnson',
      title,
      description,
      achievementType,
      level,
      issueDate: new Date().toISOString().split('T')[0],
      verificationCode: code,
      earnedFrom,
      streak: (studentProfile as any).streak || 14,
      careerGoal: studentProfile.careerGoal || 'AI Engineer',
      dreamCompany: studentProfile.dreamCompany || 'Google',
      placementReadiness: studentProfile.placementReadiness || 88,
      status: 'Issued'
    };

    await saveCertificateToFirestore(currentUser.id, newCert);
    setCertificates(prev => [newCert, ...prev]);

    // Fire Confetti and open Celebration modal
    fireConfetti();
    setCelebrationCert(newCert);

    // Update Placement Readiness
    updateStudentProfile({
      placementReadiness: Math.min(100, Number(((studentProfile.placementReadiness || 60) + 2.0).toFixed(1)))
    });
  };

  // Delete Certificate
  const handleDeleteCert = async (certId: string) => {
    if (!currentUser) return;
    await deleteCertificateFromFirestore(currentUser.id, certId);
    setCertificates(prev => prev.filter(c => c.certificateId !== certId));
    if (selectedCert?.certificateId === certId) setSelectedCert(null);
  };

  // Available Milestones Catalog
  const milestonesList = [
    {
      id: 'm1',
      title: '30-Day Learning Streak',
      level: 'Silver' as const,
      category: 'Streak',
      condition: 'Maintain a 30-day continuous learning streak',
      isUnlocked: certificates.some(c => c.title.includes('30-Day')),
      awardTitle: 'Certificate of Academic Consistency: 30-Day Streak',
      awardDesc: `Awarded for maintaining a 30-day learning streak in pursuit of joining ${studentProfile.dreamCompany || 'Google'}.`
    },
    {
      id: 'm2',
      title: 'Career GPS Explorer',
      level: 'Bronze' as const,
      category: 'Career GPS Milestone',
      condition: 'Complete initial Career GPS Discovery & Roadmap Setup',
      isUnlocked: certificates.some(c => c.title.includes('Career GPS Explorer')),
      awardTitle: 'Certificate of Career Discovery: Career Explorer',
      awardDesc: `Awarded for completing personalized Career GPS onboarding tailored to ${studentProfile.careerGoal || 'AI Engineer'}.`
    },
    {
      id: 'm3',
      title: 'Placement Readiness Master (75% Threshold)',
      level: 'Gold' as const,
      category: 'Placement Readiness',
      condition: 'Achieve 75%+ Placement Readiness Score',
      isUnlocked: certificates.some(c => c.title.includes('Placement Readiness')),
      awardTitle: 'Certificate of Placement Excellence: 75% Readiness',
      awardDesc: `Awarded for achieving 75%+ Placement Readiness score for ${studentProfile.dreamCompany || 'Google'}.`
    },
    {
      id: 'm4',
      title: 'Technical Mock Interview Champion',
      level: 'Platinum' as const,
      category: 'Mock Interview',
      condition: 'Complete 5 live AI Mock Technical Interviews with >85% score',
      isUnlocked: certificates.some(c => c.title.includes('Mock Interview')),
      awardTitle: 'Certificate of Technical Interview Mastery',
      awardDesc: 'Awarded for demonstrating exceptional technical communication & problem-solving in live AI interviews.'
    }
  ];

  // Leaderboard Mock Data
  const leaderboardUsers = [
    { rank: 1, name: 'Alex Johnson', streak: 42, certs: 8, readiness: 94, isCurrent: true },
    { rank: 2, name: 'Priya Sharma', streak: 38, certs: 7, readiness: 92, isCurrent: false },
    { rank: 3, name: 'David Chen', streak: 35, certs: 6, readiness: 90, isCurrent: false },
    { rank: 4, name: 'Sophia Miller', streak: 31, certs: 5, readiness: 88, isCurrent: false },
    { rank: 5, name: 'Rahul Verma', streak: 28, certs: 5, readiness: 86, isCurrent: false }
  ];

  const filteredCerts = certificates.filter(c => {
    if (certFilterLevel === 'All') return true;
    return c.level === certFilterLevel;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>AI MILESTONE & VERIFIABLE CERTIFICATION REWARDS SYSTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🏆 Achievements & Verifiable AI Certificates</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Earn verified AI credentials for streaks, roadmap completion, mock interview scores, and placement readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'certificates' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              📜 Certificates ({certificates.length})
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'milestones' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🎯 Milestones
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              👑 Leaderboard
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Certificates</span>
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{certificates.length}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Current Streak</span>
            <div className="text-2xl font-black text-rose-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Flame className="w-5 h-5 text-rose-400" />
              <span>{(studentProfile as any).streak || 14} Days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Placement Readiness</span>
            <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>{studentProfile.placementReadiness || 88}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Milestones Unlocked</span>
            <div className="text-2xl font-black text-indigo-400 font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>{milestonesList.filter(m => m.isUnlocked).length} / {milestonesList.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: CERTIFICATE SHOWCASE */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {/* LEVEL FILTER BAR */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-slate-400">Filter Tier Level:</span>
              {['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setCertFilterLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    certFilterLevel === lvl ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAwardCertificate(
                '30-Day Consistent Learning Streak',
                `Awarded for completing 30 consecutive study days toward the goal of becoming an ${studentProfile.careerGoal || 'AI Engineer'} at ${studentProfile.dreamCompany || 'Google'}.`,
                'Streak',
                'Silver',
                '30-Day Streak Milestone'
              )}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Claim Test Certificate</span>
            </button>
          </div>

          {/* CERTIFICATE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCerts.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-400 font-mono text-xs glass-panel rounded-3xl border border-slate-800 space-y-2">
                <Award className="w-10 h-10 text-indigo-400 mx-auto opacity-50" />
                <p>No certificates earned for this level tier yet. Complete Career GPS milestones or daily streaks to unlock!</p>
              </div>
            ) : (
              filteredCerts.map(cert => (
                <div
                  key={cert.certificateId}
                  className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 shadow-2xl relative space-y-4 hover:border-amber-400/60 transition-all group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold">
                        🏆
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">
                          CHRONA VERIFIED CERTIFICATE • {cert.level} TIER
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{cert.verificationCode}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-black text-white">{cert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed italic">{cert.description}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Issued To: <strong className="text-white">{cert.userName}</strong></span>
                    <span>Date: <strong className="text-indigo-300">{cert.issueDate}</strong></span>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View High-Res Certificate</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCert(cert.certificateId)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-400 cursor-pointer"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES & LEVEL TIER PROGRESSION */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Career GPS Milestone & Certificate Unlock Catalog</span>
            </h3>

            <div className="space-y-3">
              {milestonesList.map(m => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                    m.isUnlocked ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        m.level === 'Gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-400' :
                        m.level === 'Silver' ? 'bg-slate-300/20 text-slate-200 border border-slate-300' :
                        'bg-amber-700/20 text-amber-400 border border-amber-600'
                      }`}>
                        {m.level} Tier
                      </span>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                    </div>
                    <p className="text-slate-300">{m.condition}</p>
                  </div>

                  <div>
                    {m.isUnlocked ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Unlocked & Issued
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAwardCertificate(
                          m.awardTitle,
                          m.awardDesc,
                          m.category as any,
                          m.level,
                          m.title
                        )}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold font-mono cursor-pointer shadow-lg shadow-indigo-500/20"
                      >
                        Claim Milestone Certificate 🏆
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY OPT-IN LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Chrona Student Excellence Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Privacy-first global student ranking. Only opted-in profiles are visible.</p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Opt-In:</span>
              <button
                onClick={() => setIsLeaderboardOptIn(!isLeaderboardOptIn)}
                className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
                  isLeaderboardOptIn ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {isLeaderboardOptIn ? 'Public Profile ON' : 'Private Profile'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {leaderboardUsers.map(user => (
              <div
                key={user.rank}
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                  user.isCurrent ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-black flex items-center justify-center ${
                    user.rank === 1 ? 'bg-amber-500 text-slate-950' : user.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-800 text-white'
                  }`}>
                    #{user.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{user.name} {user.isCurrent && '(You)'}</h4>
                    <span className="text-[10px] text-slate-400">Streak: {user.streak} Days • Certificates: {user.certs}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Placement Readiness</span>
                  <span className="text-sm font-black text-emerald-400">{user.readiness}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL HIGH-RESOLUTION CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* CERTIFICATE ORNATE INNER CONTAINER */}
            <div className="p-6 rounded-2xl border border-amber-500/40 bg-slate-950/90 text-center space-y-6 relative overflow-hidden">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  CHRONA AI ACADEMIC & CAREER MENTORSHIP SYSTEM
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide">CERTIFICATE OF ACHIEVEMENT</h2>
                <div className="text-xs font-mono text-indigo-300">VERIFICATION ID: {selectedCert.verificationCode}</div>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-xs font-mono text-slate-400">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
                <h1 className="text-3xl font-black text-amber-300 tracking-tight">{selectedCert.userName}</h1>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto italic pt-2">
                  "{selectedCert.description}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="block text-[9px] text-slate-500">ISSUE DATE</span>
                  <strong className="text-white">{selectedCert.issueDate}</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500">TIER LEVEL</span>
                  <strong className="text-amber-400">{selectedCert.level}</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500">ISSUER SIGNATURE</span>
                  <strong className="text-indigo-300">Chrona AI System</strong>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF</span>
              </button>

              <button
                onClick={() => setSelectedCert(null)}
                className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFETTI CELEBRATION MODAL */}
      {celebrationCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-amber-500/50 bg-slate-950 shadow-2xl text-center space-y-6 animate-bounce-short">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/20">
              🎉
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Congratulations!</h2>
              <p className="text-xs text-slate-300 font-mono">
                You've earned the <strong>"{celebrationCert.title}"</strong> Certificate!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
              ⚡ Placement Readiness boosted by +2.0%!
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCert(celebrationCert);
                  setCelebrationCert(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/30"
              >
                View Certificate Now 📜
              </button>

              <button
                onClick={() => setCelebrationCert(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Continue Learning →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
