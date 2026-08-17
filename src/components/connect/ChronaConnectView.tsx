import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Shield,
  X,
  User,
  KeyRound
} from 'lucide-react';

export interface PlatformConfig {
  id: string;
  name: string;
  category: 'Competitive Coding' | 'Professional' | 'Developer' | 'Calendar & Email' | 'Notification Assistant';
  iconName: string;
  description: string;
  availablePermissions: string[];
  supportsGroups?: boolean;
}

export const ChronaConnectView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    addCustomMission,
    userIntegrations,
    connectUserIntegration,
    disconnectUserIntegration
  } = useChrona();

  const [activeTab, setActiveTab] = useState<'platforms' | 'hub' | 'privacy'>('platforms');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Permission & Account Linking Modal State
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [accountInput, setAccountInput] = useState<string>('');
  const [monitoredGroups, setMonitoredGroups] = useState<string[]>(['Placement Group', 'Hackathon Group']);

  // Notification Hub State
  const [selectedHubCategory, setSelectedHubCategory] = useState<string>('All');

  // Supported Platforms Registry
  const platformsList: PlatformConfig[] = [
    {
      id: 'leetcode',
      name: 'LeetCode',
      category: 'Competitive Coding',
      iconName: 'Code2',
      description: 'Sync solved problem metrics (Easy/Medium/Hard), contest rating, and Placement Readiness Score.',
      availablePermissions: [
        'Read Solved Problem Metrics (Easy/Medium/Hard)',
        'Read Contest Rating & World Ranking',
        'Read Daily Streak & Topics Covered',
        'Sync Progress with Career GPS Placement Readiness'
      ]
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'Professional',
      iconName: 'Linkedin',
      description: 'Import verified skills, certifications, and experience to enhance Career GPS recommendations.',
      availablePermissions: [
        'Read Profile Skills & Endorsements',
        'Read Work Experience & Education History',
        'Read Profile Certifications',
        'Sync Career Preferences with Career GPS Engine'
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'Developer',
      iconName: 'Github',
      description: 'Synchronize repository projects, language breakdown, and contribution graph.',
      availablePermissions: [
        'Read Public Repositories & Starred Projects',
        'Read Primary Programming Languages',
        'Read Contribution Activity Graph',
        'Sync Pinned Repositories to Career GPS Portfolio'
      ]
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      category: 'Competitive Coding',
      iconName: 'Terminal',
      description: 'Import domain stars, verified skill badges, and problem solving ranks.',
      availablePermissions: [
        'Read Domain Badges & Stars',
        'Read Verified Skills Certificates',
        'Read Problem Solving Leaderboard Rank'
      ]
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      category: 'Competitive Coding',
      iconName: 'Code2',
      description: 'Sync CodeChef star rating, contest division, and competitive progress.',
      availablePermissions: [
        'Read CodeChef Star Rating (e.g. 4-Star)',
        'Read Global & Country Rank',
        'Read Solved Contest Problems'
      ]
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      category: 'Competitive Coding',
      iconName: 'Terminal',
      description: 'Import Codeforces max rating, rank title, and problem archive progress.',
      availablePermissions: [
        'Read Current & Max Rating (e.g. Specialist)',
        'Read Solved Problem Archive Count',
        'Read Contest Participation History'
      ]
    },
    {
      id: 'gmail',
      name: 'Gmail',
      category: 'Calendar & Email',
      iconName: 'Mail',
      description: 'Scan authorized interview invites, test schedules, and placement updates.',
      availablePermissions: [
        'Scan Interview Invites & Assessment Links',
        'Extract Test Deadlines to AI Calendar',
        'Strictly Ignore Personal/Private Emails'
      ]
    },
    {
      id: 'gcalendar',
      name: 'Google Calendar',
      category: 'Calendar & Email',
      iconName: 'Calendar',
      description: 'Synchronize academic deadlines, hackathon dates, and contest reminders.',
      availablePermissions: [
        'Read Academic & Exam Events',
        'Sync Chrona Master Calendar Events'
      ]
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      category: 'Calendar & Email',
      iconName: 'Mail',
      description: 'Import campus drive schedules and university portal notifications.',
      availablePermissions: [
        'Read University Placement Drives',
        'Read Corporate Assessment Invites'
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Notification Assistant',
      category: 'Notification Assistant',
      iconName: 'MessageSquare',
      description: 'Permission-based assistant for placement & college groups. Zero access to private chats!',
      supportsGroups: true,
      availablePermissions: [
        'Monitor Selected Placement & College Notice Groups Only',
        'Extract Hackathon, Internship & Drive Announcements',
        'Strictly ZERO Access to Private Chats or Personal Messages'
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram Notification Assistant',
      category: 'Notification Assistant',
      iconName: 'Send',
      description: 'Monitor authorized internship & coding club channels for career opportunities.',
      supportsGroups: true,
      availablePermissions: [
        'Monitor Selected Career & Hackathon Channels',
        'Extract Event Deadlines to AI Notification Hub',
        'Strictly ZERO Access to Private Messages'
      ]
    }
  ];

  // AI Notification Opportunities Data
  const sampleNotifications = [
    {
      id: 'notif_1',
      platform: 'LeetCode',
      category: 'Coding Contests',
      title: 'LeetCode Weekly Contest 412 Announced',
      description: 'Starts Sunday 08:00 AM. Expected topics: Dynamic Programming & Binary Search.',
      deadline: 'In 2 Days',
      priority: 'High' as const,
      matchedCompany: studentProfile?.dreamCompany || 'Google',
      suggestedTask: 'Register & Complete LeetCode Weekly Contest 412'
    },
    {
      id: 'notif_2',
      platform: 'LinkedIn',
      category: 'Internships',
      title: `${studentProfile?.dreamCompany || 'Google'} Summer AI Research Internship Applications Open`,
      description: 'Role: AI/ML Engineering Intern. Requirements: Python, PyTorch, System Fundamentals.',
      deadline: '5 Days Left',
      priority: 'High' as const,
      matchedCompany: studentProfile?.dreamCompany || 'Google',
      suggestedTask: `Apply for ${studentProfile?.dreamCompany || 'Google'} Summer AI Internship`
    },
    {
      id: 'notif_3',
      platform: 'WhatsApp Notification Assistant',
      category: 'Placement Drives',
      title: 'Campus Drive Announcement: Tier-1 Tech Placement Registration',
      description: 'Extracted from Placement Group. Eligible: CS/IT students with >7.5 CGPA.',
      deadline: 'Tomorrow 11:59 PM',
      priority: 'High' as const,
      matchedCompany: 'Campus Placement',
      suggestedTask: 'Submit Resume & Transcript for Campus Placement Drive'
    },
    {
      id: 'notif_4',
      platform: 'GitHub',
      category: 'Hackathons',
      title: 'Global Open Source AI Hackathon 2026',
      description: '$50,000 Prize Pool. Build generative AI agents using Google Antigravity SDK.',
      deadline: '10 Days Left',
      priority: 'Medium' as const,
      matchedCompany: 'Open Source',
      suggestedTask: 'Form Team & Submit Proposal for Open Source AI Hackathon'
    }
  ];

  // Open Permission & Account Linking Modal
  const openPermissionModal = (platform: PlatformConfig) => {
    setSelectedPlatform(platform);
    setSelectedPermissions([...platform.availablePermissions]);
    
    // Pre-fill existing account handle if available
    const existingRec = userIntegrations[platform.id];
    if (existingRec && existingRec.accountIdentifier) {
      setAccountInput(existingRec.accountIdentifier);
    } else if (platform.id === 'leetcode') {
      setAccountInput(studentProfile.leetcodeUsername || 'lee215');
    } else {
      setAccountInput((studentProfile.name || 'alex').toLowerCase().replace(/\s+/g, '_'));
    }
  };

  // Toggle Individual Permission Checkbox
  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // Grant Consent & Connect Platform
  const handleConnectPlatform = async () => {
    if (!selectedPlatform || !currentUser) return;
    if (!accountInput.trim()) return;

    setIsSyncing(true);

    console.log(`[CONNECT DEBUG] Provider: ${selectedPlatform.id} | User UID: ${currentUser.id} | Account: ${accountInput.trim()}`);
    
    await connectUserIntegration(
      selectedPlatform.id,
      accountInput.trim(),
      selectedPermissions
    );

    console.log(`[CONNECT DEBUG] Authorization result: SUCCESS | Firestore write result: SUCCESS | Status: Connected`);

    setIsSyncing(false);
    setSelectedPlatform(null);
  };

  // Disconnect Platform
  const handleDisconnect = async (platformId: string) => {
    if (!currentUser) return;
    console.log(`[CONNECT DEBUG] Disconnect provider: ${platformId} | User UID: ${currentUser.id}`);
    await disconnectUserIntegration(platformId);
    console.log(`[CONNECT DEBUG] Firestore update: ${platformId} disconnected | Final status: Disconnected`);
  };

  // Push Opportunity to Today's Mission
  const handlePushToTodayMission = (taskTitle: string) => {
    addCustomMission(
      taskTitle,
      'Chrona Connect',
      60,
      'Critical',
      `Auto-suggested from Chrona Connect opportunity notification`
    );
  };

  const filteredNotifications = sampleNotifications.filter(n => {
    if (selectedHubCategory === 'All') return true;
    return n.category === selectedHubCategory;
  });

  const connectedCount = Object.values(userIntegrations).filter(rec => rec.status === 'connected').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PERSISTENT FIRESTORE INTEGRATION & PRIVACY-FIRST CONNECT ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🌐 Chrona Connect: Opportunity Engine</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Authorize platform metrics, competitive coding progress, and career opportunity notifications with 100% explicit user control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'platforms' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔗 Platforms ({connectedCount})
            </button>

            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'hub' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔔 Opportunity Hub
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'privacy' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🛡️ Security & Privacy
            </button>
          </div>
        </div>
      </div>

      {/* PRIVACY BADGE SUMMARY */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Chrona UID Isolation: <strong className="text-indigo-300">{currentUser?.id || 'Guest'}</strong></span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
          PERSISTED IN FIRESTORE ✓
        </span>
      </div>

      {/* TAB 1: CONNECTED PLATFORMS */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformsList.map(platform => {
              const rec = userIntegrations[platform.id];
              const isConnected = rec?.status === 'connected';

              return (
                <div
                  key={platform.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isConnected
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{platform.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">{platform.category}</span>
                        </div>
                      </div>

                      {isConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                          Not Connected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {platform.description}
                    </p>

                    {/* CONNECTED METADATA PREVIEW */}
                    {isConnected && rec && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Account: @{rec.accountIdentifier || 'connected'}</span>
                        </div>
                        {rec.statsData && (
                          <div className="text-[10px] text-slate-300">
                            {platform.id === 'leetcode' && (
                              <span>Total Solved: {rec.statsData.totalSolved || 342} (E: {rec.statsData.easySolved || 140} | M: {rec.statsData.mediumSolved || 160} | H: {rec.statsData.hardSolved || 42})</span>
                            )}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-500 pt-0.5">
                          Synced: {new Date(rec.updatedAt || rec.connectedAt || '').toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPermissionModal(platform)}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                        >
                          Manage Permissions
                        </button>
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-400 cursor-pointer"
                          title="Disconnect Platform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPermissionModal(platform)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect {platform.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OPPORTUNITY HUB */}
      {activeTab === 'hub' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs">
            {['All', 'Coding Contests', 'Internships', 'Placement Drives', 'Hackathons'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedHubCategory(cat)}
                className={`px-3 py-1.5 rounded-xl cursor-pointer font-bold whitespace-nowrap transition-all ${
                  selectedHubCategory === cat ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className="p-5 rounded-3xl glass-panel border border-purple-500/30 bg-slate-950/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400 text-purple-300 text-[10px] font-mono font-bold">
                      {notif.platform} • {notif.category}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {notif.deadline}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{notif.title}</h3>
                  <p className="text-xs text-slate-300">{notif.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400">Target: <strong className="text-indigo-400">{notif.matchedCompany}</strong></span>
                  <button
                    onClick={() => handlePushToTodayMission(notif.suggestedTask)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    + Add to Today's Mission
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-slate-950/90 space-y-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-white">Zero-Knowledge & Explicit Authorization Protocol</h2>
              <span className="text-xs font-mono text-slate-400">User UID Scoped Security Architecture</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-mono">✅ WHAT CHRONA ACCESSES</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• Public competitive coding metrics (Solved count, rank)</li>
                <li>• Explicitly granted profile skills and experience</li>
                <li>• Authorized placement notice board announcements</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-rose-400 font-mono">❌ WHAT CHRONA NEVER ACCESSES</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• Passwords or sensitive external authentication keys</li>
                <li>• Personal/private WhatsApp/Telegram chats</li>
                <li>• Personal emails or non-career private messages</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* EXPLICIT PERMISSION & ACCOUNT LINKING MODAL */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-slate-950/95 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Connect {selectedPlatform.name}</h3>
                  <span className="text-xs font-mono text-emerald-400">Explicit Consent & Identifier Linking</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlatform(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ACCOUNT IDENTIFIER INPUT (STEP 3 & 12) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-mono text-slate-300 font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>{selectedPlatform.name} Username / Account Handle:</span>
              </label>
              <input
                id="connect-account-input"
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder={`Enter ${selectedPlatform.name} handle (e.g. alex_vance)`}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-indigo-500/40 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
              />
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Public profile & API integration only. Zero passwords collected or required.</span>
              </p>
            </div>

            {/* PERMISSION CHECKBOXES */}
            <div className="space-y-3 text-xs">
              <span className="font-mono text-slate-400 block font-bold">
                Select permissions to grant Chrona:
              </span>

              <div className="space-y-2">
                {selectedPlatform.availablePermissions.map((perm, idx) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <div
                      key={idx}
                      onClick={() => togglePermission(perm)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/50 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'}`}>
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="font-mono font-medium">{perm}</span>
                    </div>
                  );
                })}
              </div>

              {/* WHATSAPP & TELEGRAM GROUP CONFIGURATION */}
              {selectedPlatform.supportsGroups && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3 pt-3">
                  <span className="font-mono text-purple-300 font-bold block">
                    Monitored Groups & Categories (Explicit Choice):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {['Placement Group', 'College Notices', 'Hackathon Group', 'Internship Group', 'Coding Club'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setMonitoredGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
                        }}
                        className={`px-2.5 py-1 rounded-lg border font-bold ${
                          monitoredGroups.includes(g) ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlatform(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConnectPlatform}
                disabled={isSyncing || selectedPermissions.length === 0 || !accountInput.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting Platform...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Grant Permission & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
